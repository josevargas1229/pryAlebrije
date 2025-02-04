/* This code snippet is defining a Sequelize model for a `Product` entity in a Node.js application.
Here's a breakdown of what each part of the code is doing: */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    temporada_id: { type: DataTypes.INTEGER, allowNull: true },
    categoria_id: { type: DataTypes.INTEGER, allowNull: false },
    tipo_id: { type: DataTypes.INTEGER, allowNull: false },
    marca_id: { type: DataTypes.INTEGER, allowNull: false },
    talla_id: { type: DataTypes.INTEGER, allowNull: false },
    color_id: { type: DataTypes.INTEGER, allowNull: false },
    precio: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    estado: { type: DataTypes.BOOLEAN, defaultValue: false },
    calificacion: { type: DataTypes.DECIMAL(3, 2), defaultValue: 5.00 }
}, { tableName: 'productos', timestamps: false });

module.exports = Producto;