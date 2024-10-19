const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailType = sequelize.define('EmailType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    variables_requeridas: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    creado_por: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    }
}, {
    tableName: 'email_types',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
});

module.exports = EmailType;