const { Notificacion, User } = require('../models/associations');
// 🔓 Obtener notificaciones del usuario actual o del admin
exports.getNotificaciones = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const filtro = user.tipo === 1 // tipo === 1 → admin
      ? { tipo: 'admin' }
      : { tipo: 'usuario', usuario_id: user.userId }; // <-- corregido

    const notificaciones = await Notificacion.findAll({
      where: filtro,
      include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre', 'apellido_paterno'] }],
      order: [['fecha', 'DESC']],
      limit: 50
    });

    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
// 🔧 Crear notificación (uso interno)
exports.crearNotificacion = async ({ mensaje, tipo, usuario_id = null }) => {
  try {
    await Notificacion.create({
      mensaje,
      tipo,
      usuario_id
    });
  } catch (error) {
    console.error('Error al crear notificación:', error);
  }
};
