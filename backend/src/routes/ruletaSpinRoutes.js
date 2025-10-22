const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const ruletaSpinController = require('../controllers/ruletaSpinController');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { IntentoUsuario } = require('../models/associations');


router.use(express.json({ limit: '2mb' }));
router.use(express.urlencoded({ limit: '2mb', extended: true }));

router.post('/ruletas/:ruletaId/spin', authenticateToken, ruletaSpinController.spin);
router.get('/intentos', authenticateToken, async (req, res) => {
  try {
    const { userId: userIdFromToken } = req.user || {};
    const hoy = new Date().toISOString().slice(0, 10);

    const intento = await IntentoUsuario.findOne({
      where: {
        usuario_id: userIdFromToken,
        periodo_inicio: { [Op.lte]: hoy },
        periodo_fin:   { [Op.gte]: hoy }
      }
    });

    const disponibles = intento
      ? Math.max(0,
          Number(intento.intentos_asignados || 0) -
          Number(intento.intentos_consumidos || 0)
        )
      : 0;

    return res.json({ disponibles });
  } catch (err) {
    return res.status(500).json({ message: 'Error al consultar intentos' });
  }
});

module.exports = router;
