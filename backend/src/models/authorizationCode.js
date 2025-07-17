const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuthorizationCode = sequelize.define('AuthorizationCode', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  client_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'authorization_codes',
  timestamps: false
});

module.exports = AuthorizationCode;