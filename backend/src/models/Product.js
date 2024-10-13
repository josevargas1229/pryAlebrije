/* This code snippet is defining a Sequelize model for a `Product` entity in a Node.js application.
Here's a breakdown of what each part of the code is doing: */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'productos',
    timestamps: false
});

module.exports = Product;