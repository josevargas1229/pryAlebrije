const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RuletaHistorial = sequelize.define('RuletaHistorial', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ruleta_id: { type: DataTypes.INTEGER, allowNull: false },
  imagen_ruleta: { type: DataTypes.STRING(512), allowNull: false },
  imagen_background: { type: DataTypes.STRING(512), allowNull: false },
  modificado_por: { type: DataTypes.INTEGER, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
}, { tableName: 'ruleta_historial', timestamps: false });

module.exports = RuletaHistorial;
