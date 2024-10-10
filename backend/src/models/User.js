/* This code snippet is defining a Sequelize model for a User entity in a Node.js application. Here's a
breakdown of what each part of the code is doing: */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    }
    ,
    telefono: {
        type: DataTypes.STRING(15),
        unique:true,
        validate:{
            is:/^[0-9+]+$/
        }
    },
    tipo_usuario: {
        type: DataTypes.STRING(15),
        allowNull: false,
        validate: {
            isIn: [['Cliente', 'Empleado', 'Administrador']]
        }
    }
}, {
    tableName: 'usuarios',
    timestamps: false
});


module.exports = User;