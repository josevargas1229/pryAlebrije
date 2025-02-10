const express = require('express');
const router = express.Router();
const tallaController = require('../controllers/tallaController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');
router.get('/', tallaController.getTallas);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR),  tallaController.createTalla);

module.exports = router;