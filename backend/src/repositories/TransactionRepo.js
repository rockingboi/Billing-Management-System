const pool = require('../config/db.config');
const PartyTransaction = require('../models/PartyTransaction');
const FactoryTransaction = require('../models/FactoryTransaction');
const PartyPayment = require('../models/PartyPayment');
const FactoryPayment = require('../models/FactoryPayment');

class TransactionRepo {
  // ===================== PARTY TRANSACTIONS =====================
  static async createPartyTransaction(data) {
    const {
      party_id, party_name, factory_name, date, vehicle_no,
      weight, rate, moisture, rejection, duplex, first, second, third,
      total_amount, remarks
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO party_transactions 
      (party_id, party_name, factory_name, date, vehicle_no, weight, rate, moisture, rejection, duplex, first, second, third, total_amount, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        party_id ?? null, party_name ?? null, factory_name ?? null, date ?? null,
        vehicle_no ?? null, weight ?? null, rate ?? null, moisture ?? null,
        rejection ?? null, duplex ?? null, first ?? null, second ?? null,
        third ?? null, total_amount ?? null, remarks ?? null
      ]
    );

    return new PartyTransaction({ id: result.insertId, ...data });
  }

  static async getPartyTransactions(party_id) {
    const [rows] = await pool.execute(
      `SELECT * FROM party_transactions WHERE party_id = ? ORDER BY date DESC`,
      [party_id]
    );
    return rows.map(row => new PartyTransaction(row));
  }

  static async getPartyTransactionsByDate(party_id, from, to) {
    let sql = `SELECT * FROM party_transactions WHERE party_id = ?`;
    const params = [party_id];
    if (from) {
      sql += ' AND date >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND date <= ?';
      params.push(to);
    }
    sql += ' ORDER BY date DESC';
    const [rows] = await pool.execute(sql, params);
    return rows.map(row => new PartyTransaction(row));
  }

  // ===================== FACTORY TRANSACTIONS =====================
  static async createFactoryTransaction(data) {
    const {
      factory_id, factory_name, party_name, date, vehicle_no,
      weight, rate, total_amount, remarks
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO factory_transactions 
      (factory_id, factory_name, party_name, date, vehicle_no, weight, rate, total_amount, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        factory_id ?? null, factory_name ?? null, party_name ?? null, date ?? null,
        vehicle_no ?? null, weight ?? null, rate ?? null, total_amount ?? null, remarks ?? null
      ]
    );

    return new FactoryTransaction({ id: result.insertId, ...data });
  }

  static async getFactoryTransactions(factory_id) {
    const [rows] = await pool.execute(
      `SELECT * FROM factory_transactions WHERE factory_id = ? ORDER BY date DESC`,
      [factory_id]
    );
    return rows.map(row => new FactoryTransaction(row));
  }

  static async getFactoryTransactionsByDate(factory_id, from, to) {
    let sql = `SELECT * FROM factory_transactions WHERE factory_id = ?`;
    const params = [factory_id];
    if (from) {
      sql += ' AND date >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND date <= ?';
      params.push(to);
    }
    sql += ' ORDER BY date DESC';
    const [rows] = await pool.execute(sql, params);
    return rows.map(row => new FactoryTransaction(row));
  }

  // ===================== PARTY PAYMENTS =====================
  static async createPartyPayment(data) {
    let { party_id, party_name, date, amount_paid, remarks } = data;

    if (!party_id || !amount_paid) throw new Error('party_id and amount_paid are required');

    if (!party_name) {
      const [[party]] = await pool.execute('SELECT name FROM parties WHERE id = ?', [party_id]);
      if (!party) throw new Error('Party not found');
      party_name = party.name;
    }

    const [[{ total_amount = 0 }]] = await pool.execute(
      'SELECT SUM(total_amount) AS total_amount FROM party_transactions WHERE party_id = ?',
      [party_id]
    );

    const [[{ paid_amount = 0 }]] = await pool.execute(
      'SELECT SUM(amount_paid) AS paid_amount FROM party_payments WHERE party_id = ?',
      [party_id]
    );

    const remaining_amount = parseFloat(total_amount) - parseFloat(paid_amount) - parseFloat(amount_paid);

    const [result] = await pool.execute(
      `INSERT INTO party_payments (party_id, party_name, date, amount_paid, remarks, total_amount, remaining_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [party_id, party_name, date ?? null, amount_paid, remarks ?? null, total_amount, remaining_amount]
    );

    return new PartyPayment({ id: result.insertId, party_id, party_name, date, amount_paid, remarks, total_amount, remaining_amount });
  }

  static async getPartyPayments(party_id) {
    const [rows] = await pool.execute(
      `SELECT * FROM party_payments WHERE party_id = ? ORDER BY date DESC`,
      [party_id]
    );
    return rows.map(row => new PartyPayment(row));
  }

  static async getPartyPaymentsByDate(party_id, from, to) {
    let sql = `SELECT * FROM party_payments WHERE party_id = ?`;
    const params = [party_id];
    if (from) {
      sql += ' AND date >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND date <= ?';
      params.push(to);
    }
    sql += ' ORDER BY date DESC';
    const [rows] = await pool.execute(sql, params);
    return rows.map(row => new PartyPayment(row));
  }

  // ===================== FACTORY PAYMENTS =====================
  static async createFactoryPayment(data) {
    let { factory_id, factory_name, date, amount_received, remarks } = data;

    if (!factory_id || !amount_received) throw new Error('factory_id and amount_received are required');

    if (!factory_name) {
      const [[factory]] = await pool.execute('SELECT name FROM factories WHERE id = ?', [factory_id]);
      if (!factory) throw new Error('Factory not found');
      factory_name = factory.name;
    }

    const [[{ total_amount = 0 }]] = await pool.execute(
      'SELECT SUM(total_amount) AS total_amount FROM factory_transactions WHERE factory_id = ?',
      [factory_id]
    );

    const [[{ received_amount = 0 }]] = await pool.execute(
      'SELECT SUM(amount_received) AS received_amount FROM factory_payments WHERE factory_id = ?',
      [factory_id]
    );

    const remaining_amount = parseFloat(total_amount) - parseFloat(received_amount) - parseFloat(amount_received);

    const [result] = await pool.execute(
      `INSERT INTO factory_payments (factory_id, factory_name, date, amount_received, remarks, total_amount, remaining_amount)  
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [factory_id, factory_name, date ?? null, amount_received, remarks ?? null, total_amount, remaining_amount]
    );

    return new FactoryPayment({ id: result.insertId, factory_id, factory_name, date, amount_received, remarks, total_amount, remaining_amount });
  }

  static async getFactoryPayments(factory_id) {
    const [rows] = await pool.execute(
      `SELECT * FROM factory_payments WHERE factory_id = ? ORDER BY date DESC`,
      [factory_id]
    );
    return rows.map(row => new FactoryPayment(row));
  }

  static async getFactoryPaymentsByDate(factory_id, from, to) {
    let sql = `SELECT * FROM factory_payments WHERE factory_id = ?`;
    const params = [factory_id];
    if (from) {
      sql += ' AND date >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND date <= ?';
      params.push(to);
    }
    sql += ' ORDER BY date DESC';
    const [rows] = await pool.execute(sql, params);
    return rows.map(row => new FactoryPayment(row));
  }

  // // ===================== FILTER COMBINED TRANSACTIONS =====================
  // static async filterTransactions({ startDate, endDate, partyId, factoryId }) {
  //   let sql = `
  //     SELECT * FROM (
  //       SELECT id, party_id, NULL AS factory_id, total_amount, date, 'party_transaction' AS type
  //       FROM party_transactions
  //       UNION ALL
  //       SELECT id, NULL AS party_id, factory_id, total_amount, date, 'factory_transaction' AS type
  //       FROM factory_transactions
  //     ) AS transactions WHERE 1=1
  //   `;
  //   const params = [];

  //   if (startDate) {
  //     sql += " AND date >= ?";
  //     params.push(startDate);
  //   }

  //   if (endDate) {
  //     sql += " AND date <= ?";
  //     params.push(endDate);
  //   }

  //   if (partyId) {
  //     sql += " AND party_id = ?";
  //     params.push(partyId);
  //   }

  //   if (factoryId) {
  //     sql += " AND factory_id = ?";
  //     params.push(factoryId);
  //   }

  //   const [rows] = await pool.execute(sql, params);
  //   return rows;
  // }

  static async getHisab({ partyId, factoryId, startDate, endDate }) {
    let results = [];
    let serial = 1;
  
    // Helper to add serial numbers
    const addSerial = (rows) => rows.map(row => ({ serial_number: serial++, ...row }));
  
    // Helper function to get party_name or factory_name from id
    async function getPartyName(id) {
      if (!id) return null;
      const [[party]] = await pool.execute('SELECT name FROM parties WHERE id = ?', [id]);
      return party ? party.name : null;
    }
    async function getFactoryName(id) {
      if (!id) return null;
      const [[factory]] = await pool.execute('SELECT name FROM factories WHERE id = ?', [id]);
      return factory ? factory.name : null;
    }
  
    if (partyId && !factoryId) {
      // party-only
  
      const partyName = await getPartyName(partyId);
  
      // party_transactions
      let sqlPT = `SELECT id, date, vehicle_no, weight, rate, moisture, rejection, duplex, first, second, third, total_amount, remarks, factory_name, party_name, 'party_transaction' AS type FROM party_transactions WHERE party_id = ?`;
      let paramsPT = [partyId];
  
      // party_payments
      let sqlPP = `SELECT id, date, amount_paid, remarks, party_name, total_amount, remaining_amount, 'party_payment' AS type FROM party_payments WHERE party_id = ?`;
      let paramsPP = [partyId];
  
      if (startDate) {
        sqlPT += ' AND date >= ?';
        sqlPP += ' AND date >= ?';
        paramsPT.push(startDate);
        paramsPP.push(startDate);
      }
      if (endDate) {
        sqlPT += ' AND date <= ?';
        sqlPP += ' AND date <= ?';
        paramsPT.push(endDate);
        paramsPP.push(endDate);
      }
  
      sqlPT += ' ORDER BY date DESC';
      sqlPP += ' ORDER BY date DESC';
  
      const [partyTransactions] = await pool.execute(sqlPT, paramsPT);
      const [partyPayments] = await pool.execute(sqlPP, paramsPP);
  
      results = addSerial([...partyTransactions, ...partyPayments]);
  
    } else if (partyId && factoryId) {
      // party + factory combined
      const partyName = await getPartyName(partyId);
      const factoryName = await getFactoryName(factoryId);
  
      // party_transactions filtered by party_name & factory_name
      let sqlPT = `SELECT id, date, vehicle_no, weight, rate, moisture, rejection, duplex, first, second, third, total_amount, remarks, factory_name, party_name, 'party_transaction' AS type
        FROM party_transactions WHERE party_name = ? AND factory_name = ?`;
      let paramsPT = [partyName, factoryName];
  
      // party_payments filtered by party_id only (no factory info)
      let sqlPP = `SELECT id, date, amount_paid, remarks, party_name, total_amount, remaining_amount, 'party_payment' AS type FROM party_payments WHERE party_id = ?`;
      let paramsPP = [partyId];
  
      // factory_transactions filtered by factory_name & party_name
      let sqlFT = `SELECT id, date, vehicle_no, weight, rate, total_amount, remarks, factory_name, party_name, 'factory_transaction' AS type
        FROM factory_transactions WHERE factory_name = ? AND party_name = ?`;
      let paramsFT = [factoryName, partyName];
  
      // factory_payments filtered by factory_id only
      let sqlFP = `SELECT id, date, amount_received, remarks, factory_name, total_amount, remaining_amount, 'factory_payment' AS type FROM factory_payments WHERE factory_id = ?`;
      let paramsFP = [factoryId];
  
      if (startDate) {
        sqlPT += ' AND date >= ?'; paramsPT.push(startDate);
        sqlPP += ' AND date >= ?'; paramsPP.push(startDate);
        sqlFT += ' AND date >= ?'; paramsFT.push(startDate);
        sqlFP += ' AND date >= ?'; paramsFP.push(startDate);
      }
      if (endDate) {
        sqlPT += ' AND date <= ?'; paramsPT.push(endDate);
        sqlPP += ' AND date <= ?'; paramsPP.push(endDate);
        sqlFT += ' AND date <= ?'; paramsFT.push(endDate);
        sqlFP += ' AND date <= ?'; paramsFP.push(endDate);
      }
  
      sqlPT += ' ORDER BY date DESC';
      sqlPP += ' ORDER BY date DESC';
      sqlFT += ' ORDER BY date DESC';
      sqlFP += ' ORDER BY date DESC';
  
      const [partyTransactions] = await pool.execute(sqlPT, paramsPT);
      const [partyPayments] = await pool.execute(sqlPP, paramsPP);
      const [factoryTransactions] = await pool.execute(sqlFT, paramsFT);
      const [factoryPayments] = await pool.execute(sqlFP, paramsFP);
  
      results = addSerial([
        ...partyTransactions,
        ...partyPayments,
        ...factoryTransactions,
        ...factoryPayments
      ]);
  
    } else if (!partyId && factoryId) {
      // factory only
      const factoryName = await getFactoryName(factoryId);
  
      let sqlFT = `SELECT id, date, vehicle_no, weight, rate, total_amount, remarks, factory_name, party_name, 'factory_transaction' AS type
        FROM factory_transactions WHERE factory_name = ?`;
      let paramsFT = [factoryName];
  
      let sqlFP = `SELECT id, date, amount_received, remarks, factory_name, total_amount, remaining_amount, 'factory_payment' AS type FROM factory_payments WHERE factory_id = ?`;
      let paramsFP = [factoryId];
  
      if (startDate) {
        sqlFT += ' AND date >= ?'; paramsFT.push(startDate);
        sqlFP += ' AND date >= ?'; paramsFP.push(startDate);
      }
      if (endDate) {
        sqlFT += ' AND date <= ?'; paramsFT.push(endDate);
        sqlFP += ' AND date <= ?'; paramsFP.push(endDate);
      }
  
      sqlFT += ' ORDER BY date DESC';
      sqlFP += ' ORDER BY date DESC';
  
      const [factoryTransactions] = await pool.execute(sqlFT, paramsFT);
      const [factoryPayments] = await pool.execute(sqlFP, paramsFP);
  
      results = addSerial([...factoryTransactions, ...factoryPayments]);
    } else {
      // no filters given, return empty or throw error
      results = [];
    }
  
    return results;
  }
  
}

module.exports = TransactionRepo;
