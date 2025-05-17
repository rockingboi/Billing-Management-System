const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'billingsystem',
  waitForConnections: true,
  port: 8889,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
