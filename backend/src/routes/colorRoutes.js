const express = require('express');
const router = express.Router();
const colorController = require('../controllers/colorController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');
router.get('/', colorController.getColores);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR),  colorController.createColor);
router.put('/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), colorController.updateColor);
module.exports = router;