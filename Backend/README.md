# 🚗 Car Rental Backend API

Production-ready REST API built with **Node.js**, **Express**, and **MySQL (XAMPP)**.

---

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Runtime      | Node.js                           |
| Framework    | Express.js                        |
| Database     | MySQL via mysql2 (promise pool)   |
| Auth         | JWT (jsonwebtoken)                |
| Passwords    | bcryptjs (salt rounds: 12)        |
| Validation   | express-validator                 |
| Config       | dotenv                            |

---

## Project Structure

```
car-rental-backend/
├── config/
│   ├── db.js           # MySQL connection pool
│   └── schema.sql      # Database schema + seed
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── carController.js
│   ├── bookingController.js
│   └── paymentController.js
├── middleware/
│   ├── auth.js         # JWT protect + restrictTo
│   ├── validate.js     # express-validator error handler
│   └── errorHandler.js # Global 404 + error handler
├── models/
│   ├── User.js
│   ├── Car.js
│   ├── Booking.js
│   └── Payment.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── carRoutes.js
│   ├── bookingRoutes.js
│   └── paymentRoutes.js
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

---

## Setup & Run

### 1. Prerequisites
- XAMPP installed and **Apache + MySQL running**
- Node.js ≥ 18

### 2. Database
1. Open **phpMyAdmin** → `http://localhost/phpmyadmin`
2. Create a new database named `car_rental_db`
3. Click the database → **SQL tab** → paste and run `config/schema.sql`

### 3. Install dependencies
```bash
npm install
```

### 4. Configure environment
```bash
cp .env.example .env
```
Edit `.env` — the defaults work with a fresh XAMPP install (root user, no password):
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=car_rental_db
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
```

### 5. Start the server
```bash
# Development (auto-restart on file change)
npm run dev

# Production
npm start
```

Server starts at **http://localhost:5000**

---

## API Reference

### Auth  `/api/auth`

| Method | Endpoint             | Auth | Description        |
|--------|----------------------|------|--------------------|
| POST   | `/register`          | —    | Register new user  |
| POST   | `/login`             | —    | Login, get JWT     |
| GET    | `/me`                | User | Get current user   |

**Register body:**
```json
{ "name": "John", "email": "john@example.com", "password": "secret123", "phone": "9800000000" }
```

**Login body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

**Login response:**
```json
{
  "success": true,
  "token": "<JWT>",
  "user": { "id": 1, "name": "John", "email": "...", "role": "user" }
}
```

> Use the token as `Authorization: Bearer <token>` header for protected routes.

---

### Users  `/api/users`

| Method | Endpoint    | Auth  | Description         |
|--------|-------------|-------|---------------------|
| GET    | `/profile`  | User  | Get own profile     |
| PUT    | `/profile`  | User  | Update own profile  |
| GET    | `/`         | Admin | List all users      |

---

### Cars  `/api/cars`

| Method | Endpoint  | Auth  | Description       |
|--------|-----------|-------|-------------------|
| GET    | `/`       | —     | List all cars     |
| GET    | `/?available=true` | — | Available cars only |
| GET    | `/:id`    | —     | Get single car    |
| POST   | `/`       | Admin | Add a car         |
| PUT    | `/:id`    | Admin | Update a car      |
| DELETE | `/:id`    | Admin | Delete a car      |

**Create car body:**
```json
{
  "name": "Fortuner",
  "brand": "Toyota",
  "model": "Fortuner 4x4",
  "year": 2023,
  "price_per_day": 8500,
  "availability": true,
  "image": "https://example.com/fortuner.jpg"
}
```

---

### Bookings  `/api/bookings`

| Method | Endpoint           | Auth  | Description              |
|--------|--------------------|-------|--------------------------|
| POST   | `/`                | User  | Create booking           |
| GET    | `/my`              | User  | My bookings              |
| GET    | `/`                | Admin | All bookings             |
| GET    | `/:id`             | User  | Single booking           |
| PATCH  | `/:id/cancel`      | User  | Cancel booking           |
| PATCH  | `/:id/status`      | Admin | Update booking status    |

**Create booking body:**
```json
{ "car_id": 1, "start_date": "2025-06-01", "end_date": "2025-06-05" }
```

**Response includes auto-calculated total_price** (`days × price_per_day`).

> Double-booking is prevented: the API returns `409 Conflict` if the car is already booked for overlapping dates.

---

### Payments  `/api/payments`

| Method | Endpoint                    | Auth  | Description             |
|--------|-----------------------------|-------|-------------------------|
| POST   | `/`                         | User  | Create payment          |
| GET    | `/booking/:bookingId`       | User  | Payment for a booking   |
| PATCH  | `/:id/status`               | Admin | Update payment status   |

**Create payment body:**
```json
{ "booking_id": 1, "payment_method": "card" }
```

> When admin marks a payment as `completed`, the linked booking is automatically set to `confirmed`.

---

## Business Rules

- **Double-booking prevention** — date-overlap SQL query blocks conflicting reservations.
- **Total price** — automatically calculated as `CEIL(days) × price_per_day`.
- **Role-based access** — `admin` role required for car CRUD, all-bookings list, status updates.
- **Ownership checks** — users can only view/cancel their own bookings and payments.
- **Cascade deletes** — deleting a user removes their bookings; deleting a booking removes its payment.

---

## Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [{ "field": "email", "message": "Valid email is required" }]
}
```

HTTP status codes: `400` Bad Request · `401` Unauthorized · `403` Forbidden · `404` Not Found · `409` Conflict · `422` Validation Error · `500` Server Error
