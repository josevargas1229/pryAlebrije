/* This JavaScript code snippet is defining two functions that are commonly used in web applications
for handling authentication and authorization using JSON Web Tokens (JWT). */
const jwt = require('jsonwebtoken');
require('dotenv').config();
/**
 * The `exports.authenticateToken` function is a middleware function used for authenticating JWT tokens
 * in a Node.js application. It ensures that the request contains a valid token in the 'Authorization' header
 * before proceeding to the next middleware or route handler.
 *
 * @param {Object} req - The request object, which contains details about the HTTP request.
 * @param {Object} res - The response object, which is used to send back the desired HTTP response.
 * @param {Function} next - A callback function that moves to the next middleware or route handler.
 *
 * Steps:
 * 1. Extract the 'Authorization' header from the incoming request.
 * 2. Check if the token is present by splitting the 'Authorization' header and extracting the token part.
 *    If the token is missing, return a 401 Unauthorized status.
 * 3. Use the `jwt.verify()` method to validate the token using the secret key defined in the environment variable `JWT_SECRET`.
 *    If the token is invalid or expired, return a 403 Forbidden status.
 * 4. If the token is valid, the decoded user information is stored in `req.user`.
 * 5. Call `next()` to pass control to the next middleware or route handler.
 *
 * @returns {void}
 * 
 * Possible HTTP responses:
 * - 401 Unauthorized: If no token is provided.
 * - 403 Forbidden: If the token is invalid or cannot be verified.
 */
exports.authenticateToken = (req, res, next) => {
  // Primero intenta leer el token desde la cookie
  let token = req.cookies?.token;

  // Si no hay cookie, intenta desde el header Authorization
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }

    req.user = decoded;
    next();
  });
};



/* The `exports.authorize` function is a higher-order function that takes in an array of allowed roles
as arguments. It returns a middleware function that can be used in a Node.js application to handle
authorization based on the user's role stored in the JWT token. */
exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado' });
        }
        if (allowedRoles.includes(req.user.tipo)) {
            next();
        } else {
            res.status(403).json({ message: 'No autorizado' });
        }
    };
};

exports.verifyEmailToken = (req, res,next) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ error: 'Token es requerido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }

        req.user = decoded; // Guarda el usuario decodificado en el objeto de la solicitud
        console.log(decoded)
        next(); // Continúa con el siguiente middleware
    });
};

exports.ROLES = {
    ADMINISTRADOR: 1,
    EMPLEADO: 2,
    CLIENTE: 3
};