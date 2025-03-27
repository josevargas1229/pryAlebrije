/* This code snippet is a set of functions that handle CRUD operations for users in a Node.js
application. Here's a breakdown of what each function does: */
const sequelize = require('../config/database');
const { User, Account, PassHistory } = require('../models/associations');
const bcrypt = require('bcryptjs');
// Obtener información del usuario por ID
exports.getUserInfo = async (req, res) => {
    try {
        const userId = req.user.userId; // Obtener el ID del usuario autenticado desde el token
        const user = await User.findByPk(userId, {
            attributes: ['id', 'nombre', 'apellido_paterno', 'apellido_materno', 'email', 'telefono', 'rol_id']
        });
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la información del usuario', error: error.message });
    }
};

// Actualizar información del usuario autenticado
exports.updateUserInfo = async (req, res) => {
    try {
        const userId = req.user.id; // Obtener el ID del usuario autenticado desde el token
        const { nombre, apellido_paterno, apellido_materno, email, telefono } = req.body;

        const user = await User.findByPk(userId);
        if (user) {
            await user.update({ nombre, apellido_paterno, apellido_materno, email, telefono });
            res.status(200).json({ message: 'Información del usuario actualizada con éxito' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la información del usuario', error: error.message });
    }
};


/* The `exports.createUser` function is responsible for creating a new user in the database. Here's a
breakdown of what it does: */
function generateCode() {
    const salt = bcrypt.genSaltSync(10); // Genera una sal segura
    return salt
        .replace(/[^a-zA-Z0-9]/g, '') // Elimina caracteres no alfanuméricos (como . y /)
        .substring(0, 6)              // Toma los primeros 6 caracteres
        .toUpperCase();               // Convierte a mayúsculas
}

exports.createUser = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { usuario, cuenta } = req.body;

        // Validación básica de entrada
        if (!usuario || !cuenta || !cuenta.contraseña_hash) {
            throw new Error('Datos incompletos en la solicitud');
        }

        console.log('Datos recibidos - Usuario:', usuario);
        console.log('Datos recibidos - Cuenta:', { ...cuenta, contraseña_hash: '[oculta]' });

        // Crear el usuario
        const user = await User.create(
            {
                nombre: usuario.nombre,
                apellido_paterno: usuario.apellido_paterno,
                apellido_materno: usuario.apellido_materno,
                email: usuario.email,
                telefono: usuario.telefono,
                rol_id: usuario.rol_id || 3,
            },
            { transaction }
        );

        // Generar un nombre de usuario único
        const uniqueIdentifier = generateCode();
        const uniqueUsername = `${cuenta.nombre_usuario}_${uniqueIdentifier}`;

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(cuenta.contraseña_hash, 10);

        // Crear la cuenta
        const account = await Account.create(
            {
                user_id: user.id,
                nombre_usuario: uniqueUsername,
                contraseña_hash: hashedPassword,
            },
            { transaction }
        );

        // Registrar la contraseña en el historial
        await PassHistory.create(
            {
                account_id: account.id,
                contraseña_hash: hashedPassword,
            },
            { transaction }
        );

        // Confirmar la transacción
        await transaction.commit();

        return res.status(201).json({
            message: 'Usuario creado exitosamente',
            data: {
                userId: user.id,
                username: uniqueUsername,
            },
        });
    } catch (error) {
        await transaction.rollback();

        console.error('Error en createUser:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map((err) => ({
                field: err.path,
                message: `${err.path} debe ser único`,
            }));
            return res.status(400).json({
                message: 'Error de validación',
                errors,
            });
        }

        return next(error);
    }
};
/* The `exports.deleteUser` function is an asynchronous function that handles the deletion of a user
from the database based on the user's ID. */
exports.deleteUser = async (req, res, next) => {
    try {
        const deleted = await User.destroy({
            where: { id: req.params.id }
        });

        if (deleted) {
            return res.status(204).send();
        }
        return res.status(404).json({ message: 'Usuario no encontrado' });
    } catch (error) {
        next(error);
    }
};

// Cambiar contraseña del usuario autenticado con validación de la contraseña actual
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.userId; // Obtener el ID del usuario autenticado desde el token
        const { currentPassword, newPassword } = req.body;

        // Obtener la cuenta del usuario autenticado
        const account = await Account.findOne({ where: { user_id: userId } });

        if (!account) {
            return res.status(404).json({ message: 'Cuenta no encontrada' });
        }

        // Verificar si la contraseña actual es correcta
        const isPasswordValid = await bcrypt.compare(currentPassword, account.contraseña_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
        }

        // Hash de la nueva contraseña
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña en la cuenta y guardar un historial
        await account.update({ contraseña_hash: hashedNewPassword });
        await PassHistory.create({
            account_id: account.id,
            contraseña_hash: hashedNewPassword
        });

        res.status(200).json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar la contraseña', error: error.message });
    }
};
