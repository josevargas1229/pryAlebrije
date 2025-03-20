const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialActividades = sequelize.define('HistorialActividades', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    modulo: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' }
    },
    accion: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    detalle: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'historial_actividades',
    timestamps: false
});

module.exports = HistorialActividades;