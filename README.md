# Database-Systems-Project

Job application web app with:
- React + Vite frontend
- Node + Express backend
- MySQL database

## Prerequisites

Install these first:
- Node.js (v18+ recommended)
- npm (comes with Node.js)
- MySQL Server 8.x (or compatible)
- MySQL Workbench (recommended, optional but very useful)

## 1) Clone and install dependencies

```bash
git clone <your-repo-url>
cd Database-Systems-Project
```

Install frontend packages:

```bash
cd frontend
npm install
```

Install backend packages:

```bash
cd ../backend
npm install
```

## 2) Set up your own MySQL Server

You are expected to host your own local MySQL server instance.

1. Start MySQL Server on your machine.
2. Log in with a MySQL account (for example `root`) and your own password.
3. Run the schema script:

```bash
mysql -u root -p < ../database/schema/create_tables.sql
```

If you are in the project root instead, use:

```bash
mysql -u root -p < database/schema/create_tables.sql
```

When prompted, enter your MySQL password.

This script creates:
- schema: `JobApplications`
- all required tables
- sample seed data

## 3) Configure backend environment variables

Create/update `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_OWN_MYSQL_PASSWORD
DB_NAME=JobApplications
```

Important:
- `DB_PASSWORD` must be your own MySQL password.
- `DB_USER` can be `root` or another user with permissions on `JobApplications`.

## 4) Run backend

From `backend`:

```bash
npm run dev
```

Expected output:

```text
API running on http://localhost:5000
```

Test API health:
- `http://localhost:5000/api/health`

## 5) Run frontend

Open a second terminal. From `frontend`:

```bash
npm run dev
```

Open the Vite URL shown in terminal (usually `http://localhost:5173`).

The frontend uses Vite proxy config for `/api` requests to backend.

## Common troubleshooting

### `Access denied for user 'root'@'localhost'`
- Your `DB_USER` and/or `DB_PASSWORD` in `backend/.env` does not match MySQL credentials.
- Confirm login in MySQL Workbench, then copy that exact user/password into `.env`.
- Restart backend after changing `.env`.

### `Cannot use import statement outside a module`
- Ensure `backend/package.json` has:

```json
"type": "module"
```

### MySQL command is not recognized on Windows
- Use MySQL Workbench to open and run `database/schema/create_tables.sql`, or
- Run `mysql.exe` using the full install path.
