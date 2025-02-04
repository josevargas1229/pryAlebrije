const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CalificacionProducto = sequelize.define('CalificacionProducto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    calificacion: { type: DataTypes.TINYINT, allowNull: false }
}, { tableName: 'calificaciones_producto', timestamps: false });
module.exports = CalificacionProducto;