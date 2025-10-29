const express = require('express');
const router = express.Router();
const FactoryController = require('../controllers/FactoryController');

// Existing routes
router.get('/', FactoryController.getAllFactories);
router.get('/:id', FactoryController.getFactoryById);
router.post('/', FactoryController.createFactory);
router.put('/:id', FactoryController.updateFactory);
router.delete('/:id', FactoryController.deleteFactory);
router.get('/:id/summary', FactoryController.getFactorySummary);


// New filter route
router.get('/filter', FactoryController.filterFactories);

// GSTIN validation route
router.post('/validate-gstin', FactoryController.validateGstin);

module.exports = router;
