const express = require('express');
const router = express.Router();
const temporadaController = require('../controllers/temporadaController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');
router.get('/', temporadaController.getTemporadas);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR),  temporadaController.createTemporada);

module.exports = router;