const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Account, PassHistory, VerificationCode, EmailTemplate } = require('../models/associations');
const transporter = require('../config/emailConfig');
// Cargar la lista de contraseñas al iniciar el controlador
let passwordList = new Set();
fs.readFile(path.join(__dirname, '../100k-most-used-passwords-NCSC.txt'), 'utf8', (err, data) => {
    if (err) {
        console.error('Error al leer el archivo de contraseñas:', err);
        process.exit(1);
    }
    passwordList = new Set(data.split('\n').map(password => password.trim()));
    console.log('Lista de contraseñas cargada correctamente');
});

// Controlador para verificar contraseñas
exports.checkPassword = (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Debe proporcionar una contraseña' });
    }

    const isCompromised = passwordList.has(password);
    if (isCompromised) {
        return res.json({ message: 'La contraseña ha sido filtrada. Por favor, elige una más segura.' });
    } else {
        return res.json({ message: 'La contraseña no se encuentra en la lista de contraseñas expuestas.' });
    }
};

// Función para generar un código aleatorio
function generateCode() {
    const salt = bcrypt.genSaltSync(10); // Genera una sal segura
    return salt
        .replace(/[^a-zA-Z0-9]/g, '') // Elimina caracteres no alfanuméricos (como . y /)
        .substring(0, 6)              // Toma los primeros 6 caracteres
        .toUpperCase();               // Convierte a mayúsculas
}

exports.sendVerificationCode = async (req, res) => {
    const { email, tipo_id = 1 } = req.body; // Usar tipo_id para referenciar la plantilla
    if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
    }

    const code = generateCode();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60000); // El código expira en 10 minutos

    try {
        // 1. Encontrar el usuario
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'El email no está registrado' });
        }

        // 2. Encontrar la cuenta asociada
        const account = await Account.findOne({ where: { user_id: user.id } });
        if (!account) {
            return res.status(404).json({ error: 'No se encontró una cuenta asociada' });
        }

        // 3. Buscar la plantilla de correo según el tipo de correo (tipo_id)
        const emailTemplate = await EmailTemplate.findOne({ where: { tipo_id } });
        if (!emailTemplate) {
            return res.status(404).json({ error: 'No se encontró una plantilla de correo para este tipo' });
        }

        // 4. Reemplazar las variables dinámicas en el contenido de la plantilla
        const variables = { code }; // Aquí puedes agregar más variables si las tienes
        let contenidoHtml = emailTemplate.contenido_html;
        let contenidoTexto = emailTemplate.contenido_texto;

        // Reemplazar las variables en el contenido HTML y Texto
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
            contenidoHtml = contenidoHtml.replace(regex, value);
            contenidoTexto = contenidoTexto.replace(regex, value);
        }

        // 5. Verificar si ya existe un código activo del mismo tipo para la cuenta
        const existingCode = await VerificationCode.findOne({
            where: {
                account_id: account.id,
                tipo: 'pass_recovery'
            }
        });

        if (existingCode) {
                await existingCode.update({
                    code: hashedCode,
                    expiresAt,
                    usado: false
                });
        } else {
            // 6. Crear el código de verificación asociado a la cuenta si no existe
            await VerificationCode.create({
                account_id: account.id,
                code: hashedCode,
                expiresAt,
                tipo: 'pass_recovery',
                usado: false
            });
        }

        // 6. Preparar el correo con la plantilla personalizada
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: emailTemplate.asunto,
            text: contenidoTexto,
            html: contenidoHtml
        };

        // 7. Enviar el correo
        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
                return res.status(500).json({ error: 'Error al enviar el correo' });
            }
            res.json({ message: 'Código de verificación enviado' });
        });
    } catch (error) {
        console.error('Error al generar y enviar el código:', error);
        return res.status(500).json({ error: 'Error interno al procesar la solicitud' });
    }
};

exports.verifyCode = async (req, res) => {
    const { email, code, tipo = 'pass_recovery' } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'Email y código son requeridos' });
    }
    try {
        // Primero encontramos el usuario y su cuenta
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const account = await Account.findOne({ where: { user_id: user.id } });
        if (!account) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }

        // 3. Buscar el código de verificación activo (no usado y que no haya expirado)
        const verificationCode = await VerificationCode.findOne({
            where: {
                account_id: account.id,
                usado: false,
                expiresAt: { [Op.gt]: new Date() },
                tipo
            }
        });
        if (!verificationCode) {
            return res.status(404).json({ error: 'Código no válido o ha expirado' });
        }

        // 4. Comparar el código proporcionado con el hash almacenado
        const isValid = await bcrypt.compare(code, verificationCode.code);
        if (!isValid) {
            return res.status(400).json({ error: 'El código es incorrecto' });
        }

        // 5. Marcar el código como usado si es válido
        verificationCode.usado = true;
        await verificationCode.save();

        res.json({ message: 'Código verificado correctamente' });
    } catch (error) {
        console.error('Error al verificar el código:', error);
        return res.status(500).json({ error: 'Error interno al verificar el código' });
    }
};


exports.changePassword = async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email y nueva contraseña son requeridos' });
    }

    try {
        // Verifica el código primero
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const account = await Account.findOne({ where: { user_id: user.id } });
        if (!account) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }

        // Verificar si la nueva contraseña ya ha sido utilizada anteriormente
        const passwordHistory = await PassHistory.findAll({
            where: { account_id: account.id },
            order: [['fecha_cambio', 'DESC']],
            limit: 5
        });

        const passwordUsedBefore = await Promise.any(
            passwordHistory.map(async (history) => {
                return bcrypt.compare(newPassword, history.contraseña_hash);
            })
        ).catch(() => false); // Si no hay coincidencias, Promise.any lanzará error

        if (passwordUsedBefore) {
            return res.status(400).json({
                error: 'La nueva contraseña ya ha sido utilizada anteriormente. Por favor, elige una diferente.'
            });
        }

        // Verifica si la nueva contraseña está comprometida
        const isCompromised = passwordList.has(newPassword);
        if (isCompromised) {
            return res.status(400).json({ error: 'La nueva contraseña ha sido filtrada. Por favor, elige una más segura.' });
        }

        // Hashea la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        account.contraseña_hash = hashedPassword;
        await account.save();

        // Registra el cambio de contraseña en el historial
        await PassHistory.create({
            account_id: account.id,
            contraseña_hash: hashedPassword
        });

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        res.status(500).json({ error: 'Ocurrió un error al cambiar la contraseña' });
    }
};
