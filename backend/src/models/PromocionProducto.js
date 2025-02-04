const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PromocionProducto = sequelize.define('PromocionProducto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    promocion_id: { type: DataTypes.INTEGER, allowNull: false },
    producto_id: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'promociones_productos', timestamps: false });
module.exports = PromocionProducto;