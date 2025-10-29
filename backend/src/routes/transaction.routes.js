const express = require('express');
const TransactionController = require('../controllers/TransactionController');
const FactoryController = require('../controllers/FactoryController'); // Add this line


const router = express.Router();

router.post('/', TransactionController.createTransaction);

router.get('/party/:party_id', TransactionController.getTransactionsByParty);
router.get('/factory/:factory_id', TransactionController.getTransactionsByFactory);

router.get('/filter', FactoryController.filterFactories); // put before /:id
router.get('/:id', FactoryController.getFactoryById);
router.get('/hisab', TransactionController.getHisab);

// Summaries
router.get('/summary/party/:party_id', TransactionController.getSummaryParty);
router.get('/summary/factory/:factory_id', TransactionController.getSummaryFactory);

module.exports = router;
