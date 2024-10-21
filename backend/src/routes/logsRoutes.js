const express = require('express');
const LogsController = require('../controllers/logsController');
const router = express.Router();

router.get('', LogsController.obtenerLogs);

module.exports = router;
