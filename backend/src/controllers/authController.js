/* This JavaScript code snippet is defining two functions: `login` and `changePassword`, which are part
of an authentication system. Here is a breakdown of what each function does: */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Account, PassHistory, IntentoFallido } = require('../models/associations');
const { Op } = require('sequelize');

/* The `exports.login` function is a part of an authentication system in a Node.js application. Here is
a breakdown of what this function does: */
exports.login = async (req, res, next) => {
    try {
        const { email, contraseña } = req.body.credenciales;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Busca al usuario y su cuenta asociada
        const user = await User.findOne({ 
            where: { email },
            include: [{ model: Account, attributes: ['id', 'nombre_usuario', 'contraseña_hash', 'bloqueada'] }]
        });

        // Si no se encuentra el usuario, responde con un error
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Verifica si la cuenta está bloqueada
        if (user.Account.bloqueada) {
            return res.status(403).json({ message: 'Cuenta bloqueada debido a demasiados intentos fallidos.' });
        }

        const maxIntentosFallidos = 5;
        const intentosFallidos = await IntentoFallido.count({
            where: {
                user_id: user.id,
                fecha: {
                    [Op.gte]: new Date(Date.now() - 60 * 60 * 1000) // Contar intentos en la última hora
                }
            }
        });

        if (intentosFallidos >= maxIntentosFallidos) {
            // Bloquear la cuenta si supera el límite de intentos fallidos
            await user.Account.update({ bloqueada: true });
            return res.status(403).json({ message: 'Cuenta bloqueada debido a demasiados intentos fallidos.' });
        }

        // Compara la contraseña ingresada con la contraseña almacenada
        const isMatch = await bcrypt.compare(contraseña, user.Account.contraseña_hash);
        if (!isMatch) {
            await IntentoFallido.create({
                user_id: user.id,
                ip: ip,
                fecha: new Date()
            });
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Si el inicio de sesión es exitoso, puedes restablecer intentos fallidos (opcional)
        await IntentoFallido.destroy({ where: { user_id: user.id } }); // Limpiar intentos fallidos

        // Generar el token de autenticación
        const token = jwt.sign(
            { userId: user.id, tipo: user.tipo_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000
        });

        // Responder con los datos del usuario (sin el token)
        res.json({ userId: user.id, tipo: user.tipo_usuario });
    } catch (error) {
        next(error);
    }
};

/* The `exports.changePassword` function is a part of an authentication system in a Node.js
application. Here is a breakdown of what this function does: */
exports.changePassword = async (req, res, next) => {
    try {
        const { contraseña_actual, nueva_contraseña } = req.body;
        const account = await Account.findOne({ where: { usuario_id: req.user.userId } });

        if (!account) {
            return res.status(404).json({ message: 'Cuenta no encontrada' });
        }

        const isMatch = await bcrypt.compare(contraseña_actual, account.contraseña_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        }

        const hashedPassword = await bcrypt.hash(nueva_contraseña, 10);
        await account.update({ contraseña_hash: hashedPassword });

        await PassHistory.create({
            cuenta_id: account.id,
            contraseña_hash: hashedPassword
        });

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        next(error);
    }
};
exports.checkAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }

        const user = await User.findOne({
            where: { id: decoded.userId },
            include: [{ 
                model: Account, 
                attributes: ['id', 'nombre_usuario', 'bloqueada']
            }],
            attributes: ['id', 'email', 'tipo_usuario']
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.Account.bloqueada) {
            return res.status(403).json({ message: 'Cuenta bloqueada' });
        }

        // Renovar el token si está cerca de expirar (opcional)
        const expirationThreshold = 15 * 60; // 15 minutos en segundos
        if (decoded.exp - (Date.now() / 1000) < expirationThreshold) {
            const newToken = jwt.sign(
                { userId: user.id, tipo: user.tipo_usuario },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.cookie('token', newToken, {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 3600000
            });
        }

        res.json({
            userId: user.id,
            email: user.email,
            tipo: user.tipo_usuario,
            nombreUsuario: user.Account.nombre_usuario
        });
    } catch (error) {
        next(error);
    }
};
exports.logout = (req, res, next) => {
    try {
        // Limpiar la cookie del token para cerrar la sesión del usuario
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        next(error); // Manejador de errores genérico para errores inesperados
    }
};
