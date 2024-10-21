/* This JavaScript code snippet is defining a Sequelize model for an `Account` entity. Here's a
breakdown of what each part of the code is doing: */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Account = sequelize.define('Account', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nombre_usuario: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    contraseña_hash: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    ultimo_acceso: {
        type: DataTypes.DATE
    },
    configuracion_2fa: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    bloqueada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    bloqueada_desde: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'cuentas',
    timestamps: false
});

module.exports = Account;
