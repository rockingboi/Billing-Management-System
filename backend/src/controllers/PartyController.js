const PartyRepo = require('../repositories/PartyRepo');
const PartyService = require('../services/PartyService');
const GstinValidationService = require('../services/GstinValidationService');

class PartyController {
  static async createParty(req, res) {
    try {
      const party = await PartyRepo.create(req.body);
      res.status(201).json(party);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to create party' });
    }
  }

  static async getAllParties(req, res) {
    try {
      const parties = await PartyRepo.findAll();
      res.json(parties);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch parties' });
    }
  }

  static async getPartyById(req, res) {
    try {
      const party = await PartyRepo.findById(req.params.id);
      if (!party) return res.status(404).json({ message: 'Party not found' });
      res.json(party);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch party' });
    }
  }
  

  static async updateParty(req, res) {
    try {
      const updatedParty = await PartyRepo.update(req.params.id, req.body);
      res.json(updatedParty);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update party' });
    }
  }

  static async deleteParty(req, res) {
    try {
      await PartyRepo.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete party' });
    }
  }

  // Filter parties based on query params (e.g., name)
  static async filterParties(req, res, next) {
    try {
      const filters = req.query;
      const parties = await PartyService.getFilteredParties(filters);
      res.json(parties);
    } catch (err) {
      next(err);
    }
  }

  // ✅ New: Get full summary of party: transactions, payments, remaining
  static async getPartySummary(req, res) {
    try {
      const partyId = req.params.id;
      const { from, to } = req.query;

      const summary = await PartyService.getSummaryByPartyId(partyId, from, to);

      res.json(summary);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch party summary' });
    }
  }

  // GSTIN validation endpoint
  static async validateGstin(req, res) {
    try {
      const { gstin } = req.body;
      
      if (!gstin) {
        return res.status(400).json({ message: 'GSTIN is required' });
      }

      // Validate GSTIN format first
      if (!GstinValidationService.validateGstinFormat(gstin)) {
        return res.status(400).json({ 
          message: 'Invalid GSTIN format. GSTIN should be 15 characters long and follow the correct format.' 
        });
      }

      const validationResult = await GstinValidationService.validateGstin(gstin);
      res.json(validationResult);
    } catch (error) {
      console.error('GSTIN validation error:', error);
      res.status(500).json({ message: 'Failed to validate GSTIN' });
    }
  }
}

module.exports = PartyController;
