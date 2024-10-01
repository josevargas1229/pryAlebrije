/* This code snippet is a Node.js error handling middleware function. It defines an `errorHandler`
function that takes four parameters: `err`, `req`, `res`, and `next`. The purpose of this function
is to handle different types of errors that may occur in a Node.js application and send appropriate
responses back to the client. */
const { ValidationError } = require('sequelize');

const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err instanceof ValidationError) {
        return res.status(400).json({
            message: 'Error de validación',
            errors: err.errors.map(e => ({ field: e.path, message: e.message }))
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'No autorizado' });
    }

    if (err.name === 'ForbiddenError') {
        return res.status(403).json({ message: 'Acceso prohibido' });
    }

    if (err.name === 'NotFoundError') {
        return res.status(404).json({ message: 'Recurso no encontrado' });
    }

    // Para errores de base de datos u otros errores específicos de tu aplicación
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'El recurso ya existe' });
    }

    // Error por defecto
    res.status(500).json({
        message: 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
};

module.exports = errorHandler;