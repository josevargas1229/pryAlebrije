const express = require('express');
const router = express.Router();
const RP = require('../controllers/ruletaPremiosController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');

router.use(express.json({ limit: '2mb' }));
router.use(express.urlencoded({ limit: '2mb', extended: true }));

router.get('/ruletas/:ruletaId/segmentos', authenticateToken, authorize(ROLES.ADMINISTRADOR), RP.listByRuleta);
router.post('/ruletas/:ruletaId/segmentos', authenticateToken, authorize(ROLES.ADMINISTRADOR), RP.addSegmento);
router.put('/ruletas/:ruletaId/segmentos/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), RP.updateSegmento);
router.delete('/ruletas/:ruletaId/segmentos/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), RP.removeSegmento);

module.exports = router;
