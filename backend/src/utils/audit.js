const HistorialActividades = require('../models/HistorialActividades');
const { auditLogger } = require('../config/logger');

const logAudit = async (modulo, usuario_id, accion, detalle) => {
    try {
        // Registrar en la base de datos
        await HistorialActividades.create({
            modulo,
            usuario_id,
            accion,
            detalle: JSON.stringify(detalle),
        });
        // Registrar en Winston con auditLogger
        auditLogger.info(`${modulo}:${accion}`, { usuario_id, modulo, detalle });
    } catch (error) {
        auditLogger.error('Error al registrar auditoría:', { error, usuario_id, modulo, accion, detalle });
    }
};

module.exports = logAudit;