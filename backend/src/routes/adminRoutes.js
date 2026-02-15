
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// User Management
router.post('/create-company-owner', protect, authorize('super_admin'), adminController.createCompanyOwner);

// Company listing
router.get('/companies', protect, authorize('super_admin'), adminController.getCompanies);
router.post('/companies', protect, authorize('super_admin'), adminController.createCompany);
router.delete('/companies/:id', protect, authorize('super_admin'), adminController.removeCompany);

// Campaigns
router.get('/campaigns', protect, authorize('super_admin'), adminController.getCampaigns);
router.post('/campaigns', protect, authorize('super_admin'), adminController.createCampaign);
router.put('/campaigns/:id', protect, authorize('super_admin'), adminController.updateCampaign);
router.delete('/campaigns/:id', protect, authorize('super_admin'), adminController.removeCampaign);

// Auto Dialer
router.get('/autodialer/queue', adminController.getAutoDialerQueue);

// Contacts
router.get('/contacts', adminController.getContacts);

// Conversations
router.get('/conversations', adminController.getConversations);

// Lead Designation
router.get('/leads/stats', adminController.getLeadStats);
router.post('/leads/distribute', adminController.triggerRedistribution);
router.put('/leads/rules/:id', adminController.updateLeadRule);

// Phantom Mode
router.get('/phantom/stats', adminController.getPhantomStats);

// Dashboard
router.get('/dashboard/aggregates', adminController.getDashboardAggregates);
router.get('/dashboard/directives', adminController.getDashboardDirectives);
router.put('/dashboard/directives', adminController.updateDashboardDirectives);

module.exports = router;
