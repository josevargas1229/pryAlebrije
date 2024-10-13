/* This code snippet is defining a Sequelize model for a table named 'roles' in a database. Here's a
breakdown of what each part does: */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('Rol', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rol: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'roles',
    timestamps: false
});


module.exports = Rol;