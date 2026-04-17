// config/db.js
'use strict';

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * XAMPP MySQL Connection Pool
 *
 * XAMPP MySQL defaults:
 *  - Host: localhost
 *  - Port: 3306
 *  - User: root
 *  - Password: (empty string by default)
 *  - No auth plugin issues — XAMPP uses MySQL 5.7 / MariaDB by default
 *
 * To use a custom password, set DB_PASSWORD in your .env file.
 */
const pool = mysql.createPool({
  host:              process.env.DB_HOST     || 'localhost',
  port:              parseInt(process.env.DB_PORT || '3306', 10),
  user:              process.env.DB_USER     || 'root',
  password:          process.env.DB_PASSWORD || '',   // XAMPP default: empty password
  database:          process.env.DB_NAME     || 'car_rental_db',
  waitForConnections: true,
  connectionLimit:   10,
  queueLimit:        0,
  charset:           'utf8mb4',
});

// Test the connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅  XAMPP MySQL connected successfully');
    connection.release();
  } catch (err) {
    console.error('❌  XAMPP MySQL connection failed:', err.message);
    console.error('👉  Make sure XAMPP is running and MySQL is started in the XAMPP Control Panel.');
    console.error('👉  Check your DB_PASSWORD in .env (leave empty if you have not set a root password).');
    process.exit(1);
  }
})();

module.exports = pool;
