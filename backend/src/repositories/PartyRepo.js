const pool = require('../config/db.config');
const Party = require('../models/Party');

class PartyRepo {
  static async create(partyData) {
    const { name, contact, address, gstin } = partyData;
    const [result] = await pool.execute(
      `INSERT INTO parties (name, contact, address, gstin) VALUES (?, ?, ?, ?)`,
      [name, contact, address, gstin]
    );
    return new Party({ id: result.insertId, ...partyData });
  }

  static async findAll() {
    const [rows] = await pool.execute(`SELECT * FROM parties`);
    return rows.map(row => new Party(row));
  }

  static async findById(id) {
    const [rows] = await pool.execute(`SELECT * FROM parties WHERE id = ?`, [id]);
    return rows.length ? new Party(rows[0]) : null;
  }

  static async update(id, partyData) {
    const { name, contact, address, gstin } = partyData;
    await pool.execute(
      `UPDATE parties SET name = ?, contact = ?, address = ?, gstin = ? WHERE id = ?`,
      [name, contact, address, gstin, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute(`DELETE FROM parties WHERE id = ?`, [id]);
  }

  static async filterParties({ name }) {
    let sql = `SELECT * FROM parties WHERE 1=1`;
    const params = [];
    if (name) {
      sql += ` AND name LIKE ?`;
      params.push(`%${name}%`);
    }
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
}

module.exports = PartyRepo;
