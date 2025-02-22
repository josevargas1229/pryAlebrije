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
    },
    colorHex: {
        type: DataTypes.STRING(7),
        allowNull: false,
        validate: {
            is: /^#([0-9A-Fa-f]{6})$/
        }
    }
}, {
    tableName: 'colores_productos',
    timestamps: false
});

module.exports = ColorProducto;
