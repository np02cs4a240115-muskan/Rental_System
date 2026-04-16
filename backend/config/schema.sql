-- ============================================================
--  Car Rental DB — Schema for MySQL Workbench (MySQL 8+)
--  Run this script once in MySQL Workbench:
--    File → Open SQL Script → Run (Ctrl+Shift+Enter)
-- ============================================================

CREATE DATABASE IF NOT EXISTS car_rental_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE car_rental_db;

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)         NOT NULL,
  email       VARCHAR(150)         NOT NULL UNIQUE,
  password    VARCHAR(255)         NOT NULL,
  phone       VARCHAR(20)          DEFAULT NULL,
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at  TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ── CARS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cars (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150)  NOT NULL,
  brand         VARCHAR(100)  NOT NULL,
  model         VARCHAR(100)  NOT NULL,
  year          YEAR          NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  availability  BOOLEAN       NOT NULL DEFAULT TRUE,
  image         VARCHAR(500)  DEFAULT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ── BOOKINGS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED  NOT NULL,
  car_id      INT UNSIGNED  NOT NULL,
  start_date  DATE          NOT NULL,
  end_date    DATE          NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status      ENUM('pending','confirmed','cancelled','completed')
              NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_booking_car  FOREIGN KEY (car_id)  REFERENCES cars(id)   ON DELETE CASCADE,
  INDEX idx_car_dates (car_id, start_date, end_date),
  INDEX idx_user      (user_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ── PAYMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id     INT UNSIGNED  NOT NULL UNIQUE,
  amount         DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50)   NOT NULL DEFAULT 'cash',
  payment_status ENUM('pending','completed','failed','refunded')
                 NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ── SEED: Default admin account (password = "Admin@123") ─────
INSERT IGNORE INTO users (name, email, password, phone, role)
VALUES (
  'Admin',
  'admin@carrental.com',
  '$2b$12$lmW0iVeRWXeIZV4ggrXnKeQUCqJPO.J9aYDr8iQVyLV4w7u0u32sK',
  '0000000000',
  'admin'
);
