const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ventas = sequelize.define('Venta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    empleado_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    fecha_venta: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    direccion_id: {
      type: DataTypes.INTEGER,
      allowNull: true,  //  Permitir valores nulos si no siempre se proporciona una dirección
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pendiente' // pendiente, enviado, entregado, cancelado
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    metodo_pago: {
        type: DataTypes.STRING,
        allowNull: true
    },
    recoger_en_tienda: {  // ✅ Corrección: Agregado para reflejar el campo en la BD
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'ventas',
    timestamps: false
});

module.exports = Ventas;
