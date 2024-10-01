/* This code snippet is defining a Sequelize model named `IntentoFallido` for a table called
`intentos_fallidos` in a database. Here's a breakdown of what each part of the code is doing: */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IntentoFallido = sequelize.define('IntentoFallido', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    ip: {
        type: DataTypes.STRING(39)
    }
}, {
    tableName: 'intentos_fallidos',
    timestamps: false
});

module.exports = IntentoFallido;