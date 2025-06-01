const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');

// Get dashboard data for party
router.get('/party/:party_id', DashboardController.getPartyDashboard);

// Get dashboard data for factory
router.get('/factory/:factory_id', DashboardController.getFactoryDashboard);  
router.get('/factory/:factory_id/summary', DashboardController.getFactorySummary);
router.get('/party/:party_id/summary', DashboardController.getPartySummary);
router.get('/party-summary', DashboardController.getPartySummary);
router.get('/factory-summary', DashboardController.getFactorySummary);
module.exports = router;
