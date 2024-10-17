const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const userController = require('../controllers/userController');
const { doubleCsrfProtection } = require('../config/csrfConfig');

router.post('/login', doubleCsrfProtection, authController.login);
router.post('/change-password', authenticateToken, authController.changePassword);
router.post('/register', doubleCsrfProtection, userController.createUser);
router.get('/check-auth', authController.checkAuth);
router.post('/logout', authController.logout);

module.exports = router;
