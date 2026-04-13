CREATE DATABASE IF NOT EXISTS car_rental_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE car_rental_db;

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED         AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)         NOT NULL,
  email       VARCHAR(150)         NOT NULL UNIQUE,
  password    VARCHAR(255)         NOT NULL DEFAULT '',
  phone       VARCHAR(20)          DEFAULT NULL UNIQUE,   -- unique per user
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  google_id   VARCHAR(255)         DEFAULT NULL UNIQUE,
  image       VARCHAR(500)         DEFAULT NULL,
  created_at  TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── CARS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cars (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150)   NOT NULL,
  brand         VARCHAR(100)   NOT NULL,
  model         VARCHAR(100)   NOT NULL,
  year          YEAR           NOT NULL,
  price_per_day DECIMAL(10,2)  NOT NULL,
  availability  BOOLEAN        NOT NULL DEFAULT TRUE,
  image         VARCHAR(500)   DEFAULT NULL,
  created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── BOOKINGS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED   NOT NULL,
  car_id      INT UNSIGNED   NOT NULL,
  start_date  DATE           NOT NULL,
  end_date    DATE           NOT NULL,
  total_price DECIMAL(10,2)  NOT NULL,
  status      ENUM('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id)  REFERENCES cars(id)  ON DELETE CASCADE,
  INDEX idx_car_dates (car_id, start_date, end_date),
  INDEX idx_user      (user_id)
) ENGINE=InnoDB;

-- ── PAYMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id     INT UNSIGNED  NOT NULL UNIQUE,
  amount         DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50)   NOT NULL DEFAULT 'cash',
  payment_status ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Seed: Default admin account (password = "Admin@123") ─────
-- Generate a fresh hash with: node -e "const b=require('bcryptjs');b.hash('Admin@123',12).then(console.log)"
-- then replace the hash below before running in production.
INSERT IGNORE INTO users (name, email, password, phone, role)
VALUES (
  'Admin',
  'admin@carrental.com',
  '$2a$12$placeholder_replace_with_real_bcrypt_hash_of_Admin@123',
  '0000000000',
  'admin'
);
