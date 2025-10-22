const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { Ruleta, RuletaPremio, Premio, Participacion, CuponUsuario, IntentoUsuario } = require('../models/associations');
const { generateCouponCode } = require('../utils/coupons');
const { errorLogger } = require('../config/logger');

// Función para seleccionar un premio según probabilidad
const pickWeighted = (items) => {
  const total = items.reduce((s, i) => s + Number(i.probabilidad_pct), 0);
  if (total <= 0) return null;
  const r = Math.random() * total;
  let acc = 0;
  for (const it of items) {
    acc += Number(it.probabilidad_pct);
    if (r <= acc) return it;
  }
  return null;
};

// Cálculo de fecha de expiración
const calcExpiry = (premio) => {
  if (premio.vence_el) return premio.vence_el;
  const dias = premio.dias_vigencia != null ? Number(premio.dias_vigencia) : 30;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dias);
  return d;
};

// Controlador principal
exports.spin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { userId: userIdFromToken } = req.user || {};
    if (!userIdFromToken) {
      await t.rollback();
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { ruletaId } = req.params;
    const hoy = new Date().toISOString().slice(0, 10);

    //Buscar intento disponible
    const intentoDisponible = await IntentoUsuario.findOne({
      where: {
        usuario_id: userIdFromToken,
        periodo_inicio: { [Op.lte]: hoy },
        periodo_fin: { [Op.gte]: hoy },
        intentos_asignados: { [Op.gt]: sequelize.col('intentos_consumidos') }
      },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!intentoDisponible) {
      await t.rollback();
      return res.status(403).json({ error: 'No tienes intentos disponibles.' });
    }

    //Obtener ruleta activa o por ID
    const ruletaActiva = ruletaId
      ? await Ruleta.findByPk(ruletaId, { transaction: t, lock: t.LOCK.UPDATE })
      : await Ruleta.findOne({ where: { activo: true }, transaction: t, lock: t.LOCK.UPDATE });

    if (!ruletaActiva) {
      await t.rollback();
      return res.status(404).json({ error: 'No hay ruleta activa.' });
    }

    //Buscar segmentos activos con premios activos
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

    //Seleccionar ganador
    const ganador = pickWeighted(segmentos);
    let premioGanado = ganador ? ganador.premio : null;

    // Fallback si no hay premio
    if (!premioGanado) {
      premioGanado = await Premio.findOne({ where: { nombre: 'Sin Premio', activo: true }, transaction: t });
      if (!premioGanado) {
        await t.rollback();
        return res.status(404).json({ error: 'Premio por defecto no encontrado.' });
      }
    }

    const resultado = premioGanado.nombre === 'Sin Premio' ? 'sin_premio' : 'gano_premio';

    //Consumir intento
    intentoDisponible.intentos_consumidos += 1;
    await intentoDisponible.save({ transaction: t });

    //Registrar participación
    const participacion = await Participacion.create({
      usuario_id: userIdFromToken,
      ruleta_id: ruletaActiva.id,
      premio_id: premioGanado.id,
      cupon_usuario_id: null,
      resultado,
      fecha_giro: new Date()
    }, { transaction: t });

    //Generar cupón si aplica
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

      // Incrementar contador de usos del premio
      if (typeof premioGanado.increment === 'function') {
        await premioGanado.increment('usos', { transaction: t });
      }
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
  try { if (!t.finished) await t.rollback(); } catch {}

  // Log robusto: usa errorLogger si existe, si no console.error
  if (errorLogger && typeof errorLogger.error === 'function') {
    errorLogger.error(error);
  } else {
    console.error('Error en ruletaSpinController.spin:', error);
  }

  return res.status(500).json({ message: 'Error al girar ruleta', error: error.message });
}
};
