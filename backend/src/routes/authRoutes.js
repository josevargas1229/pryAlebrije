const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const userController = require('../controllers/userController');
router.post('/login', authController.login);
router.post('/change-password', authenticateToken, authController.changePassword);
router.post('/register', userController.createUser);
module.exports = router;