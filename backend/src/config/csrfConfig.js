const { doubleCsrf } = require('csrf-csrf');
require('dotenv').config();
const doubleCsrfOptions = {
    getSecret: () => 'yourSecretKey', // Configura una clave secreta para generar el token
    cookieName: 'x-csrf-token', // Nombre de la cookie que almacenará el token CSRF
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Usa cookies seguras en producción
        sameSite: 'Strict',
    },
    size: 64, // Tamaño del token CSRF
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], // Métodos ignorados por la protección CSRF
    getTokenFromRequest: (req) => req.headers["x-csrf-token"],
};

const {
    invalidCsrfTokenError, // Error en caso de que el token CSRF sea inválido
    generateToken, // Genera el token CSRF
    doubleCsrfProtection, // Middleware de protección CSRF
} = doubleCsrf(doubleCsrfOptions);

module.exports = {
    invalidCsrfTokenError,
    generateToken,
    doubleCsrfProtection,
};
