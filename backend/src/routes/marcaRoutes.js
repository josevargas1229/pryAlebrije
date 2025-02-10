const express = require('express');
const router = express.Router();
const marcaController = require('../controllers/marcaController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');
router.get('/', marcaController.getMarcas);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR),  marcaController.createMarca);

module.exports = router;