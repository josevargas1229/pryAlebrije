const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Notificacion = sequelize.define('Notificacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mensaje: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('usuario', 'admin', 'sistema'),
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  leida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  tableName: 'notificaciones',
  timestamps: false
});

module.exports = Notificacion;
