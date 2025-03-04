const express = require('express');
const router = express.Router();
const legalDocumentController = require('../controllers/legalDocumentController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');
const upload = require('../config/multerConfig');

// Rutas para documentos legales
router.post('/upload', upload.single('file'),authenticateToken, authorize(ROLES.ADMINISTRADOR), legalDocumentController.uploadDocument);
router.get('/documents/all/:tipo',authenticateToken, authorize(ROLES.ADMINISTRADOR), legalDocumentController.getAllDocumentsByType);
router.get('/documents/:tipo', legalDocumentController.getDocumentsByType);
router.put('/documents/:id/modify', authenticateToken, authorize(ROLES.ADMINISTRADOR), legalDocumentController.modifyDocument);
router.put('/documents/:id/delete', authenticateToken, authorize(ROLES.ADMINISTRADOR), legalDocumentController.deleteDocument);



module.exports = router;
