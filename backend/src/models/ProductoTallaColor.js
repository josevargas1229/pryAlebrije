const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductoTallaColor = sequelize.define('ProductoTallaColor', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    talla_id: { type: DataTypes.INTEGER, allowNull: false },
    color_id: { type: DataTypes.INTEGER, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, { 
    tableName: 'productos_tallas_colores', 
    timestamps: false 
});

module.exports = ProductoTallaColor;
