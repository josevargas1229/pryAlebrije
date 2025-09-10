const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IntentoUsuario = sequelize.define('IntentoUsuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  intento_regla_id: { type: DataTypes.INTEGER, allowNull: false },
  periodo_inicio: { type: DataTypes.DATEONLY, allowNull: false },
  periodo_fin: { type: DataTypes.DATEONLY, allowNull: false },
  intentos_asignados: { type: DataTypes.INTEGER, allowNull: false },
  intentos_consumidos: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
}, { tableName: 'intento_usuarios', timestamps: false });

module.exports = IntentoUsuario;
