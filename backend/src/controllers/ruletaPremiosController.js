// controllers/ruletaPremiosController.js
const sequelize = require('../config/database');
const { Ruleta, Premio, RuletaPremio } = require('../models/associations');
const { UniqueConstraintError } = require('sequelize');

const toNum = v => (v == null ? null : Number(v));

async function validarSuma(ruletaId, t) {
  const segmentos = await RuletaPremio.findAll({
    where: { ruleta_id: ruletaId, activo: true },
    transaction: t, lock: t.LOCK.UPDATE
  });
  const total = segmentos.reduce((s, r) => s + Number(r.probabilidad_pct), 0);
  if (total > 100) {
    const err = new Error('La suma de probabilidades supera 100%');
    err.status = 400; throw err;
  }
}

module.exports = {
  async listByRuleta(req, res) {
    try {
      const { ruletaId } = req.params;
      const rows = await RuletaPremio.findAll({
        where: { ruleta_id: ruletaId },
        include: [{ model: Premio, as: 'premio' }],
        order: [['id','ASC']]
      });
      res.json(rows);
    } catch (e) {
      res.status(500).json({ message: 'Error al listar segmentos', error: e.message });
    }
  },


  async addSegmento(req, res) {
    const t = await sequelize.transaction();
    try {
      const { ruletaId } = req.params;
      const premio_id = toNum(req.body.premio_id);
      const prob = toNum(req.body.probabilidad_pct);
      const activo = req.body.activo == null ? true : !!req.body.activo;

      if (!premio_id) return res.status(400).json({ message: 'premio_id requerido' });
      if (prob == null || isNaN(prob)) return res.status(400).json({ message: 'probabilidad_pct requerida' });
      if (prob < 0 || prob > 100) return res.status(400).json({ message: 'probabilidad_pct fuera de [0,100]' });

      const ruleta = await Ruleta.findByPk(ruletaId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!ruleta) { await t.rollback(); return res.status(404).json({ message: 'Ruleta no encontrada' }); }

      const premio = await Premio.findByPk(premio_id, { transaction: t });
      if (!premio) { await t.rollback(); return res.status(404).json({ message: 'Premio no encontrado' }); }

      const creado = await RuletaPremio.create({
        ruleta_id: Number(ruletaId),
        premio_id,
        probabilidad_pct: prob,
        activo,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction: t });

      if (activo) await validarSuma(ruletaId, t);

      await t.commit();
      res.status(201).json(creado);
    } catch (e) {
      await sequelize.transaction(async () => {});
      await sequelize.query('');
      await t.rollback();
      if (e instanceof UniqueConstraintError)
        return res.status(409).json({ message: 'El premio ya está asociado a esta ruleta' });
      res.status(e.status || 500).json({ message: e.message || 'Error' });
    }
  },


  async updateSegmento(req, res) {
    const t = await sequelize.transaction();
    try {
      const { ruletaId, id } = req.params;
      const prob = req.body.probabilidad_pct != null ? Number(req.body.probabilidad_pct) : undefined;
      const activo = req.body.activo;

      if (prob != null && (isNaN(prob) || prob < 0 || prob > 100))
        return res.status(400).json({ message: 'probabilidad_pct fuera de [0,100]' });

      const seg = await RuletaPremio.findOne({
        where: { id, ruleta_id: ruletaId },
        transaction: t, lock: t.LOCK.UPDATE
      });
      if (!seg) { await t.rollback(); return res.status(404).json({ message: 'Segmento no encontrado' }); }

      if (prob != null) seg.probabilidad_pct = prob;
      if (activo != null) seg.activo = !!activo;
      seg.updated_at = new Date();
      await seg.save({ transaction: t });

      if (seg.activo) await validarSuma(ruletaId, t);

      await t.commit();
      res.json(seg);
    } catch (e) {
      await t.rollback();
      res.status(e.status || 500).json({ message: e.message || 'Error' });
    }
  },


  async removeSegmento(req, res) {
    const t = await sequelize.transaction();
    try {
      const { ruletaId, id } = req.params;
      const seg = await RuletaPremio.findOne({
        where: { id, ruleta_id: ruletaId },
        transaction: t, lock: t.LOCK.UPDATE
      });
      if (!seg) { await t.rollback(); return res.status(404).json({ message: 'Segmento no encontrado' }); }

      await seg.destroy({ transaction: t });
      await t.commit();
      res.status(204).end();
    } catch (e) {
      await t.rollback();
      res.status(500).json({ message: 'Error al eliminar segmento', error: e.message });
    }
  }
};
