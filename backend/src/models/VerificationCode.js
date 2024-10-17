const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de tener una conexión configurada

// Definir el modelo VerificationCode
const VerificationCode = sequelize.define('VerificationCode', {
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'verification_codes', // Nombre de la tabla en la base de datos
    timestamps: false // Desactiva las marcas de tiempo automáticas (createdAt, updatedAt)
});

module.exports = VerificationCode;
