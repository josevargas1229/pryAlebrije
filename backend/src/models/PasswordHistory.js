/* This JavaScript code snippet is defining a Sequelize model called `PassHistory` for a table named
`historialPass` in a database. Here's a breakdown of what each part of the code is doing: */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PassHistory = sequelize.define('PassHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    account_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    contraseña_hash: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fecha_cambio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'historialPass',
    timestamps: false
});

module.exports = PassHistory;