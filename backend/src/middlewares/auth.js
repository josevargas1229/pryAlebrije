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
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // No token provided

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token invalid or verification failed
        req.user = user; // Save the decoded user in the request object
        next(); // Proceed to the next middleware
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