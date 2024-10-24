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
    type: DataTypes.BOOLEAN, // Indica si el documento está vigente o no
    defaultValue: true,
  },
  modificado_por: {
    type: DataTypes.STRING, // Guarda el nombre o ID del usuario que realizó el cambio
    allowNull: true,
  },
}, {
  timestamps: false,
});

module.exports = LegalDocument;
