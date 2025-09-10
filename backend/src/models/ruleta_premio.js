const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RuletaPremio = sequelize.define('RuletaPremio', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ruleta_id: { type: DataTypes.INTEGER, allowNull: false },
  premio_id: { type: DataTypes.INTEGER, allowNull: false },
  probabilidad_pct: { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 0.00 },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
}, { tableName: 'ruleta_premios', timestamps: false });

module.exports = RuletaPremio;
