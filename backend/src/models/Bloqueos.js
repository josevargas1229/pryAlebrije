const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialBloqueos = sequelize.define('HistorialBloqueos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'cuentas',
            key: 'id'
        }
    },
    intentos: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fechaBloqueo: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'historial_bloqueos',
    timestamps: false
});

module.exports = HistorialBloqueos;
