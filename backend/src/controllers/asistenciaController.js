const { Asistencia, Empleado, User } = require('../models/associations')
const { generarQR } = require('../utils/qrGenerator');
const { Op } = require('sequelize');

class AsistenciaController {
    // Registrar entrada/salida con validación QR
    static async registrar(req, res) {
        try {
            const { empleado_id, hora_entrada, hora_salida, estado, notas, qr_data } = req.body;

            // Validación básica de QR
            if (qr_data && qr_data.ubicacion !== 'tienda_fisica') {
                return res.status(400).json({ error: 'QR no válido para esta ubicación' });
            }

            // Validar que se proporcione exactamente uno de hora_entrada o hora_salida
            if ((hora_entrada && hora_salida) || (!hora_entrada && !hora_salida)) {
                return res.status(400).json({ error: 'Debe proporcionarse exactamente una de hora_entrada o hora_salida' });
            }

            // Obtener la fecha actual (solo la parte de la fecha, sin hora)
            const today = new Date().toISOString().split('T')[0];

            // Buscar asistencias del empleado para el día actual usando el campo fecha
            const asistenciaExistente = await Asistencia.findOne({
                where: {
                    empleado_id,
                    fecha: today
                }
            });

            // Si se intenta registrar una entrada
            if (hora_entrada) {
                // Si ya existe una asistencia para el día, no permitir nueva entrada
                if (asistenciaExistente) {
                    return res.status(400).json({ error: 'Ya existe una asistencia registrada para hoy. Registra la salida o espera al próximo día.' });
                }

                // Crear nueva asistencia para la entrada
                const asistencia = await Asistencia.create({
                    empleado_id,
                    fecha: today,
                    hora_entrada,
                    hora_salida: null,
                    estado: estado || 'presente',
                    notas,
                    qr_validado: !!qr_data
                });

                // Generar QR de confirmación
                const qrConfirmacion = await generarQR({ asistencia_id: asistencia.id, timestamp: new Date() });

                return res.status(201).json({ asistencia, qr_confirmacion: qrConfirmacion });
            }

            // Si se intenta registrar una salida
            if (hora_salida) {
                // Validar que exista una asistencia con entrada registrada y sin salida
                if (!asistenciaExistente || asistenciaExistente.hora_salida) {
                    return res.status(400).json({ error: 'No hay una entrada registrada para hoy o ya se registró la salida.' });
                }

                // Actualizar la asistencia existente con la hora de salida
                const [updated] = await Asistencia.update(
                    { hora_salida, estado: estado || 'presente', notas, qr_validado: !!qr_data },
                    { where: { id: asistenciaExistente.id } }
                );

                if (updated) {
                    const updatedAsistencia = await Asistencia.findByPk(asistenciaExistente.id);
                    const qrConfirmacion = await generarQR({ asistencia_id: updatedAsistencia.id, timestamp: new Date() });
                    return res.status(200).json({ asistencia: updatedAsistencia, qr_confirmacion: qrConfirmacion });
                } else {
                    return res.status(500).json({ error: 'Error al actualizar la asistencia' });
                }
            }
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
                include: [{ model: Empleado, as: 'empleado', include: [{ model: User }] }]
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