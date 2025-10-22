const Asistencia = require('../models/Asistencia');
const Empleado = require('../models/Empleado');
const { generarQR } = require('../utils/qrGenerator');

class AsistenciaController {
    // Registrar entrada/salida con validación QR
    static async registrar(req, res) {
        try {
            const { empleado_id, hora_entrada, hora_salida, estado, notas, qr_data } = req.body;

            // Validación básica de QR (ej. verificar si qr_data coincide con ubicación esperada)
            if (qr_data && qr_data.ubicacion !== 'tienda_fisica') {
                return res.status(400).json({ error: 'QR no válido para esta ubicación' });
            }

            const asistencia = await Asistencia.create({
                empleado_id,
                hora_entrada,
                hora_salida,
                estado,
                notas,
                qr_validado: !!qr_data // Marca como validado si QR presente
            });

            // Opcional: Generar QR de confirmación
            const qrConfirmacion = await generarQR({ asistencia_id: asistencia.id, timestamp: new Date() });

            res.status(201).json({ asistencia, qr_confirmacion: qrConfirmacion });
        } catch (error) {
            res.status(500).json({ error: 'Error al registrar asistencia: ' + error.message });
        }
    }

    // Obtener asistencias por empleado
    static async obtenerPorEmpleado(req, res) {
        try {
            const { empleado_id } = req.params;
            const asistencias = await Asistencia.findAll({
                where: { empleado_id },
                include: [{ model: Empleado, as: 'empleado', include: [{ model: require('./User'), as: 'usuario' }] }]
            });
            res.json(asistencias);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener asistencias: ' + error.message });
        }
    }

    // Actualizar asistencia (ej. marcar salida o validar QR post-escaneo)
    static async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { hora_salida, estado, notas, qr_validado } = req.body;
            const [updated] = await Asistencia.update(
                { hora_salida, estado, notas, qr_validado },
                { where: { id } }
            );
            if (updated) {
                const updatedAsistencia = await Asistencia.findByPk(id);
                res.json(updatedAsistencia);
            } else {
                res.status(404).json({ error: 'Asistencia no encontrada' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar asistencia: ' + error.message });
        }
    }

    // Eliminar asistencia (restringido a admins)
    static async eliminar(req, res) {
        try {
            const { id } = req.params;
            await Asistencia.destroy({ where: { id } });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar asistencia: ' + error.message });
        }
    }
    // Generar QR para la tienda (estático, para imprimir y escanear por empleados)
    static async generarQRTienda(req, res) {
        try {
            const qrData = { ubicacion: 'tienda_fisica', tienda_id: 1 }; // Ajusta según tu modelo de tiendas
            const qrDataURL = await generarQR(qrData, { width: 300 }); // Opciones opcionales para tamaño/imagen

            res.json({ qr_data_url: qrDataURL }); // Devuelve dataURL para mostrar/imprimir en frontend
        } catch (error) {
            res.status(500).json({ error: 'Error al generar QR de tienda: ' + error.message });
        }
    }
}

module.exports = AsistenciaController;