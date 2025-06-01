const pool = require('../config/db.config');
const Factory = require('../models/Factory');

class FactoryRepo {
  static async create(factoryData) {
    const { name, contact, address, gstin } = factoryData;
    const [result] = await pool.execute(
      `INSERT INTO factories (name, contact, address, gstin) VALUES (?, ?, ?, ?)`,
      [name, contact, address, gstin]
    );
    return new Factory({ id: result.insertId, ...factoryData });
  }

  static async findAll() {
    const [rows] = await pool.execute(`SELECT * FROM factories`);
    return rows.map(row => new Factory(row));
  }

  static async findById(id) {
    const [rows] = await pool.execute(`SELECT * FROM factories WHERE id = ?`, [id]);
    return rows.length ? new Factory(rows[0]) : null;
  }

  static async update(id, factoryData) {
    const { name, contact, address, gstin } = factoryData;
    await pool.execute(
      `UPDATE factories SET name = ?, contact = ?, address = ?, gstin = ? WHERE id = ?`,
      [name, contact, address, gstin, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute(`DELETE FROM factories WHERE id = ?`, [id]);
  }

  static async filterFactories(filters) {
    let sql = `SELECT * FROM factories WHERE 1=1`;
    const params = [];

    if (filters.name) {
      sql += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    const [rows] = await pool.execute(sql, params);
    return rows;
  }
}

module.exports = FactoryRepo;
