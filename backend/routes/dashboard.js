const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/factory-summary', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        f.id,
        f.name,
        IFNULL(SUM(CASE WHEN ft.type = 'loading' THEN ft.amount ELSE 0 END), 0) AS total_loading,
        IFNULL(SUM(CASE WHEN ft.type = 'credit' THEN ft.amount ELSE 0 END), 0) AS total_credit,
        (IFNULL(SUM(CASE WHEN ft.type = 'loading' THEN ft.amount ELSE 0 END), 0) - IFNULL(SUM(CASE WHEN ft.type = 'credit' THEN ft.amount ELSE 0 END), 0)) AS balance
      FROM factories f
      LEFT JOIN factory_transactions ft ON ft.factory_id = f.id
      GROUP BY f.id, f.name
      ORDER BY f.name
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
