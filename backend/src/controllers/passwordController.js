const fs = require('fs');
const path = require('path');
const VerificationCode = require('../models/VerificationCode');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const PassHistory = require('../models/PasswordHistory');
const Account = require('../models/Account');
const EmailTemplate = require('../models/EmailTemplate');

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

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
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
    return Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
}
exports.sendVerificationCode = async (req, res) => {
    const { email, tipo_id = 1 } = req.body; // Usar tipo_id para referenciar la plantilla
    if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
    }

    const code = generateCode();
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

        // 5. Crear el código de verificación asociado a la cuenta
        await VerificationCode.create({
            account_id: account.id,
            code,
            expiresAt,
            tipo:'pass_recovery',
            usado: false
        });

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

        // Buscamos el código de verificación
        const verificationRecord = await VerificationCode.findOne({
            where: {
                account_id: account.id,
                code,
                tipo,
                usado: false
            }
        });

        // Si no se encuentra el registro de verificación
        if (!verificationRecord) {
            return res.status(400).json({ error: 'Código incorrecto o no existe' });
        }

        // Verifica si el código ha expirado
        if (verificationRecord.expiresAt < new Date()) {
            return res.status(400).json({ error: 'El código ha expirado' });
        }

        // Marca el código como usado
        verificationRecord.usado = true;
        await verificationRecord.save();

        // Si todo es correcto, responde con éxito
        res.json({ message: 'Código verificado con éxito' });
    } catch (error) {
        console.error('Error al verificar el código:', error);
        return res.status(500).json({ error: 'Error interno al verificar el código' });
    }
};

exports.changePassword = async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword ) {
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
