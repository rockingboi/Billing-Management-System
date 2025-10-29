const TransactionRepo = require('../repositories/TransactionRepo');
const db = require('../config/db.config'); // Assuming this is where your db connection is

class DashboardService {

  static async getPartyDashboard(party_id) {
    const transactions = await TransactionRepo.getPartyTransactions(party_id);
    const payments = await TransactionRepo.getPartyPayments(party_id);
    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
    const remaining = totalAmount - totalPaid;
    return { transactions, payments, totalAmount, totalPaid, remaining };
  }

  static async getFactoryDashboard(factory_id) {
    const transactions = await TransactionRepo.getFactoryTransactions(factory_id);
    const payments = await TransactionRepo.getFactoryPayments(factory_id);
    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
    const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
    const remaining = totalAmount - totalReceived;
    return { transactions, payments, totalAmount, totalReceived, remaining };
  }

  static async getPartySummary(partyId, startDate, endDate) {
    const transactions = await TransactionRepo.getPartyTransactions({ partyId, startDate, endDate });
    const payments = await TransactionRepo.getPartyPayments({ partyId, startDate, endDate });

    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
    const remaining = totalAmount - totalPaid;

    return { totalAmount, totalPaid, remaining, transactions, payments };
  }

  static async getFactorySummary(factoryId, startDate, endDate) {
    const transactions = await TransactionRepo.getFactoryTransactions({ factoryId, startDate, endDate });
    const payments = await TransactionRepo.getFactoryPayments({ factoryId, startDate, endDate });

    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
    const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
    const remaining = totalAmount - totalReceived;

    return { totalAmount, totalReceived, remaining, transactions, payments };
  }

  static addSerialAndClean(dataArray, idField) {
    if (!dataArray) return [];
    return dataArray.map((item, index) => {
      const newItem = { ...item, serial: index + 1 };
      // Do NOT delete total_amount or important fields
      delete newItem[idField]; // Only remove party_id or factory_id for privacy
      return newItem;
    });
  }

  static async getFilteredHisab(partyId, factoryId, startDate, endDate) {
    const dateFilter = (alias) => {
      if (startDate && endDate) {
        return `AND ${alias}.date BETWEEN ? AND ?`;
      } else if (startDate) {
        return `AND ${alias}.date >= ?`;
      } else if (endDate) {
        return `AND ${alias}.date <= ?`;
      }
      return '';
    };

    const dateParams = [];
    if (startDate) dateParams.push(startDate);
    if (endDate) dateParams.push(endDate);

    let result = {
      party_transactions: [],
      party_payments: [],
      factory_transactions: [],
      factory_payments: []
    };

    if (partyId && !factoryId) {
      const partyTxSql = `
        SELECT id, party_id, date, vehicle_no, weight, rate, moisture, rejection, duplex, first, second, third,
               total_amount, remarks, factory_name, party_name, type
        FROM party_transactions
        WHERE party_id = ?
        ${dateFilter('party_transactions')}
        ORDER BY date DESC, id DESC
      `;

      const partyPaySql = `
        SELECT id, party_id, date, amount_paid, remarks, party_name, total_amount, remaining_amount
        FROM party_payments
        WHERE party_id = ?
        ${dateFilter('party_payments')}
        ORDER BY date DESC, id DESC
      `;

      let partyTxParams = [partyId];
      let partyPayParams = [partyId];

      partyTxParams.push(...dateParams);
      partyPayParams.push(...dateParams);

      const [partyTxRows] = await db.execute(partyTxSql, partyTxParams);
      const [partyPayRows] = await db.execute(partyPaySql, partyPayParams);

      result.party_transactions = this.addSerialAndClean(partyTxRows, 'party_id');
      result.party_payments = this.addSerialAndClean(partyPayRows, 'party_id');

    } else if (!partyId && factoryId) {
      const factoryTxSql = `
        SELECT id, factory_id, date, vehicle_no, weight, rate, total_amount, remarks, factory_name, party_name
        FROM factory_transactions
        WHERE factory_id = ?
        ${dateFilter('factory_transactions')}
        ORDER BY date DESC, id DESC
      `;

      const factoryPaySql = `
        SELECT id, factory_id, date, amount_received AS amount_paid, remarks, factory_name, total_amount, remaining_amount
        FROM factory_payments
        WHERE factory_id = ?
        ${dateFilter('factory_payments')}
        ORDER BY date DESC, id DESC
      `;

      let factoryTxParams = [factoryId];
      let factoryPayParams = [factoryId];

      factoryTxParams.push(...dateParams);
      factoryPayParams.push(...dateParams);

      const [factoryTxRows] = await db.execute(factoryTxSql, factoryTxParams);
      const [factoryPayRows] = await db.execute(factoryPaySql, factoryPayParams);

      result.factory_transactions = this.addSerialAndClean(factoryTxRows, 'factory_id');
      result.factory_payments = this.addSerialAndClean(factoryPayRows, 'factory_id');

    } else if (partyId && factoryId) {
      const bothTxSql = `
        SELECT id, party_id, date, vehicle_no, weight, rate, moisture, rejection, duplex, first, second, third,
               total_amount, remarks, factory_name, party_name, type
        FROM party_transactions
        WHERE party_name = (SELECT name FROM parties WHERE id = ?)
          AND factory_name = (SELECT name FROM factories WHERE id = ?)
          ${dateFilter('party_transactions')}
        ORDER BY date DESC, id DESC
      `;

      const bothPaySql = `
        SELECT id, party_id, date, amount_paid, remarks, party_name, total_amount, remaining_amount
        FROM party_payments
        WHERE party_name = (SELECT name FROM parties WHERE id = ?)
          AND party_id = ?
          AND EXISTS (
            SELECT 1 FROM party_transactions pt
            WHERE pt.party_id = party_payments.party_id
              AND pt.factory_name = (SELECT name FROM factories WHERE id = ?)
          )
          ${dateFilter('party_payments')}
        ORDER BY date DESC, id DESC
      `;

      const factoryTxSql = `
        SELECT id, factory_id, date, vehicle_no, weight, rate, total_amount, remarks, factory_name, party_name
        FROM factory_transactions
        WHERE party_name = (SELECT name FROM parties WHERE id = ?)
          AND factory_name = (SELECT name FROM factories WHERE id = ?)
          ${dateFilter('factory_transactions')}
        ORDER BY date DESC, id DESC
      `;

      const factoryPaySql = `
        SELECT id, factory_id, date, amount_received AS amount_paid, remarks, factory_name, total_amount, remaining_amount
        FROM factory_payments
        WHERE factory_name = (SELECT name FROM factories WHERE id = ?)
          AND factory_id = ?
          AND EXISTS (
            SELECT 1 FROM factory_transactions ft
            WHERE ft.factory_id = factory_payments.factory_id
              AND ft.party_name = (SELECT name FROM parties WHERE id = ?)
          )
          ${dateFilter('factory_payments')}
        ORDER BY date DESC, id DESC
      `;

      const paramsTx = [partyId, factoryId, ...dateParams];
      const paramsPay = [partyId, partyId, factoryId, ...dateParams];
      const paramsFactoryTx = [partyId, factoryId, ...dateParams];
      const paramsFactoryPay = [factoryId, factoryId, partyId, ...dateParams];

      const [partyTxRows] = await db.execute(bothTxSql, paramsTx);
      const [partyPayRows] = await db.execute(bothPaySql, paramsPay);
      const [factoryTxRows] = await db.execute(factoryTxSql, paramsFactoryTx);
      const [factoryPayRows] = await db.execute(factoryPaySql, paramsFactoryPay);

      result.party_transactions = this.addSerialAndClean(partyTxRows, 'party_id');
      result.party_payments = this.addSerialAndClean(partyPayRows, 'party_id');
      result.factory_transactions = this.addSerialAndClean(factoryTxRows, 'factory_id');
      result.factory_payments = this.addSerialAndClean(factoryPayRows, 'factory_id');
    }

    return result;
  }
}

module.exports = DashboardService;
