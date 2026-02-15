const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Dashboard
router.get('/dashboard', protect, authorize('agent', 'company_owner', 'super_admin'), agentController.getDashboardStats);

// Auto Dialer
router.get('/queue', protect, authorize('agent', 'company_owner', 'super_admin'), agentController.getQueue);

module.exports = router;
