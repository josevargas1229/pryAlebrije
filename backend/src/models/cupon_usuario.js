const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CuponUsuario = sequelize.define('CuponUsuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  premio_id: { type: DataTypes.INTEGER, allowNull: false },
  codigo: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  vence_el: { type: DataTypes.DATE, allowNull: false },
  estado: { type: DataTypes.ENUM('emitido','usado','expirado'), allowNull: false, defaultValue: 'emitido' },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
  usado_en: { type: DataTypes.DATE, allowNull: true }
}, { tableName: 'cupon_usuarios', timestamps: false });

module.exports = CuponUsuario;
