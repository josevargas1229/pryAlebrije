const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Carrito = sequelize.define('Carrito', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'carrito', timestamps: false });
module.exports = Carrito;