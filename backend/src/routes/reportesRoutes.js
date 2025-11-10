const express = require('express');
const router = express.Router();
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');
const ReportesGamificacion = require('../controllers/reportesGamificacionController');

router.use(express.json({ limit: '2mb' }));
router.use(express.urlencoded({ limit: '2mb', extended: true }));


router.get(
  '/gamificacion',
  authenticateToken,
  authorize(ROLES.ADMINISTRADOR),
  ReportesGamificacion.resumen
);

module.exports = router;
