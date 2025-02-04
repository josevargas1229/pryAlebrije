const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Temporada = sequelize.define('Temporada', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    temporada: { type: DataTypes.STRING(50), allowNull: false }
}, { tableName: 'temporadas_productos', timestamps: false });
module.exports = Temporada;