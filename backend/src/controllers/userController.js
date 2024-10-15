/* This code snippet is a set of functions that handle CRUD operations for users in a Node.js
application. Here's a breakdown of what each function does: */
const { User, Account, PassHistory } = require('../models/associations');
const bcrypt = require('bcryptjs');

/* The `exports.getAllUsers` function is an asynchronous function that handles the retrieval of all
users from the database. It uses the `User` model to perform a `findAll` operation with specific
attributes such as `id`, `nombre`, `email`, `telefono`, and `rol_id`. If the operation is
successful, it responds with a JSON representation of the users. If an error occurs during the
operation, it forwards the error to the `next` middleware function. */
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'nombre', 'email', 'telefono', 'rol_id']
        });
        res.json(users);
    } catch (error) {
        next(error);
    }
};

/* The `exports.getUserById` function is an asynchronous function that handles the retrieval of a
specific user from the database based on the user's ID. */
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'nombre', 'email', 'telefono', 'rol_id']
        });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};

/* The `exports.createUser` function is responsible for creating a new user in the database. Here's a
breakdown of what it does: */
exports.createUser = async (req, res, next) => {
    try {
        const { usuario, cuenta } = req.body;

        const user = await User.create({
            nombre: usuario.nombre,
            apellido_paterno: usuario.apellido_paterno,
            apellido_materno: usuario.apellido_materno,
            email: usuario.email,
            telefono: usuario.telefono,
            rol_id: usuario.rol_id
        });

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
        next(error);
    }
};

/* The `exports.updateUser` function is responsible for updating an existing user in the database based
on the user's ID. Here's a breakdown of what it does: */
exports.updateUser = async (req, res, next) => {
    try {
        const { nombre, email, telefono, rol_id } = req.body;
        const [updated] = await User.update({
            nombre,
            email,
            telefono,
            rol_id
        }, {
            where: { id: req.params.id }
        });

        if (updated) {
            const updatedUser = await User.findByPk(req.params.id);
            return res.json(updatedUser);
        }
        return res.status(404).json({ message: 'Usuario no encontrado' });
    } catch (error) {
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

/* The `exports.updateProfile` function is responsible for updating the profile information of a user
in the database based on the user's ID. Here's a breakdown of what it does: */
exports.updateProfile = async (req, res, next) => {
    try {
        const { nombre, email, telefono } = req.body;
        const [updated] = await User.update({
            nombre,
            email,
            telefono
        }, {
            where: { id: req.user.userId }
        });

        if (updated) {
            const updatedUser = await User.findByPk(req.user.userId, {
                attributes: ['id', 'nombre', 'email', 'telefono', 'rol_id']
            });
            return res.json(updatedUser);
        }
        return res.status(404).json({ message: 'Usuario no encontrado' });
    } catch (error) {
        next(error);
    }
};