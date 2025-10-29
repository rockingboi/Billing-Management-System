const FactoryRepo = require('../repositories/FactoryRepo');
const FactoryService = require('../services/FactoryService');
const GstinValidationService = require('../services/GstinValidationService');

class FactoryController {
  static async createFactory(req, res) {
    try {
      const factory = await FactoryRepo.create(req.body);
      res.status(201).json(factory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to create factory' });
    }
  }

  static async getAllFactories(req, res) {
    try {
      const factories = await FactoryRepo.findAll();
      res.json(factories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch factories' });
    }
  }

  static async getFactoryById(req, res) {
    try {
      const factory = await FactoryRepo.findById(req.params.id);
      if (!factory) return res.status(404).json({ message: 'Factory not found' });
      res.json(factory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch factory' });
    }
  }

  static async updateFactory(req, res) {
    try {
      const updatedFactory = await FactoryRepo.update(req.params.id, req.body);
      res.json(updatedFactory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update factory' });
    }
  }

  static async deleteFactory(req, res) {
    try {
      await FactoryRepo.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete factory' });
    }
  }

  static async filterFactories(req, res, next) {
    try {
      const filters = {
        name: req.query.name || null,
        location: req.query.location || null,
      };
      const filteredFactories = await FactoryService.getFilteredFactories(filters);
      res.json(filteredFactories);
    } catch (err) {
      next(err);
    }
  }

  // ✅ New: Factory summary for dashboard
  static async getFactorySummary(req, res) {
    try {
      const factoryId = req.params.id;
      const { from, to } = req.query;

      const summary = await FactoryService.getSummaryByFactoryId(factoryId, from, to);

      res.json(summary);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch factory summary' });
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

module.exports = FactoryController;
