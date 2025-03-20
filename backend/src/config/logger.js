const { createLogger, format, transports } = require('winston');
require('dotenv').config();

// Formato personalizado para logs de auditoría
const auditFormat = format.combine(
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf(({ timestamp, level, modulo, message, usuario_id, detalle }) => {
        return JSON.stringify({
            timestamp,
            level,
            modulo,
            message,
            usuario_id,
            detalle,
        });
    })
);

// Logger para logs de auditoría
const auditLogger = createLogger({
    level: 'info',
    format: auditFormat,
    transports: [
        new transports.Console({ level: 'info' }), // Para desarrollo
        new transports.File({
            filename: 'logs/audit.log',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
        }),
    ],
});

// Logger para logs combinados (Morgan y errores)
const combinedLogger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
        new transports.Console({ level: 'info' }), // Para desarrollo
        new transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
        }),
        new transports.File({
            filename: 'logs/combined.log',
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
        }),
    ],
});

// Configuración para producción
if (process.env.NODE_ENV === 'production') {
    auditLogger.add(new transports.Console({ format: format.simple() }));
    combinedLogger.add(new transports.Console({ format: format.simple() }));
}

module.exports = { auditLogger, combinedLogger };