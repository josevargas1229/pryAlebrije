const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ruleta = sequelize.define('Ruleta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  imagen_ruleta: { type: DataTypes.STRING(512), allowNull: false },
  imagen_background: { type: DataTypes.STRING(512), allowNull: false },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
}, { tableName: 'ruletas', timestamps: false });

module.exports = Ruleta;
