const TransactionRepo = require('../repositories/TransactionRepo');
const PartyRepo = require('../repositories/PartyRepo');
const FactoryRepo = require('../repositories/FactoryRepo');

class TransactionController {
  static async createTransaction(req, res) {
    try {
      const data = req.body;
  
      const calculateAmount = (d) => {
        const base = parseFloat(d.weight || 0) * parseFloat(d.rate || 0);
        const deductions = [
          d.moisture, d.rejection, d.duplex, d.first, d.second, d.third
        ].map(n => parseFloat(n || 0)).reduce((a, b) => a + b, 0);
        return parseFloat(base - deductions).toFixed(2);
      };
  
      if (!data.total_amount) {
        data.total_amount = calculateAmount(data);
      }
  
      // Auto-fill party/factory names
      if (data.party_id) {
        const party = await PartyRepo.findById(data.party_id);
        if (!party) return res.status(400).json({ message: "Invalid party_id" });
        data.party_name = party.name;
      }
  
      if (data.factory_id) {
        const factory = await FactoryRepo.findById(data.factory_id);
        if (!factory) return res.status(400).json({ message: "Invalid factory_id" });
        data.factory_name = factory.name;
      }
  
      let result;
  
      if (data.party_id) {
        // 1. Create Party Transaction
        result = await TransactionRepo.createPartyTransaction(data);
  
        // 2. Create Corresponding Factory Transaction
        const factoryTxData = {
          factory_id: data.factory_id,
          factory_name: data.factory_name,
          party_name: data.party_name,
          date: data.date,
          vehicle_no: data.vehicle_no,
          weight: data.weight,
          rate: parseFloat(data.rate) + 0.2,
          total_amount: parseFloat(data.weight) * (parseFloat(data.rate) + 0.2),
          remarks: data.remarks
        };
        await TransactionRepo.createFactoryTransaction(factoryTxData);
      } else if (data.factory_id) {
        // Create Factory Transaction independently (if sent directly)
        result = await TransactionRepo.createFactoryTransaction(data);
      } else {
        return res.status(400).json({ message: "Missing party_id or factory_id" });
      }
  
      res.status(201).json(result);
    } catch (error) {
      console.error("Transaction creation failed:", error);
      res.status(500).json({ message: 'Failed to create transaction' });
    }
  }
  

  static async getAllTransactions(req, res) {
    try {
      const { startDate, endDate, partyId, factoryId } = req.query;
      const transactions = await TransactionRepo.filterTransactions({
        startDate,
        endDate,
        partyId,
        factoryId
      });
      res.json(transactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  }

  static async getTransactionsByParty(req, res) {
    try {
      const transactions = await TransactionRepo.getPartyTransactions(req.params.party_id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch transactions for party' });
    }
  }

  static async getTransactionsByFactory(req, res) {
    try {
      const transactions = await TransactionRepo.getFactoryTransactions(req.params.factory_id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch transactions for factory' });
    }
  }

  static async getSummaryParty(req, res) {
    try {
      const summary = await TransactionRepo.getSummaryByParty(req.params.party_id);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch party summary' });
    }
  }

  static async getSummaryFactory(req, res) {
    try {
      const summary = await TransactionRepo.getSummaryByFactory(req.params.factory_id);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch factory summary' });
    }
  }
}

module.exports = TransactionController;
