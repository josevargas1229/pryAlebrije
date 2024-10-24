const express = require('express');
const BloqueosController = require('../controllers/bloqueosController');
const router = express.Router();

// Ruta para bloquear un usuario
router.post('', BloqueosController.bloquearUsuario);

// Ruta para obtener usuarios bloqueados por periodo (día, semana, mes)
router.get('', BloqueosController.obtenerUsuariosBloqueados);

// Ruta para obtener bloqueos recientes por intentos en los últimos N días
router.get('/recientes', BloqueosController.obtenerBloqueosRecientes);

module.exports = router;
