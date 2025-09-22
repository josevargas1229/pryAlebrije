const express = require('express');
const router = express.Router();
const Premios = require('../controllers/premiosController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');

router.use(express.json({ limit: '2mb' }));
router.use(express.urlencoded({ limit: '2mb', extended: true }));

router.get('/', Premios.list);
router.get('/:id', Premios.get);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR), Premios.create);
router.put('/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), Premios.update);
router.delete('/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), Premios.remove);

module.exports = router;
