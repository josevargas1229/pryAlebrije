const sequelize = require('../config/database');
const { Premio } = require('../models/associations');
const { UniqueConstraintError } = require('sequelize');

module.exports = {
  async list(req, res) {
    try {
      const rows = await Premio.findAll({ order: [['id','ASC']] });
      res.json(rows);
    } catch (e) {
      res.status(500).json({ message: 'Error al listar premios', error: e.message });
    }
  },

  async get(req, res) {
    try {
      const row = await Premio.findByPk(req.params.id);
      if (!row) return res.status(404).json({ message: 'Premio no encontrado' });
      res.json(row);
    } catch (e) {
      res.status(500).json({ message: 'Error al obtener premio', error: e.message });
    }
  },

  async create(req, res) {
    const t = await sequelize.transaction();
    try {
      const {
        nombre, descripcion, dias_vigencia, vence_el,
        cantidad_a_descontar, cantidad_minima,
        requiere_cupon = true, activo = true
      } = req.body;

      if (!nombre) return res.status(400).json({ message: 'nombre requerido' });
      if (cantidad_a_descontar == null) return res.status(400).json({ message: 'cantidad_a_descontar requerida' });
      if (cantidad_minima == null) return res.status(400).json({ message: 'cantidad_minima requerida' });

      const created = await Premio.create({
        nombre, descripcion, dias_vigencia, vence_el,
        cantidad_a_descontar, cantidad_minima,
        requiere_cupon, activo,
        created_at: new Date(), updated_at: new Date()
      }, { transaction: t });

      await t.commit();
      res.status(201).json(created);
    } catch (e) {
      await t.rollback();
      if (e instanceof UniqueConstraintError) return res.status(409).json({ message: 'Premio duplicado' });
      res.status(500).json({ message: 'Error al crear premio', error: e.message });
    }
  },

  async update(req, res) {
    const t = await sequelize.transaction();
    try {
      const row = await Premio.findByPk(req.params.id, { transaction: t });
      if (!row) { await t.rollback(); return res.status(404).json({ message: 'Premio no encontrado' }); }

      await row.update({ ...req.body, updated_at: new Date() }, { transaction: t });
      await t.commit();
      res.json(row);
    } catch (e) {
      await t.rollback();
      res.status(500).json({ message: 'Error al actualizar premio', error: e.message });
    }
  },

  async remove(req, res) {
    const t = await sequelize.transaction();
    try {
      const row = await Premio.findByPk(req.params.id, { transaction: t });
      if (!row) { await t.rollback(); return res.status(404).json({ message: 'Premio no encontrado' }); }

      await row.destroy({ transaction: t }); // si prefieres inactivar: await row.update({ activo:false }, { transaction:t })
      await t.commit();
      res.status(204).end();
    } catch (e) {
      await t.rollback();
      res.status(500).json({ message: 'Error al eliminar premio', error: e.message });
    }
  }
};
