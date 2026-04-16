# Car Rental Backend — MySQL Workbench Setup

## Prerequisites
- Node.js 18+
- MySQL Workbench (MySQL 8.x recommended)

---

## 1. Set up the Database in MySQL Workbench

1. Open **MySQL Workbench** and connect to your local MySQL instance.
2. Go to **File → Open SQL Script** and select `config/schema.sql`.
3. Click the ⚡ **Run All** button (or press `Ctrl+Shift+Enter`).
4. The script creates the `car_rental_db` database, all tables, and a default admin user.

> **Default admin credentials**
> - Email: `admin@carrental.com`
> - Password: `Admin@123`

---

## 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your MySQL Workbench password:

```bash
cp .env.example .env
```

```
PORT=5001
NODE_ENV=development

# MySQL Workbench connection
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_workbench_password   ← set this
DB_NAME=car_rental_db

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

> **MySQL 8 Auth Note:** If you see `caching_sha2_password` errors, run this once in Workbench:
> ```sql
> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'yourpassword';
> FLUSH PRIVILEGES;
> ```

---

## 3. Install & Run

```bash
npm install
npm run dev      # development (nodemon)
npm start        # production
```

Server starts at `http://localhost:5001`

---

## API Endpoints

| Method | Route               | Auth     | Description          |
|--------|---------------------|----------|----------------------|
| POST   | /api/auth/register  | No       | Register user        |
| POST   | /api/auth/login     | No       | Login (email/phone)  |
| GET    | /api/auth/me        | JWT      | Current user         |
| GET    | /api/cars           | No       | List all cars        |
| POST   | /api/cars           | Admin    | Add a car            |
| GET    | /api/bookings       | JWT      | User bookings        |
| POST   | /api/bookings       | JWT      | Create booking       |
| GET    | /api/payments       | JWT      | Payment history      |
| POST   | /api/payments       | JWT      | Make payment         |

---

## Login Fix (Applied)
- Login now accepts **email OR phone number** as the `identifier` field.
- Generic `"Invalid credentials"` message prevents user enumeration.
- JWT token is only issued on login, not registration.
