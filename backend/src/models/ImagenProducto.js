// models/ImagenProducto.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImagenProducto = sequelize.define('ImagenProducto', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    producto_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    imagen_url: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
    },
    color_id: { 
        type: DataTypes.INTEGER, 
        allowNull: null
    }
}, { 
    tableName: 'imagenes_producto', 
    timestamps: false 
});

module.exports = ImagenProducto;