const { ValidationError } = require('sequelize');
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    // Loguear el error usando Winston
    logger.error(`Error: ${err.message}`, { stack: err.stack });

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

    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'El recurso ya existe' });
    }

    res.status(500).json({
        message: 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
};

module.exports = errorHandler;
