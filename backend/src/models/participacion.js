const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Participacion = sequelize.define('Participacion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  ruleta_id: { type: DataTypes.INTEGER, allowNull: false },
  premio_id: { type: DataTypes.INTEGER, allowNull: true },
  cupon_usuario_id: { type: DataTypes.INTEGER, allowNull: true },
  resultado: { type: DataTypes.STRING(32), allowNull: false }, // 'gano_premio' | 'sin_premio'
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
}, { tableName: 'participaciones', timestamps: false });

module.exports = Participacion;
