const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');

// Obtener todos los logs
router.get('', historialController.getAuditLogs);

module.exports = router;
