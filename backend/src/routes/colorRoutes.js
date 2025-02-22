const express = require('express');
const router = express.Router();
const colorController = require('../controllers/colorController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');
router.get('/', colorController.getColores);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR),  colorController.createColor);

module.exports = router;