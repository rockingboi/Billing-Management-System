const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/bills', async (req, res) => {
  const {
    s_no,
    party_name,
    bill_date,
    mill_name,
    inv_no,
    inv_date,
    mill_weight,
    truck_no,
    freight,
    tax,
    total,
    grand_total,
    items 
  } = req.body;

  if (!party_name || !bill_date || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO party_bills
      (s_no, party_name, bill_date, mill_name, inv_no, inv_date, mill_weight, truck_no, freight, tax, total, grand_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s_no || null,
        party_name,
        bill_date,
        mill_name || null,
        inv_no || null,
        inv_date || null,
        mill_weight || null,
        truck_no || null,
        freight || null,
        tax || null,
        total || null,
        grand_total || null
      ]
    );

    const billId = result.insertId;

    for (const item of items) {
      const { particular, weight, rate, amount } = item;
      await conn.query(
        `INSERT INTO party_bill_items (bill_id, particular, weight, rate, amount) VALUES (?, ?, ?, ?, ?)`,
        [billId, particular, weight || null, rate || null, amount || null]
      );
    }

    await conn.commit();
    res.status(201).json({ bill_id: billId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    conn.release();
  }
});

router.get('/bills/:id', async (req, res) => {
  const billId = req.params.id;
  try {
    const [billRows] = await pool.query('SELECT * FROM party_bills WHERE id = ?', [billId]);
    if (billRows.length === 0) return res.status(404).json({ error: 'Bill not found' });

    const [items] = await pool.query('SELECT * FROM party_bill_items WHERE bill_id = ?', [billId]);

    res.json({ bill: billRows[0], items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
