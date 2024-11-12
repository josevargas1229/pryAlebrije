/* This code snippet is a set of functions that handle CRUD operations for users in a Node.js
application. Here's a breakdown of what each function does: */
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
exports.createUser = async (req, res, next) => {
    try {
        const { usuario, cuenta } = req.body;
        console.log(usuario)
        console.log('cuenta: ',cuenta.contraseña_hash)
        const user = await User.create({
            nombre: usuario.nombre,
            apellido_paterno: usuario.apellido_paterno,
            apellido_materno: usuario.apellido_materno,
            email: usuario.email,
            telefono: usuario.telefono,
            rol_id: usuario.rol_id
        });
        console.log(user)

        const hashedPassword = await bcrypt.hash(cuenta.contraseña_hash, 10);

        const account = await Account.create({
            user_id: user.id,
            nombre_usuario: cuenta.nombre_usuario,
            contraseña_hash: hashedPassword
        });

        await PassHistory.create({
            account_id: account.id,
            contraseña_hash: hashedPassword
        });

        res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        console.log(error)
        if (error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => {
                return { field: err.path, message: `${err.path} debe ser único` };
            });

            return res.status(400).json({
                message: 'Error de validación',
                errors: errors
            });
        }

        // Otros errores se envían al middleware de manejo de errores
        next(error);
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

