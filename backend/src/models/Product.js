/* This code snippet is defining a Sequelize model for a `Product` entity in a Node.js application.
Here's a breakdown of what each part of the code is doing: */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    temporada_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tipo_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    marca_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    calificacion: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 5.00
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        onUpdate: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'productos',
    timestamps: false
});

module.exports = Producto;