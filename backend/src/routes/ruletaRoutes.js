const express = require('express');
const router = express.Router();
const ruletaController = require('../controllers/ruletaController');
const { param, body } = require('express-validator');
const imageUpload = require('../config/multerImageConfig');

router.post(
    '/',
    [
        body('activo').isBoolean(),
        imageUpload
    ],
    ruletaController.createRuleta
);

router.post('/:id/restaurar', 
    [
        param('id').isInt({ min: 1 }), 
        body('historial_id').isInt({ min: 1 })
    ], 
    ruletaController.restaurarDesdeHistorial
);

router.get('/', ruletaController.getAllRuletas);

router.get(
    '/:id',
    [param('id').isInt({ min: 1 })],
    ruletaController.getRuletaById
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }),
        body('activo').optional().isBoolean(),
        imageUpload
    ],
    ruletaController.updateRuleta
);

router.delete(
    '/:id',
    [param('id').isInt({ min: 1 })],
    ruletaController.deleteRuleta
);

module.exports = router;