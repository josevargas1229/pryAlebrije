const express = require('express');
const router = express.Router();
const legalDocumentController = require('../controllers/legalDocumentController');
const { authenticateToken, authorize } = require('../middlewares/auth');
const upload = require('../config/multerConfig');

// Rutas para documentos legales
router.post('/upload', upload.single('file'), legalDocumentController.uploadDocument);
router.get('/documents/:tipo', legalDocumentController.getDocumentsByType);

// Crear y gestionar documentos legales
router.post('/create', authenticateToken, authorize('admin'), legalDocumentController.createLegalDocument);
router.post('/terms', authenticateToken, authorize('admin'), legalDocumentController.createTerms);
router.post('/privacy', authenticateToken, authorize('admin'), legalDocumentController.createPrivacyPolicy);
router.post('/disclaimer', authenticateToken, authorize('admin'), legalDocumentController.createDisclaimer);

// Rutas para editar documentos
router.put('/edit', authenticateToken, authorize('admin'), legalDocumentController.editDocument);

module.exports = router;
