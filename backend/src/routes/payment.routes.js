const express = require('express');
const router = express.Router();
const TransactionRepo = require('../repositories/TransactionRepo');

// For brevity, only POST routes for payments shown — can add GET, DELETE similarly

// Add party payment
router.post('/party_payments', async (req, res) => {
  try {
    const data = req.body;
    const payment = await TransactionRepo.createPartyPayment(data);
    res.status(201).json(payment);
  } catch (error) {
    console.error('Party payment creation error:', error.stack || error);
    res.status(500).json({ message: 'Failed to create party payment' });
  }
});

// Add factory payment
router.post('/factory_payments', async (req, res) => {
  try {
    const data = req.body;
    const payment = await TransactionRepo.createFactoryPayment(data);
    res.status(201).json(payment);
  } catch (error) {
    console.error('Factory payment creation error:', error.stack || error);
    res.status(500).json({ message: 'Failed to create factory payment' });
  }
});


module.exports = router;
