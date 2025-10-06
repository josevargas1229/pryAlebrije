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
    const { userId: userIdFromToken } = req.user || {};
    if (!userIdFromToken) { await transaction.rollback(); return res.status(401).json({ message: 'No autenticado' }); }

    const hoy = new Date().toISOString().slice(0, 10);
    const intentoDisponible = await IntentoUsuario.findOne({
      where: {
        usuario_id: userIdFromToken,
        periodo_inicio: { [Op.lte]: hoy },
        periodo_fin: { [Op.gte]: hoy },
        intentos_asignados: { [Op.gt]: sequelize.col('intentos_consumidos') }
      },
      include: [{ model: IntentoRegla, as: 'regla' }],
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!intentoDisponible) {
      await t.rollback();
      return res.status(403).json({ error: 'No tienes intentos disponibles.' });
    }

    // 2. Ruleta activa
    const ruletaActiva = await Ruleta.findOne({
      where: { activo: true },
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    if (!ruletaActiva) {
      await t.rollback();
      return res.status(404).json({ error: 'No hay ruleta activa.' });
    }

    // 3. Segmentos activos con premios activos
    const segmentos = await RuletaPremio.findAll({
      where: { ruleta_id: ruletaActiva.id, activo: true },
      include: [{ model: Premio, as: 'premio', where: { activo: true } }],
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!segmentos.length) {
      await t.rollback();
      return res.status(409).json({ error: 'Ruleta sin segmentos activos.' });
    }

    const totalProb = segmentos.reduce((sum, seg) => sum + (seg.probabilidad_pct || 0), 0);
    if (totalProb > 100) {
      await t.rollback();
      return res.status(500).json({ error: 'Probabilidades inválidas.' });
    }

    // 4. Giro aleatorio
    const ganador = pickWeighted(segmentos);
    let premioGanado = ganador ? ganador.premio : null;

    // Fallback sin premio
    if (!premioGanado) {
      premioGanado = await Premio.findOne({ where: { nombre: 'Sin Premio', activo: true }, transaction: t });
      if (!premioGanado) {
        await t.rollback();
        return res.status(404).json({ error: 'Premio por defecto no encontrado.' });
      }
    }

    const resultado = premioGanado.nombre === 'Sin Premio' ? 'sin_premio' : 'gano_premio';

    // 5. Consumir intento
    intentoDisponible.intentos_consumidos += 1;
    await intentoDisponible.save({ transaction: t });

    // 6. Registrar participación
    const participacion = await Participacion.create({
      usuario_id: userIdFromToken,
      ruleta_id: ruletaActiva.id,
      premio_id: premioGanado.id,
      cupon_usuario_id: null,
      resultado,
      fecha_giro: new Date()
    }, { transaction: t });

    // 7. Generar cupón si aplica
    let cuponGenerado = null;
    if (premioGanado && premioGanado.cantidad_a_descontar > 0 && premioGanado.activo) {
      const vence = calcExpiry(premioGanado);
      for (let i = 0; i < 5; i++) {
        try {
          cuponGenerado = await CuponUsuario.create({
            usuario_id: userIdFromToken,
            premio_id: premioGanado.id,
            codigo: generateCouponCode(16),
            vence_el: vence,
            estado: 'emitido',
            usado: false,
            cantidad_minima: premioGanado.cantidad_minima
          }, { transaction: t });
          break;
        } catch (e) {
          if (e.name === 'SequelizeUniqueConstraintError') continue;
          throw e;
        }
      }
      if (!cuponGenerado) {
        await t.rollback();
        return res.status(500).json({ error: 'No se pudo generar cupón único.' });
      }

      participacion.cupon_usuario_id = cuponGenerado.id;
      await participacion.save({ transaction: t });

      await premioGanado.increment('usos', { transaction: t });
    }

    await t.commit();

    res.json({
      exito: true,
      ruleta: { id: ruletaActiva.id, imagen_ruleta: ruletaActiva.imagen_ruleta },
      premio: {
        id: premioGanado.id,
        nombre: premioGanado.nombre,
        descripcion: premioGanado.descripcion,
        descuento: premioGanado.cantidad_a_descontar
      },
      cupon: cuponGenerado ? {
        codigo: cuponGenerado.codigo,
        vence_el: cuponGenerado.vence_el,
        estado: cuponGenerado.estado
      } : null,
      participacion_id: participacion.id,
      resultado
    });
  } catch (error) {
    await t.rollback();
    errorLogger.error(error);
    res.status(500).json({ message: 'Error al girar ruleta', error: error.message });
  }
};