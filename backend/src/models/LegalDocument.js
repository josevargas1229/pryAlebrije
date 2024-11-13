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
  modificado_por: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: false,
});

module.exports = LegalDocument;
