const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Premio = sequelize.define('Premio', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(128), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  dias_vigencia: { type: DataTypes.INTEGER, allowNull: true },
  vence_el: { type: DataTypes.DATE, allowNull: true },
  cantidad_a_descontar: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
  cantidad_minima: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
  requiere_cupon: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
}, { tableName: 'premios', timestamps: false });

module.exports = Premio;
