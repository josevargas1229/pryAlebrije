// userService.js

const { User, Account, PassHistory } = require('../models/associations');
const bcrypt = require('bcrypt');

class UserService {
    // Método para obtener todos los usuarios
    async getAllUsers() {
        try {
            return await User.findAll({
                attributes: ['id', 'nombre', 'apellido_paterno', 'apellido_materno', 'email', 'telefono', 'rol_id']
            });
        } catch (error) {
            throw new Error('Error al obtener los usuarios: ' + error.message);
        }
    }

    // Método para obtener un usuario por ID
    async getUserById(id) {
        try {
            const user = await User.findByPk(id, {
                attributes: ['id', 'nombre', 'apellido_paterno', 'apellido_materno', 'email', 'telefono', 'rol_id']
            });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        } catch (error) {
            throw new Error('Error al obtener el usuario: ' + error.message);
        }
    }

    // Método para crear un nuevo usuario
    async createUser(userData) {
        try {
            const { usuario, cuenta } = userData;

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

            return { message: 'Usuario creado exitosamente' };
        } catch (error) {
            throw new Error('Error al crear el usuario: ' + error.message);
        }
    }

    // Método para actualizar un usuario
    async updateUser(id, userData) {
        try {
            const [updated] = await User.update(userData, {
                where: { id }
            });
            if (updated) {
                return await this.getUserById(id);
            }
            throw new Error('Usuario no encontrado');
        } catch (error) {
            throw new Error('Error al actualizar el usuario: ' + error.message);
        }
    }

    // Método para eliminar un usuario
    async deleteUser(id) {
        try {
            const deleted = await User.destroy({
                where: { id }
            });
            if (!deleted) {
                throw new Error('Usuario no encontrado');
            }
            return { message: 'Usuario eliminado exitosamente' };
        } catch (error) {
            throw new Error('Error al eliminar el usuario: ' + error.message);
        }
    }

    // Método para actualizar el perfil de un usuario
    async updateProfile(userId, profileData) {
        try {
            const [updated] = await User.update(profileData, {
                where: { id: userId }
            });
            if (updated) {
                return await this.getUserById(userId);
            }
            throw new Error('Usuario no encontrado');
        } catch (error) {
            throw new Error('Error al actualizar el perfil: ' + error.message);
        }
    }
}

module.exports = new UserService();
