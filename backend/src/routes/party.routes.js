const express = require('express');
const PartyController = require('../controllers/PartyController');

const router = express.Router();

router.post('/', PartyController.createParty);
router.get('/', PartyController.getAllParties);
router.get('/:id', PartyController.getPartyById);
router.put('/:id', PartyController.updateParty);
router.delete('/:id', PartyController.deleteParty);
router.get("/filter", PartyController.filterParties);

// ✅ New summary route for dashboard
router.get('/:id/summary', PartyController.getPartySummary);

// GSTIN validation route
router.post('/validate-gstin', PartyController.validateGstin);

module.exports = router;
