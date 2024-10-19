const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConfiguracionSistema = sequelize.define('ConfiguracionSistema', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    max_intentos_login: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        validate: {
            min: 1,
            max: 10
        }
    },
    tiempo_bloqueo_minutos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        validate: {
            min: 1
        }
    }
}, {
    tableName: 'configuracion_sistema',
    timestamps: false
});

module.exports = ConfiguracionSistema;