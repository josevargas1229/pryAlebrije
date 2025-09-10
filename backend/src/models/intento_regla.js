const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IntentoRegla = sequelize.define('IntentoRegla', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  periodo: { type: DataTypes.ENUM('semanal','mensual','custom'), allowNull: false },
  cantidad_productos_min: { type: DataTypes.INTEGER, allowNull: true },
  total_venta_min: { type: DataTypes.DECIMAL(10,2), allowNull: true },
  intentos_otorgados: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  condiciones_ext: { type: DataTypes.JSON, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
}, { tableName: 'intento_reglas', timestamps: false });

module.exports = IntentoRegla;
