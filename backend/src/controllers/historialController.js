const { HistorialActividades, User, Rol } = require('../models/associations');

exports.getAuditLogs = async (req, res) => {
    try {
        const { modulo } = req.query; // Obtener el módulo desde los query params (ej. ?modulo=productos)

        // Construir las condiciones de búsqueda
        const whereClause = modulo ? { modulo } : {}; // Si no hay módulo, traer todos

        const logs = await HistorialActividades.findAll({
            where: whereClause, // Filtrar por módulo si se proporciona
            include: [
                {
                    model: User,
                    attributes: ['nombre', 'apellido_paterno', 'apellido_materno'],
                    include: [
                        {
                            model: Rol,
                            attributes: ['rol']
                        }
                    ]
                }
            ],
            order: [['fecha', 'DESC']],
            raw: true,
            nest: true
        });
        // Formatear los datos para el frontend
        const formattedLogs = logs.map(log => ({
            id: log.id,
            usuario_id: log.usuario_id,
            nombre_usuario: `${log.User.nombre} ${log.User.apellido_paterno} ${log.User.apellido_materno}`,
            rol: log.User.Rol.rol,
            modulo: log.modulo,
            accion: log.accion,
            detalle: log.detalle,
            created_at: log.fecha
        }));

        res.status(200).json(formattedLogs);
    } catch (error) {
        console.error('Error al obtener los logs de auditoría:', error);
        res.status(500).json({ message: 'Error al obtener los logs', error: error.message });
    }
};