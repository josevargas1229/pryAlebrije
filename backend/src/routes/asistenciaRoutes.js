const express = require('express');
const router = express.Router();
const AsistenciaController = require('../controllers/asistenciaController');
const { authenticateToken, authorize, ROLES } = require('./middlewares/auth');

router.post('/registrar', authenticateToken, AsistenciaController.registrar);
router.get('/empleado/:empleado_id', authenticateToken, AsistenciaController.obtenerPorEmpleado);
router.get('/generar-qr', authenticateToken, authorize(ROLES.ADMINISTRADOR), AsistenciaController.generarQRTienda); 
router.put('/:id', authenticateToken, AsistenciaController.actualizar);
router.delete('/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), AsistenciaController.eliminar);

module.exports = router;