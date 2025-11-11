# Quick Setup Guide for Windows (No Admin Required)

## For Hackathon Demo - Install These Manually:

### 1. PostgreSQL Portable (5 minutes)
1. Download: https://www.enterprisedb.com/download-postgresql-binaries
2. Extract ZIP to a folder (e.g., `C:\postgresql`)
3. Run: `initdb -D C:\postgresql\data`
4. Start server: `pg_ctl -D C:\postgresql\data start`
5. Create database: `createdb mediflow`

### 2. Memurai (Redis Alternative for Windows)
1. Download: https://www.memurai.com/get-memurai
2. Install (lightweight, < 1 minute)
3. Runs automatically on port 6379

### 3. Run the Database Setup
```bash
cd database
psql -U postgres -d mediflow -f schema.sql
psql -U postgres -d mediflow -f seed.sql
```

## OR - Use Online Services (Fastest for Demo)

### ElephantSQL (Free PostgreSQL)
1. Sign up: https://www.elephantsql.com/
2. Create free instance
3. Copy connection URL to backend\.env as DATABASE_URL

### Redis Labs (Free Redis)
1. Sign up: https://redis.com/try-free/
2. Create free database  
3. Get connection details, update backend\.env

## Then Start Backend
```bash
cd backend
npm run dev
```
