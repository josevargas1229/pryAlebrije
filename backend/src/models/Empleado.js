const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de que la conexión esté correctamente configurada

const Empleado = sequelize.define('Empleado', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios', // Nombre de la tabla relacionada
            key: 'id'
        }
    },
    cargo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    fecha_contratacion: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'empleados', // Nombre de la tabla en la base de datos
    timestamps: false // Si no tienes createdAt y updatedAt en la tabla
});

module.exports = Empleado;
