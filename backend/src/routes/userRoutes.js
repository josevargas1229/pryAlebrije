/* This code snippet is setting up a router using the Express framework in Node.js. It defines several
routes for handling user-related operations such as getting all users, getting a user by ID,
creating a new user, updating a user, and deleting a user. Each route is associated with a specific
function from the `userController` module that handles the corresponding operation. Finally, the
router is exported to be used in other parts of the application. */
const express = require('express');
const router = express.Router();
const userController=require('../controllers/userController')
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');

// Rutas públicas
router.post('/', userController.createUser);

// Rutas protegidas
router.get('/',authenticateToken, userController.getUserInfo);
router.put('/:id',authenticateToken, userController.updateUserInfo);
router.delete('/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), userController.deleteUser);


module.exports = router;
