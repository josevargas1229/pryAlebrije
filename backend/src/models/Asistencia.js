const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Empleado = require('./Empleado');

const Asistencia = sequelize.define('Asistencia', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    empleado_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'empleados',
            key: 'id'
        }
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    hora_entrada: {
        type: DataTypes.TIME,
        allowNull: true
    },
    hora_salida: {
        type: DataTypes.TIME,
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('presente', 'ausente', 'permiso', 'vacaciones'),
        allowNull: false,
        defaultValue: 'presente'
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    qr_validado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false // Se actualiza a true tras escaneo QR válido
    }
}, {
    tableName: 'asistencias',
    timestamps: true // Incluye createdAt y updatedAt para auditoría
});

module.exports = Asistencia;