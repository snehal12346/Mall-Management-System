# Mall Management System — Backend API Server

REST API server built with **Node.js**, **Express.js**, and **PostgreSQL (pg)**.
Case study: **Phoenix Marketcity, Mumbai** (Academic Model).

## Requirements
- Node.js (v18+)
- PostgreSQL 14+ / 16 / 18
- Database `mini_project_172_173` initialized via `database/` scripts

## Setup & Running
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```ini
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=mini_project_172_173
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   JWT_SECRET=replace_with_a_long_random_string
   JWT_EXPIRES_IN=24h
   ```

3. Start server:
   ```bash
   npm start
   # or with live-reload
   npm run dev
   ```

## Default Credentials
- **Admin**: `username: admin`, `password: admin123`
- **Manager**: `username: manager`, `password: manager123`
- **Staff**: `username: staff_neha`, `password: staff123`

## Endpoints Summary
- `POST /api/auth/login` - Authenticate & receive JWT
- `GET /api/dashboard/summary` - 10 Executive KPI cards
- `GET /api/dashboard/charts` - 9 Visual chart datasets
- `GET /api/customers` - Customer list with search & membership
- `GET /api/shops` - Mall shops with floor and revenue details
- `GET /api/products` - Inventory with low stock warnings
- `POST /api/purchases` - POS Checkout (Triggers stock decrement & points)
- `GET /api/parking/slots` - Real-time slot status & parking entry/exit
- `GET /api/events` - Mall events & attendee registration
- `GET /api/complaints` - Grievances & assignment to staff
- `GET /api/maintenance` - Facility work orders & technician dispatch
- `GET /api/offers` - Active promotional campaigns & usages
- `GET /api/reports/catalog` - Catalog of 35 management reports
- `GET /api/reports/:id` - Dynamic execution of reports (R01 to R35)
