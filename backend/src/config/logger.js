const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'info', // Nivel mínimo de log que se registrará
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }), // Muestra la pila de errores
        format.splat(),
        format.json()
    ),
    transports: [
        new transports.Console({ level: 'info' }), // Loguea en la consola para desarrollo
        new transports.File({ filename: 'logs/error.log', level: 'error' }), // Logs de errores
        new transports.File({ filename: 'logs/combined.log' }) // Todos los logs combinados
    ],
});

// Configuración para producción: solo se registran errores
if (process.env.NODE_ENV === 'production') {
    logger.add(new transports.Console({ format: format.simple() }));
}

module.exports = logger;
