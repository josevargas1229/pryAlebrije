const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Talla = sequelize.define('Talla', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    talla: { type: DataTypes.STRING(50), allowNull: false }
}, { tableName: 'tallas_productos', timestamps: false });
module.exports = Talla;