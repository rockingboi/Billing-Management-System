## System Billing – Overview

System Billing is a full‑stack billing and ledger management system tailored for small businesses dealing with parties (customers/suppliers) and factories. It helps you record transactions (weight, rate, vehicle, moisture, etc.), track payments received/paid, and view summarized balances (Hisab) for any party or factory over a date range.

### Why this project?
- Keep sales/purchase transactions and money flow organized in one place
- Automatically compute totals and remaining amounts for parties and factories
- Filter history by date, party, and factory to reconcile accounts quickly
- Simple UI to add entries fast; clean API to integrate later if needed

### Key Features
- Parties and Factories management (name, contact, address, GSTIN)
- Transaction recording with detailed fields: date, vehicle no, weight, rate, moisture, rejection, duplex, first/second/third, remarks
- Payments: party payments and factory payments with remaining balance tracking
- Hisab/Tally summary by party/factory and date range
- REST API (Express) + React frontend

### Tech Stack
- Backend: Node.js, Express, MySQL (`mysql2`)
- Frontend: React
- Styling: Tailwind CSS
- Env & tooling: dotenv, nodemon

---

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+ (or compatible)
- Git

### 1) Clone the repository
```bash
git clone https://github.com/rockingboi/Billing-Management-System.git
cd Billing-Management-System
```

### 2) Install dependencies
Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd ../frontend
npm install
```

### 3) Configure environment
Create a database in MySQL (if not already present):
```sql
CREATE DATABASE IF NOT EXISTS systembilling;
```

Create a `.env` file inside `backend/` using `env.example` as reference:
```
backend/.env
```
Example:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=systembilling
DB_USER=root
DB_PASSWORD=your_password
PORT=5001
```

### 4) Initialize database tables
This creates all required tables and columns.
```bash
cd backend
npm run db:init
```

If you prefer manual SQL, run this file in your MySQL client:
```
backend/src/config/schema.sql
```

### 5) Run the app
Start the backend API:
```bash
cd backend
npm run dev    # or: npm start
```

Start the frontend:
```bash
cd ../frontend
npm start
```

Backend default URL: `http://localhost:5001`

### Project structure
```
backend/  - Node.js Express API, MySQL (mysql2)
  src/
    config/       - DB pool, schema, init script
    controllers/  - Route handlers
    repositories/ - SQL queries and data access
    routes/       - Express routes
    services/     - Business logic
frontend/ - React app (Vite/CRA)
```

### Troubleshooting
- Ensure MySQL is running and credentials in `backend/.env` are correct.
- If `npm run db:init` fails, confirm the database exists and user has privileges.
- If you see large file warnings, avoid committing cache/build artifacts. Ensure `.gitignore` excludes `node_modules` and cache folders.

### Scripts reference (backend)
- `npm run dev` – Start server with nodemon
- `npm start` – Start server
- `npm run db:init` – Create/ensure DB tables

### License
ISC


