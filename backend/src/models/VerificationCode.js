const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Account = require('./Account'); // Importamos el modelo Account

const VerificationCode = sequelize.define('VerificationCode', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'cuentas', // Verifica que este nombre sea correcto
            key: 'id'
        },
        onDelete: 'CASCADE', // Opcional: elimina códigos si se elimina la cuenta
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('2fa', 'recovery', 'pass_recovery', 'email_verification'),
        allowNull: false,
        defaultValue: 'email_verification'
    },
    usado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'verification_codes',
    timestamps: false
});

module.exports = VerificationCode;
