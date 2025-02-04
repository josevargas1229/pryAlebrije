const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Promocion = sequelize.define('Promocion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    fecha_inicio: { type: DataTypes.DATE, allowNull: false },
    fecha_fin: { type: DataTypes.DATE, allowNull: false },
    tipo: { type: DataTypes.ENUM('temporada', 'producto_especifico'), allowNull: false },
    descuento: { type: DataTypes.DECIMAL(5, 2), allowNull: false }
}, { tableName: 'promociones', timestamps: false });
module.exports = Promocion;