const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Webhook endpoints
router.post('/sms', webhookController.handleSmsFunctions);
router.post('/voice', webhookController.handleVoiceFunctions);

module.exports = router;
