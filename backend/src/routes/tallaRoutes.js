const express = require('express');
const router = express.Router();
const {getTallas,createTalla,updateTalla} = require('../controllers/tallaController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');
router.get('/', getTallas);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR), createTalla);
router.put('/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), updateTalla);
module.exports = router;