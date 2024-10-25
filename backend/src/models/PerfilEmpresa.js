const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PerfilEmpresa = sequelize.define('PerfilEmpresa', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    logo: {
        type: DataTypes.TEXT
    },
    slogan: {
        type: DataTypes.TEXT
    },
    direccion: {
        type: DataTypes.TEXT
    },
    telefono: {
        type: DataTypes.TEXT
    },
    email: {
        type: DataTypes.TEXT
    },
    redSocial: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'perfil_empresa',
    timestamps: false
});

module.exports = PerfilEmpresa;
