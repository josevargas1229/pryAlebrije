const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configurationController');

// Ruta para obtener la configuración del sistema
router.get('', configuracionController.getConfiguration);

// Ruta para actualizar la configuración del sistema
router.put('', configuracionController.updateConfiguration);

module.exports = router;
