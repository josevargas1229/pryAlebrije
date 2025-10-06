const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const ruletaSpinController = require('../controllers/ruletaSpinController');

router.use(express.json({ limit: '2mb' }));
router.use(express.urlencoded({ limit: '2mb', extended: true }));

router.post('/ruletas/:ruletaId/spin', authenticateToken, ruletaSpinController.spin);

module.exports = router;
