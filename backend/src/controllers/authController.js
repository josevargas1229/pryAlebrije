/* This JavaScript code snippet is defining two functions: `login` and `changePassword`, which are part
of an authentication system. Here is a breakdown of what each function does: */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Account, PassHistory } = require('../models/associations');

/* The `exports.login` function is a part of an authentication system in a Node.js application. Here is
a breakdown of what this function does: */
exports.login = async (req, res, next) => {
    try {
        const { nombre_usuario, contraseña } = req.body;
        const account = await Account.findOne({ 
            where: { nombre_usuario },
            include: [{ model: User, attributes: ['id', 'tipo_usuario'] }]
        });

        if (!account) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(contraseña, account.contraseña_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { userId: account.User.id, tipo: account.User.tipo_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, userId: account.User.id, tipo: account.User.tipo_usuario });
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