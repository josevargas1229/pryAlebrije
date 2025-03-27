const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración del transporte de correo con Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com', // Especificamos explícitamente el host SMTP de Gmail
    port: 465,              // Puerto seguro para SSL/TLS
    secure: true,           // Forzamos el uso de SSL/TLS (HTTPS por defecto)
    auth: {
        user: process.env.EMAIL_USER, // Correo desde variables de entorno
        pass: process.env.EMAIL_PASS, // Contraseña desde variables de entorno
    },
    tls: {
        rejectUnauthorized: true, // Rechaza certificados no válidos
    },
});

// Verificación inicial del transporte
transporter.verify((error, success) => {
    if (error) {
        console.error('Error al configurar el transporte de correo:', error);
    } else {
        console.log('Transporte de correo configurado correctamente');
    }
});

module.exports = transporter;