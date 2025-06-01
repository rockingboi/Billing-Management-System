const TransactionRepo = require('../repositories/TransactionRepo');
class DashboardService {
  // Previous methods (can keep or remove as needed)
  static async getPartyDashboard(party_id) {
    const transactions = await TransactionRepo.getPartyTransactions(party_id);
    const payments = await TransactionRepo.getPartyPayments(party_id);
    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remaining = totalAmount - totalPaid;
    return { transactions, payments, totalAmount, totalPaid, remaining };
  }

  static async getFactoryDashboard(factory_id) {
    const transactions = await TransactionRepo.getFactoryTransactions(factory_id);
    const payments = await TransactionRepo.getFactoryPayments(factory_id);
    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remaining = totalAmount - totalReceived;
    return { transactions, payments, totalAmount, totalReceived, remaining };
  }

  // ✅ New: With optional from/to date
  static async getPartySummary(partyId, startDate, endDate) {
    const transactions = await TransactionRepo.getPartyTransactions({ partyId, startDate, endDate });
    const payments = await TransactionRepo.getPartyPayments({ partyId, startDate, endDate });
  
    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.total_amount), 0);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
    const remaining = totalAmount - totalPaid;
  
    return { totalAmount, totalPaid, remaining, transactions, payments };
  }

  static addSerialAndClean(dataArray, idField) {
    if (!dataArray) return [];
    return dataArray.map((item, index) => {
      const newItem = { ...item, serial: index + 1 };
      delete newItem[idField];
      return newItem;
    });
  }

  static async getFilteredHisab(partyId, factoryId, startDate, endDate) {
    // Prepare query parts for date filter
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

    // Prepare date params for queries
    const dateParams = [];
    if (startDate) dateParams.push(startDate);
    if (endDate) dateParams.push(endDate);

    // Result object to collect
    let result = {
      party_transactions: [],
      party_payments: [],
      factory_transactions: [],
      factory_payments: []
    };

    if (partyId && !factoryId) {
      // 1. Only Party selected: get all party_transactions + party_payments for that party with date filter
      // party_transactions
      const partyTxSql = `
        SELECT id, party_id, date, vehicle_no, weight, rate, moisture, rejection, duplex, first, second, third, total_amount, remarks, factory_name, party_name
        FROM party_transactions
        WHERE party_id = ?
        ${dateFilter('party_transactions')}
        ORDER BY date DESC, id DESC
      `;

      // party_payments
      const partyPaySql = `
        SELECT id, party_id, date, amount_paid, remarks, party_name, total_amount, remaining_amount
        FROM party_payments
        WHERE party_id = ?
        ${dateFilter('party_payments')}
        ORDER BY date DESC, id DESC
      `;

      // Build params for transactions and payments separately
      let partyTxParams = [partyId];
      let partyPayParams = [partyId];

      if (startDate && endDate) {
        partyTxParams.push(startDate, endDate);
        partyPayParams.push(startDate, endDate);
      } else if (startDate) {
        partyTxParams.push(startDate);
        partyPayParams.push(startDate);
      } else if (endDate) {
        partyTxParams.push(endDate);
        partyPayParams.push(endDate);
      }

      const [partyTxRows] = await db.execute(partyTxSql, partyTxParams);
      const [partyPayRows] = await db.execute(partyPaySql, partyPayParams);

      result.party_transactions = this.addSerialAndClean(partyTxRows, 'party_id');
      result.party_payments = this.addSerialAndClean(partyPayRows, 'party_id');

      // factory side stays empty
      result.factory_transactions = [];
      result.factory_payments = [];

    } else if (!partyId && factoryId) {
      // 2. Only Factory selected: get all factory_transactions + factory_payments for that factory with date filter

      const factoryTxSql = `
        SELECT id, factory_id, date, vehicle_no, weight, rate, total_amount, remarks, factory_name, party_name
        FROM factory_transactions
        WHERE factory_id = ?
        ${dateFilter('factory_transactions')}
        ORDER BY date DESC, id DESC
      `;

      const factoryPaySql = `
        SELECT id, factory_id, date, amount_received, remarks, factory_name, total_amount, remaining_amount
        FROM factory_payments
        WHERE factory_id = ?
        ${dateFilter('factory_payments')}
        ORDER BY date DESC, id DESC
      `;

      let factoryTxParams = [factoryId];
      let factoryPayParams = [factoryId];

      if (startDate && endDate) {
        factoryTxParams.push(startDate, endDate);
        factoryPayParams.push(startDate, endDate);
      } else if (startDate) {
        factoryTxParams.push(startDate);
        factoryPayParams.push(startDate);
      } else if (endDate) {
        factoryTxParams.push(endDate);
        factoryPayParams.push(endDate);
      }

      const [factoryTxRows] = await db.execute(factoryTxSql, factoryTxParams);
      const [factoryPayRows] = await db.execute(factoryPaySql, factoryPayParams);

      result.factory_transactions = this.addSerialAndClean(factoryTxRows, 'factory_id');
      result.factory_payments = this.addSerialAndClean(factoryPayRows, 'factory_id');

      // party side empty
      result.party_transactions = [];
      result.party_payments = [];

    } else if (partyId && factoryId) {
      // 3. Both party and factory selected:
      // Get party_transactions and party_payments where party_name AND factory_name both match, and apply date filter
      // Similarly for factory side (optional, but mostly symmetrical)

      // Note: party_transactions contains factory_name and party_name columns, so filter on those

      const bothTxSql = `
        SELECT id, party_id, date, vehicle_no, weight, rate, moisture, rejection, duplex, first, second, third, total_amount, remarks, factory_name, party_name
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

      // Factory transactions filtered by party_name and factory_name
      const factoryTxSql = `
        SELECT id, factory_id, date, vehicle_no, weight, rate, total_amount, remarks, factory_name, party_name
        FROM factory_transactions
        WHERE party_name = (SELECT name FROM parties WHERE id = ?)
          AND factory_name = (SELECT name FROM factories WHERE id = ?)
          ${dateFilter('factory_transactions')}
        ORDER BY date DESC, id DESC
      `;

      const factoryPaySql = `
        SELECT id, factory_id, date, amount_received, remarks, factory_name, total_amount, remaining_amount
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

      // Prepare parameters
      let paramsTx = [partyId, factoryId];
      let paramsPay = [partyId, partyId, factoryId];
      let paramsFactoryTx = [partyId, factoryId];
      let paramsFactoryPay = [factoryId, factoryId, partyId];

      // Add date params if needed
      if (startDate && endDate) {
        paramsTx.push(startDate, endDate);
        paramsPay.push(startDate, endDate);
        paramsFactoryTx.push(startDate, endDate);
        paramsFactoryPay.push(startDate, endDate);
      } else if (startDate) {
        paramsTx.push(startDate);
        paramsPay.push(startDate);
        paramsFactoryTx.push(startDate);
        paramsFactoryPay.push(startDate);
      } else if (endDate) {
        paramsTx.push(endDate);
        paramsPay.push(endDate);
        paramsFactoryTx.push(endDate);
        paramsFactoryPay.push(endDate);
      }

      // Execute queries
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
  

  static async getFactorySummary(factoryId, startDate, endDate) {
    const transactions = await TransactionRepo.getFactoryTransactions({ factoryId, startDate, endDate });
    const payments = await TransactionRepo.getFactoryPayments({ factoryId, startDate, endDate });
  
    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.total_amount), 0);
    const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
    const remaining = totalAmount - totalReceived;
  
    return { totalAmount, totalReceived, remaining, transactions, payments };
  }
}

module.exports = DashboardService;
