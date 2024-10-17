const fs = require('fs');
const path = require('path');
const VerificationCode = require('../models/VerificationCode');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

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
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60000); // El código expira en 10 minutos

    try {
        await VerificationCode.create({ email, code, expiresAt });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Código de Verificación',
            text: `Tu código de verificación es: ${code}`,
            html: `<strong>Tu código de verificación es: ${code}</strong>`
        };

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
  const { email, code } = req.body;

  // Verifica si ambos campos están presentes
  if (!email || !code) {
      return res.status(400).json({ error: 'Email y código son requeridos' });
  }

  try {
      const verificationRecord = await VerificationCode.findOne({ where: { email, code } }); // Asegúrate de que esto coincide con tu modelo

      // Si no se encuentra el registro de verificación
      if (!verificationRecord) {
          return res.status(400).json({ error: 'Código incorrecto o no existe' });
      }

      // Verifica si el código ha expirado
      if (verificationRecord.expiresAt < new Date()) {
          return res.status(400).json({ error: 'El código ha expirado' });
      }

      // Si todo es correcto, responde con éxito
      res.json({ message: 'Código verificado con éxito' });
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
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const isCompromised = passwordList.has(newPassword);
        if (isCompromised) {
            return res.status(400).json({ error: 'La nueva contraseña ha sido filtrada. Por favor, elige una más segura.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        res.status(500).json({ error: 'Ocurrió un error al cambiar la contraseña' });
    }
};
