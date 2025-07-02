const express = require('express');
const router = express.Router();
const promocionController = require('../controllers/promocionController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');

// Pública (para home)
router.get('/activas', promocionController.getPromocionesActivas);

// Administrador
router.get('/', authenticateToken, authorize(ROLES.ADMINISTRADOR), promocionController.getTodas);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR), promocionController.crearPromocion);
router.put('/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), promocionController.actualizarPromocion);
router.delete('/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), promocionController.eliminarPromocion);

module.exports = router;
