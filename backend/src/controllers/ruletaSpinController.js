const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { Ruleta, RuletaPremio, Premio, Participacion, CuponUsuario, IntentoUsuario } = require('../models/associations');
const { generateCouponCode } = require('../utils/coupons');

const pickWeighted = (items) => {
  const total = items.reduce((s, i) => s + Number(i.probabilidad_pct), 0);
  if (total <= 0) return null;
  const r = Math.random() * total;
  let acc = 0;
  for (const it of items) { acc += Number(it.probabilidad_pct); if (r <= acc) return it; }
  return null;
};

const calcExpiry = (premio) => {
  if (premio.vence_el) return premio.vence_el;
  const dias = premio.dias_vigencia != null ? Number(premio.dias_vigencia) : 30;
  const d = new Date(); d.setUTCDate(d.getUTCDate() + dias);
  return d;
};

exports.spin = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { ruletaId } = req.params;
    const { userId: userIdFromToken } = req.user || {};
    if (!userIdFromToken) { await transaction.rollback(); return res.status(401).json({ message: 'No autenticado' }); }

    //Ruleta activa
    const ruleta = await Ruleta.findOne({
      where: { id: ruletaId, activo: true },
      transaction, lock: transaction.LOCK.UPDATE
    });
    if (!ruleta) { await transaction.rollback(); return res.status(404).json({ message: 'Ruleta no disponible' }); }

    //Intentos disponibles (periodo vigente)
    const hoy = new Date().toISOString().slice(0,10);
    const intento = await IntentoUsuario.findOne({
      where: {
        usuario_id: userIdFromToken,
        periodo_inicio: { [Op.lte]: hoy },
        periodo_fin: { [Op.gte]: hoy },
        intentos_asignados: { [Op.gt]: sequelize.col('intentos_consumidos') }
      },
      transaction, lock: transaction.LOCK.UPDATE
    });
    if (!intento) { await transaction.rollback(); return res.status(403).json({ message: 'Sin intentos disponibles' }); }

    //Segmentos/premios activos
    const segmentos = await RuletaPremio.findAll({
      where: { ruleta_id: ruleta.id, activo: true },
      include: [{ model: Premio, as: 'premio', where: { activo: true } }],
      transaction, lock: transaction.LOCK.UPDATE
    });
    if (!segmentos.length) { await transaction.rollback(); return res.status(409).json({ message: 'Ruleta sin segmentos activos' }); }

    const ganador = pickWeighted(segmentos);
    const premio = ganador?.premio || null;

    //Consumir intento
    intento.intentos_consumidos += 1;
    await intento.save({ transaction });

    //Registrar participación
    const participacion = await Participacion.create({
      usuario_id: userIdFromToken,
      ruleta_id: ruleta.id,
      premio_id: premio ? premio.id : null,
      cupon_usuario_id: null,
      resultado: premio ? 'gano_premio' : 'sin_premio',
      created_at: new Date()
    }, { transaction });

    //Si ganó y requiere cupón → generar único con reintentos ante duplicado
    let cupon = null;
    if (premio && premio.requiere_cupon) {
      const vence = calcExpiry(premio);
      for (let i = 0; i < 5; i++) {
        try {
          cupon = await CuponUsuario.create({
            usuario_id: userIdFromToken,
            premio_id: premio.id,
            codigo: generateCouponCode(16),
            vence_el: vence,
            estado: 'emitido',
            created_at: new Date(),
            usado_en: null
          }, { transaction });
          break;
        } catch (e) {
          if (e.name === 'SequelizeUniqueConstraintError') continue;
          throw e;
        }
      }
      if (!cupon) { await transaction.rollback(); return res.status(500).json({ message: 'No se pudo generar un código único' }); }

      participacion.cupon_usuario_id = cupon.id;
      await participacion.save({ transaction });
    }
    await transaction.commit();
    return res.status(201).json({
      resultado: participacion.resultado,
      premio: premio ? {
        id: premio.id,
        nombre: premio.nombre,
        cantidad_a_descontar: premio.cantidad_a_descontar,
        cantidad_minima: premio.cantidad_minima
      } : null,
      cupon: cupon ? {
        id: cupon.id,
        codigo: cupon.codigo,
        vence_el: cupon.vence_el,
        estado: cupon.estado,
        valor: premio.cantidad_a_descontar
      } : null
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error en spin:', error);
    return res.status(500).json({ message: 'Error en el giro', error: error.message });
  }
};
