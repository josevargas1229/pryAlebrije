/* This JavaScript code snippet is defining a Sequelize model for a "Categoria" entity. Here's a
breakdown of what each part does: */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
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
    }
}, {
    tableName: 'categorias',
    timestamps: false
});

module.exports = Categoria;