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
  producto_talla_color_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'productos_tallas_colores', key: 'id' }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  }
}, {
  tableName: 'detalle_venta',
  timestamps: false
});

module.exports = DetalleVenta;