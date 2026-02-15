const express = require('express');
const router = express.Router();
const phoneController = require('../controllers/phoneController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Number Registry routes (must be BEFORE /:agentId to avoid route conflicts)
router.get('/registry/all', protect, authorize('company_owner', 'super_admin'), phoneController.getNumberRegistry);
router.get('/registry/available', protect, authorize('company_owner', 'super_admin'), phoneController.getAvailableNumbers);
router.post('/registry/assign', protect, authorize('company_owner', 'super_admin'), phoneController.assignNumber);
router.post('/registry/unassign', protect, authorize('company_owner', 'super_admin'), phoneController.unassignNumber);

// Phone operations
router.get('/search', protect, authorize('company_owner', 'super_admin'), phoneController.searchNumbers);
router.post('/buy', protect, authorize('company_owner', 'super_admin'), phoneController.buyNumber);
router.post('/sms', protect, phoneController.sendSms);
router.post('/call', protect, phoneController.initiateCall);

// This route has a parameter, must be LAST
router.get('/:agentId', protect, phoneController.getAgentNumber);

module.exports = router;
