## System Billing – Quick Start

A full-stack billing management system.

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


