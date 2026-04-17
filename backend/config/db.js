// config/db.js
'use strict';

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * MySQL Workbench Connection Pool
 *
 * MySQL Workbench uses the same MySQL protocol as XAMPP, but:
 *  - Password is usually set (not empty) — set DB_PASSWORD in your .env
 *  - Default auth plugin is caching_sha2_password (MySQL 8+)
 *    mysql2 handles this automatically, but if you see auth errors
 *    you can run in Workbench: ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'yourpassword';
 */
const pool = mysql.createPool({
  host:              process.env.DB_HOST     || 'localhost',
  port:              parseInt(process.env.DB_PORT || '3306', 10),
  user:              process.env.DB_USER     || 'root',
  password:          process.env.DB_PASSWORD || 'batman',
  database:          process.env.DB_NAME     || 'car_rental_db',
  waitForConnections: true,
  connectionLimit:   10,
  queueLimit:        0,
  charset:           'utf8mb4',
  // mysql2 handles caching_sha2_password natively on MySQL 8+.
  // Do NOT override authPlugins — the custom override breaks auth.
});

// Test the connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅  MySQL Workbench connected successfully');
    connection.release();
  } catch (err) {
    console.error('❌  MySQL Workbench connection failed:', err.message);
    console.error('👉  Check your DB_PASSWORD in .env and ensure MySQL Workbench server is running.');
    process.exit(1);
  }
})();

module.exports = pool;
