const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');
const { authenticateToken } = require('../middlewares/auth');

// Obtener notificaciones para el usuario autenticado (cliente o admin)
router.get('/', authenticateToken, notificacionController.getNotificaciones);

module.exports = router;
