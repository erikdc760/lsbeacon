
const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');

// Dashboard Routes
router.get('/dashboard-stats', ownerController.getDashboardStats);

// Announcement Routes
router.get('/announcements', ownerController.getAnnouncements);
router.post('/announcements', ownerController.createAnnouncement);
router.put('/announcements/:id', ownerController.updateAnnouncement);

// Contact Routes
router.get('/contacts', ownerController.getContacts);
router.post('/contacts', ownerController.createContact);

// Lead Designation Routes
router.get('/leads/stats', ownerController.getLeadStats);
router.post('/leads/distribute', ownerController.triggerRedistribution);
router.put('/leads/rules/:id', ownerController.updateLeadRule);

// Arena Routes
router.get('/arena/stats', ownerController.getArenaStats);

// Team & Call Monitoring (Merged from Supervisor Role)
router.get('/team-performance', ownerController.getTeamPerformance);
router.get('/live-calls', ownerController.getLiveCalls);

module.exports = router;
