const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleVenta = sequelize.define('DetalleVenta', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  venta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'ventas', key: 'id' }
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  talla_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  color_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  }
}, {
  tableName: 'detalle_venta',
  timestamps: false
});

module.exports = DetalleVenta;
