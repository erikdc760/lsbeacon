const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Base path: /api/company

// Create Agent/Supervisor (Owner only)
router.post('/users', protect, authorize('company_owner'), companyController.createUser);

// List Users (Owner only)
router.get('/users', protect, authorize('company_owner'), companyController.listUsers);

// Hierarchy (Owner only)
router.get('/hierarchy', protect, authorize('company_owner'), companyController.getHierarchy);

// Assign agent to supervisor (now owner) (Owner only)
router.post('/assign-agent', protect, authorize('company_owner'), companyController.assignAgentToSupervisor);

// Transfer Ownership (Owner only)
router.post('/transfer-ownership', protect, authorize('company_owner'), companyController.transferOwnership);

module.exports = router;
