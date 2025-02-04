const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TipoProducto = sequelize.define('TipoProducto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false }
}, { tableName: 'tipo_producto', timestamps: false });
module.exports = TipoProducto;