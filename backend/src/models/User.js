const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Rol = require('./Rol');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            is: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
        }
    },
    apellido_paterno: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            is: /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/
        }
    },
    apellido_materno: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            is: /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    telefono: {
        type: DataTypes.STRING(15),
        unique: true,
        validate: {
            is: /^[0-9+]+$/
        }
    },
    rol_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Rol,
            key: 'id'
        }
    }
}, {
    tableName: 'usuarios',
    timestamps: false
});

module.exports = User;
