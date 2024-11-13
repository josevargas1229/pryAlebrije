const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LegalDocument = sequelize.define('LegalDocument', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contenido_html: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  vigente: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  eliminado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  version: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: false,
    defaultValue: 1.0,
  },
  modificado_por: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: false,
});

module.exports = LegalDocument;
