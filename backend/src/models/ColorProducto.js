const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ColorProducto = sequelize.define('ColorProducto', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    color: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'colores_productos',
    timestamps: false
});

module.exports = ColorProducto;
