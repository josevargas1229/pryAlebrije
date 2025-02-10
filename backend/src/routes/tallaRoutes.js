const express = require('express');
const router = express.Router();
const {getTallas,createTalla} = require('../controllers/tallaController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');
router.get('/', authenticateToken, authorize(ROLES.ADMINISTRADOR), getTallas);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR), createTalla);

module.exports = router;