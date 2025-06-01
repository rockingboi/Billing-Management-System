const DashboardService = require('../services/DashboardService');

class DashboardController {
  static async getPartyDashboard(req, res) {
    try {
      const party_id = req.params.party_id;
      const data = await DashboardService.getPartyDashboard(party_id);
      res.json(data);
    } catch (error) {
      console.error('Dashboard party error:', error);
      res.status(500).json({ message: 'Failed to get party dashboard data' });
    }
  }

  static async getFactoryDashboard(req, res) {
    try {
      const factory_id = req.params.factory_id;
      const data = await DashboardService.getFactoryDashboard(factory_id);
      res.json(data);
    } catch (error) {
      console.error('Dashboard factory error:', error);
      res.status(500).json({ message: 'Failed to get factory dashboard data' });
    }
  }

  static async getFilteredHisab(req, res) {
    const { partyId, factoryId, startDate, endDate } = req.query;

    if (!partyId && !factoryId) {
      return res.status(400).json({ error: "At least partyId or factoryId is required" });
    }

    try {
      const data = await DashboardService.getFilteredHisab(partyId, factoryId, startDate, endDate);
      res.json(data);
    } catch (error) {
      console.error("getFilteredHisab error:", error);
      res.status(500).json({ error: "Failed to fetch hisab data" });
    }
}
  

  // ✅ New: Date-filtered party summary
  static async getPartySummary(req, res) {
    const { partyId, startDate, endDate } = req.query;
  
    if (!partyId) return res.status(400).json({ error: 'Missing partyId' });
  
    try {
      const summary = await DashboardService.getPartySummary(partyId, startDate, endDate);
      res.json(summary);
    } catch (err) {
      console.error('getPartySummary error:', err);
      res.status(500).json({ error: 'Failed to fetch party summary' });
    }
  }

  // ✅ New: Date-filtered factory summary
  static async getFactorySummary(req, res) {
    const { factoryId, startDate, endDate } = req.query;
  
    if (!factoryId) return res.status(400).json({ error: 'Missing factoryId' });
  
    try {
      const summary = await DashboardService.getFactorySummary(factoryId, startDate, endDate);
      res.json(summary);
    } catch (err) {
      console.error('getFactorySummary error:', err);
      res.status(500).json({ error: 'Failed to fetch factory summary' });
    }
  }
}

module.exports = DashboardController;
