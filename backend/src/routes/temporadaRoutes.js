const express = require('express');
const router = express.Router();
const { getTemporadas, createTemporada, updateTemporada } = require('../controllers/temporadaController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');

router.get('/', getTemporadas);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR), createTemporada);
router.put('/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), updateTemporada);

module.exports = router;