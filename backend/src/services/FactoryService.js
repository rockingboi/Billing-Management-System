const TransactionRepo = require('../repositories/TransactionRepo');
const FactoryRepo = require('../repositories/FactoryRepo');

class FactoryService {
  static async getAllFactoryTransactions(factory_id) {
    return await TransactionRepo.getFactoryTransactions(factory_id);
  }

  static async getAllFactoryPayments(factory_id) {
    return await TransactionRepo.getFactoryPayments(factory_id);
  }

  static async getTotalOwedFromFactory(factory_id) {
    const transactions = await TransactionRepo.getFactoryTransactions(factory_id);
    return transactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
  }

  static async getTotalReceivedFromFactory(factory_id) {
    const payments = await TransactionRepo.getFactoryPayments(factory_id);
    return payments.reduce((sum, p) => sum + Number(p.amount_received || 0), 0);
  }

  static async getRemainingFromFactory(factory_id) {
    const owed = await this.getTotalOwedFromFactory(factory_id);
    const received = await this.getTotalReceivedFromFactory(factory_id);
    return owed - received;
  }

  // ✅ Summary with optional date range
  static async getSummaryByFactoryId(factory_id, from, to) {
    const transactions = await TransactionRepo.getFactoryTransactionsByDate(factory_id, from, to);
    const payments = await TransactionRepo.getFactoryPaymentsByDate(factory_id, from, to);

    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
    const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount_received || 0), 0);
    const remaining = totalAmount - totalReceived;

    return {
      transactions,
      payments,
      totalAmount,
      totalReceived,
      remaining,
    };
  }

  static getFilteredFactories(filters) {
    return FactoryRepo.filterFactories(filters);
  }
}

module.exports = FactoryService;
