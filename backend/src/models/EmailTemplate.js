const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailTemplate = sequelize.define('EmailTemplate', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    tipo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'email_types',
            key: 'id'
        }
    },
    asunto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contenido_html: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    contenido_texto: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    variables: {
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
    },
    actualizado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    }
}, {
    tableName: 'email_templates',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
});

module.exports = EmailTemplate;