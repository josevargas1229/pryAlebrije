const { Transaccion, User } = require('../models/associations');

exports.getTodas = async (req, res) => {
  try {
    const transacciones = await Transaccion.findAll({
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        }
      ],
      order: [['created_at', 'DESC']] // ✅ campo correcto
    });
    res.status(200).json(transacciones);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ message: 'Error al obtener transacciones' });
  }
};

exports.getPorEstado = async (req, res) => {
  try {
    const { estado } = req.params;
    const transacciones = await Transaccion.findAll({
      where: { estado },
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(transacciones);
  } catch (error) {
    console.error('Error al filtrar transacciones:', error);
    res.status(500).json({ message: 'Error al filtrar transacciones' });
  }
};

exports.getPorUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const transacciones = await Transaccion.findAll({
      where: { usuario_id },
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(transacciones);
  } catch (error) {
    console.error('Error al obtener por usuario:', error);
    res.status(500).json({ message: 'Error al filtrar por usuario' });
  }
};
