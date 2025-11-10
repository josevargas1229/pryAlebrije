const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { Participacion, Premio, CuponUsuario } = require('../models/associations');

function rangoFechas(query) {
  let { from, to } = query;

  const hoy = new Date();
  if (!to) {
    to = new Date(hoy);
  } else {
    to = new Date(to);
  }

  if (!from) {
    const d = new Date(to);
    d.setDate(d.getDate() - 29); // últimos 30 días
    from = d;
  } else {
    from = new Date(from);
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  return { from, to };
}

module.exports = {
  async resumen(req, res) {
    try {
      const { from, to } = rangoFechas(req.query);

      // Participaciones: usamos created_at
      const wherePart = { created_at: { [Op.between]: [from, to] } };

      const [
        girosTotales,
        girosPorDia,
        premiosTop,
        cuponesUsados,
        cuponesPorDia
      ] = await Promise.all([
        // total giros
        Participacion.count({ where: wherePart }),

        // giros por día
        Participacion.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('created_at')), 'dia'],
            [sequelize.fn('COUNT', '*'), 'giros']
          ],
          where: wherePart,
          group: [sequelize.fn('DATE', sequelize.col('created_at'))],
          order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
        }),

        // premios más usados
        Participacion.findAll({
          attributes: [
            'premio_id',
            [sequelize.fn('COUNT', '*'), 'veces']
          ],
          include: [{ model: Premio, as: 'premio', attributes: ['nombre'] }],
          where: wherePart,
          group: ['premio_id', 'premio.id', 'premio.nombre'],
          order: [[sequelize.literal('veces'), 'DESC']],
          limit: 5
        }),

        // cupones usados (estado = 'usado', fecha usado_en)
        CuponUsuario.count({
          where: {
            estado: 'usado',
            usado_en: { [Op.between]: [from, to] }
          }
        }),

        CuponUsuario.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('usado_en')), 'dia'],
            [sequelize.fn('COUNT', '*'), 'usados']
          ],
          where: {
            estado: 'usado',
            usado_en: { [Op.between]: [from, to] }
          },
          group: [sequelize.fn('DATE', sequelize.col('usado_en'))],
          order: [[sequelize.fn('DATE', sequelize.col('usado_en')), 'ASC']]
        })
      ]);

      res.json({
        rango: {
          from: from.toISOString(),
          to: to.toISOString()
        },
        resumen: {
          girosTotales,
          cuponesUsados
        },
        girosPorDia: girosPorDia.map(r => ({
          dia: r.get('dia'),
          giros: Number(r.get('giros'))
        })),
        premiosTop: premiosTop.map(r => ({
          premioId: r.premio_id,
          nombre: r.premio ? r.premio.nombre : `#${r.premio_id}`,
          veces: Number(r.get('veces'))
        })),
        cuponesPorDia: cuponesPorDia.map(r => ({
          dia: r.get('dia'),
          usados: Number(r.get('usados'))
        }))
      });
    } catch (e) {
      console.error('Error en reportesGamificacion.resumen', e);
      res.status(500).json({ message: 'Error al obtener reportes de gamificación', error: e.message });
    }
  }
};
