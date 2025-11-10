# 🏥 MediFlow AI - Complete Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Redis 7+** - [Download](https://redis.io/download/)
- **IBM watsonx Account** - [Sign up](https://www.ibm.com/watsonx)

## 🚀 Quick Start (Local Development)

### 1. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL
docker run --name mediflow-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=mediflow \
  -p 5432:5432 \
  -d postgres:14

# Start Redis
docker run --name mediflow-redis \
  -p 6379:6379 \
  -d redis:7
```

#### Option B: Local Installation

1. Install PostgreSQL and create database:
```sql
CREATE DATABASE mediflow;
```

2. Install and start Redis

### 2. Initialize Database Schema

```bash
# Navigate to database folder
cd database

# Run schema creation
psql -U postgres -d mediflow -f schema.sql

# Run seed data
psql -U postgres -d mediflow -f seed.sql
```

### 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# Required:
# - DATABASE_URL
# - WATSONX_API_KEY (get from IBM Cloud)
# - JWT_SECRET (generate random string)

# Start development server
npm run dev
```

Server will start on http://localhost:5000

### 4. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

App will start on http://localhost:5173

## 🔑 Getting IBM watsonx Credentials

1. Go to [IBM Cloud](https://cloud.ibm.com/)
2. Create account or sign in
3. Navigate to **IBM watsonx** service
4. Create a new project
5. Get your:
   - API Key (IAM)
   - Project ID
   - watsonx Orchestrate URL

Add these to your `.env` file:

```env
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_ORCHESTRATE_URL=your_url_here
```

## 🧪 Testing the System

### 1. Register a Nurse Account

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.nurse@mediflow.ai",
    "password": "test123",
    "firstName": "Test",
    "lastName": "Nurse",
    "department": "ICU"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.nurse@mediflow.ai",
    "password": "test123"
  }'
```

Save the `token` from response.

### 3. Test AI Agent Query

```bash
curl -X POST http://localhost:5000/api/agents/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "Show me patient John Doe vitals"
  }'
```

### 4. Use Pre-seeded Demo Accounts

The database seed includes these accounts (password: `demo123`):

- **alice.nurse@mediflow.ai** - ICU Nurse
- **bob.nurse@mediflow.ai** - ER Nurse  
- **admin@mediflow.ai** - Hospital Admin

## 📊 Demo Data

The seed script creates:

- ✅ 5 demo patients with realistic data
- ✅ Vital signs records with Redis caching
- ✅ Medications and administration records
- ✅ Medical notes and assessments
- ✅ Real-time alerts (including critical ones)
- ✅ Board meeting with attendees

## 🤖 Testing AI Features

### Voice Commands (via API)

```bash
# Get patient vitals
curl -X POST http://localhost:5000/api/agents/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "Get John Doe vitals"}'

# Search patients
curl -X POST http://localhost:5000/api/agents/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "Show diabetic patients in ICU"}'

# Check alerts
curl -X POST http://localhost:5000/api/agents/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "Show critical alerts"}'

# Generate handoff report
curl -X POST http://localhost:5000/api/agents/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "Generate shift handoff report"}'
```

## 🔍 Monitoring

### Check Health

```bash
curl http://localhost:5000/health
```

### View Logs

```bash
# Backend logs
tail -f backend/logs/combined.log

# Error logs only
tail -f backend/logs/error.log
```

### Redis Cache Stats

```bash
# Connect to Redis
redis-cli

# Check keys
KEYS *

# Monitor cache hits/misses
MONITOR
```

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Or if local installation
sudo service postgresql status

# Test connection
psql -U postgres -d mediflow -c "SELECT 1;"
```

### Redis Connection Error

```bash
# Check Redis is running
docker ps | grep redis

# Or test connection
redis-cli ping
```

### watsonx API Errors

- Verify API key is correct
- Check project ID matches your watsonx project
- Ensure you have credits/quota available
- System falls back to local NLP if watsonx unavailable

### Port Already in Use

```bash
# Find process using port
lsof -i :5000  # Backend
lsof -i :5173  # Frontend

# Kill process
kill -9 PID
```

## 🚀 Production Deployment

### Environment Variables

Set these for production:

```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
REDIS_URL=your_production_redis_url
JWT_SECRET=strong_random_secret
FRONTEND_URL=https://your-domain.com
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Enable Redis persistence
- [ ] Configure rate limiting
- [ ] Set up monitoring/alerts
- [ ] Review CORS settings

### Performance Optimization

- Use Redis for caching (already implemented)
- Enable PostgreSQL connection pooling (configured)
- Use CDN for frontend assets
- Enable gzip compression (already enabled)
- Set up load balancing for multiple instances

## 📞 Support

For issues or questions:

1. Check logs in `backend/logs/`
2. Review this guide
3. Contact your team lead

## 🎯 Next Steps

Once setup is complete:

1. ✅ Test all API endpoints
2. ✅ Verify Redis caching is working
3. ✅ Test watsonx AI integration
4. ✅ Create your demo presentation
5. ✅ Prepare for hackathon judging

---

**Built for IBM watsonx Orchestrate Hackathon** 🏆
