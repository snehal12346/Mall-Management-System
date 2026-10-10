# Mall Management System (Mini Project 172 & 173)

Academic DBMS mini project: a mall management system modelled on a fictional
case study of Phoenix Marketcity, Mumbai. All data is fictional sample data for
coursework and does not come from any real operator.

**Stack:** PostgreSQL, Node.js + Express (REST API, JWT auth), React + Vite.

> **Status: work in progress.** The items below are marked as
> **Verified** or **NOT verified**. Nothing here has been run against a live
> database yet. The requirements PDF has not yet been compared with the schema.

## Project layout

```
database/   SQL scripts 01-10 and TESTING.sql
backend/    Express API (src/app.js, src/server.js, routes, controllers)
frontend/   React app (Vite)
```

## Prerequisites

- Node.js 18 or newer
- PostgreSQL 14 or newer, with `psql` on your PATH

## 1. Database

Run from the repository root. Replace `postgres` with your PostgreSQL superuser
if different. Each script is run in its own `psql` session, so scripts 02 and
later name the database explicitly.

```bash
psql -U postgres -f database/01_create_database.sql
for f in 02_create_tables 03_constraints 04_sample_data 05_queries \
         06_views 07_functions 08_procedures 09_triggers 10_reports; do
  psql -U postgres -d mini_project_172_173 -v ON_ERROR_STOP=1 -f database/$f.sql
done
# optional verification suite
psql -U postgres -d mini_project_172_173 -f database/TESTING.sql
```

**NOT verified:** none of these scripts have been executed. The script order
above is inferred from the file names. In particular `01_create_database.sql`
ends with `\c mini_project_172_173;` (with a trailing semicolon); this should be
checked when the scripts are first run.

## 2. Backend

```bash
cd backend
cp .env.example .env      # then edit .env with your own values
npm install
npm start                 # http://localhost:5000, health check: /api/health
```

Set `DB_USER`, `DB_PASSWORD` and a long random `JWT_SECRET` in `backend/.env`.
Never commit `.env`; it is git-ignored. Example to generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**NOT verified:** `npm install`, server startup, database connection, login and
all API routes.

**Known issue:** `npm test` points at `backend/test/api.test.js`, which does not
exist yet, so `npm test` currently fails. No tests have been written.

**Known issue:** the backend source still contains fallback default values for
the database password and JWT secret (`src/config/db.js`, `src/middleware/auth.js`,
`src/controllers/auth.controller.js`). Always set real values in `.env`; these
fallbacks are planned for removal.

## 3. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Vite proxies `/api` to `http://localhost:5000`. Optionally copy
`frontend/.env.example` to `frontend/.env` to set `VITE_API_URL`.

Pages implemented (code exists, not yet run): Login, Dashboard, Customers,
Memberships, Shops, Tenants. Other sidebar entries (Reports, Leases, Products,
Purchases, Payments, Offers, Events, Event Registrations, Vehicles, Parking,
Employees, Complaints, Maintenance) currently show a "not implemented yet"
placeholder. They will be built once the requirements PDF has been reviewed.

**NOT verified:** `npm install`, `npm run dev`, `npm run build`, routing in a
browser, and the frontend-backend-database flow.

## Checks actually run so far

- `node --check` on all 43 backend `.js` files: passed (syntax only).
- JSX/JS syntax parse (esbuild) of all 20 frontend source files: passed
  (syntax only; this does not prove the app renders or runs).
- Static check that relative imports in the frontend resolve to existing files
  and exports: passed.

## Security notes

- `.env` files are git-ignored; only `.env.example` templates (placeholders
  only) are tracked.
- Rotate any JWT secret or database password that was ever shared or committed
  in an earlier copy of this project.
- Sample login accounts mentioned in `backend/README.md` come from the sample
  data and have not been verified against the seeded password hashes.
