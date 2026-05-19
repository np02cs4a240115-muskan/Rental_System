'use strict';

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'car_rental_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

const ensureEsewaTransactionColumn = async () => {
  const [rows] = await pool.execute(
    `SELECT COLUMN_NAME
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = 'payments'
       AND COLUMN_NAME = 'transaction_uuid'`,
    [process.env.DB_NAME || 'car_rental_db']
  );

  if (rows.length === 0) {
    await pool.execute(
      `ALTER TABLE payments
       ADD COLUMN transaction_uuid VARCHAR(255) DEFAULT NULL AFTER payment_status`
    );
    console.log('Added missing payments.transaction_uuid column');
  }
};

const ensurePasswordOtpTable = async () => {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS password_otps (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(150) NOT NULL,
      otp VARCHAR(6) NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_password_otps_email (email),
      INDEX idx_password_otps_lookup (email, otp, used)
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
  `);
};

const ensureUserRoleEnum = async () => {
  const [rows] = await pool.execute(
    `SELECT COLUMN_TYPE
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = 'users'
       AND COLUMN_NAME = 'role'`,
    [process.env.DB_NAME || 'car_rental_db']
  );

  if (rows.length > 0 && !String(rows[0].COLUMN_TYPE).includes("'vendor'")) {
    await pool.execute(
      `ALTER TABLE users
       MODIFY role ENUM('user','vendor','admin') NOT NULL DEFAULT 'user'`
    );
    console.log('Updated users.role enum to include vendor');
  }
};

const ensureDefaultAdminPassword = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@carrental.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const [rows] = await pool.execute(
    'SELECT id, password FROM users WHERE email = ? LIMIT 1',
    [adminEmail]
  );

  if (rows.length === 0) return;

  const passwordMatches = await bcrypt.compare(adminPassword, rows[0].password);
  if (passwordMatches) return;

  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, rows[0].id]);
  console.log('Updated default admin password hash');
};

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connected successfully');
    connection.release();
    await ensureUserRoleEnum();
    await ensureEsewaTransactionColumn();
    await ensurePasswordOtpTable();
    await ensureDefaultAdminPassword();
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
    console.error('Make sure XAMPP and MySQL are running.');
    console.error('Check DB_PASSWORD in your .env file.');
    process.exit(1);
  }
})();

module.exports = pool;
