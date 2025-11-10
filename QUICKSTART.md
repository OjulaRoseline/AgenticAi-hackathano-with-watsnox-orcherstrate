# 🚀 MediFlow AI - Quick Start Checklist

## ✅ Prerequisites Check

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed (or Docker)
- [ ] Redis 7+ installed (or Docker)
- [ ] IBM watsonx account created
- [ ] Git installed

---

## 📦 Step 1: Database Setup (5 minutes)

### Option A: Using Docker (Recommended)
```bash
# Start PostgreSQL
docker run --name mediflow-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mediflow -p 5432:5432 -d postgres:14

# Start Redis
docker run --name mediflow-redis -p 6379:6379 -d redis:7
```

### Option B: Local Installation
```bash
# Create database
createdb mediflow

# Start Redis
redis-server
```

### Initialize Database
```bash
cd database
psql -U postgres -d mediflow -f schema.sql
psql -U postgres -d mediflow -f seed.sql
```

---

## ⚙️ Step 2: Backend Setup (3 minutes)

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Edit .env - REQUIRED:
# - WATSONX_API_KEY (from IBM Cloud)
# - JWT_SECRET (generate random string)
# - DATABASE_URL (if not default)

# Start server
npm run dev
```

**Backend should be running on http://localhost:5000**

---

## 🎨 Step 3: Frontend Setup (3 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start dev server
npm run dev
```

**Frontend should be running on http://localhost:5173**

---

## 🧪 Step 4: Test the System (2 minutes)

### Test 1: Login with Demo Account
1. Open http://localhost:5173
2. Click demo account: `alice.nurse@mediflow.ai` / `demo123`
3. Should redirect to dashboard

### Test 2: AI Chat
1. Navigate to "AI Chat"
2. Try: "Show me patient John Doe's vitals"
3. Should see formatted vitals response

### Test 3: View Patients
1. Navigate to "Patients"
2. Should see 5 demo patients listed

### Test 4: Check Alerts
1. Navigate to "Alerts"
2. Should see critical alerts including Sarah Smith

---

## 🔑 Getting watsonx Credentials (10 minutes)

1. Go to https://cloud.ibm.com/
2. Sign in / Create account
3. Search for "watsonx" in catalog
4. Create a watsonx.ai project
5. Get credentials:
   - API Key: IAM → API Keys → Create
   - Project ID: From watsonx project settings
6. Add to `backend/.env`:
```env
WATSONX_API_KEY=your_key_here
WATSONX_PROJECT_ID=your_project_id_here
```

**Note:** System works with local NLP fallback if watsonx is not configured!

---

## 🎯 Quick Test Commands

### Health Check
```bash
curl http://localhost:5000/health
```

### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@mediflow.ai",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User",
    "department": "ICU"
  }'
```

### Test AI Agent (requires login token)
```bash
# 1. Login first to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice.nurse@mediflow.ai", "password": "demo123"}'

# 2. Use token in query
curl -X POST http://localhost:5000/api/agents/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"query": "Show me patient John Doe vitals"}'
```

---

## 🐛 Troubleshooting

### Database won't connect
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Or test connection
psql -U postgres -d mediflow -c "SELECT 1;"
```

### Redis won't connect
```bash
# Check if Redis is running
docker ps | grep redis

# Or test connection
redis-cli ping
```

### Backend won't start
```bash
# Check logs
cd backend
tail -f logs/error.log

# Verify .env file exists
cat .env
```

### Frontend shows connection error
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify CORS settings in backend

---

## 🎬 Demo Scenarios

### 1. Voice-Activated Query
1. Go to AI Chat page
2. Click microphone icon
3. Say: "What are John Doe's vitals?"
4. See AI response with cached data

### 2. Patient Search
1. In AI Chat, type: "Show diabetic patients in ICU"
2. See filtered patient list
3. Notice "Retrieved from cache" indicator

### 3. Critical Alerts
1. Go to Alerts page
2. Filter by "critical"
3. See Sarah Smith's elevated BP alert

### 4. Handoff Report
1. In AI Chat, type: "Generate shift handoff report"
2. See AI-generated summary of all patients

---

## 📊 Success Indicators

- ✅ Backend logs show "Database connected"
- ✅ Backend logs show "Redis connected"
- ✅ Frontend loads without errors
- ✅ Can login with demo account
- ✅ AI Chat responds to queries
- ✅ Patient data displays correctly
- ✅ Alerts show up

---

## 📚 Next Steps

1. ✅ **Read Documentation**
   - [README.md](./README.md) - Main overview
   - [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup
   - [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Complete architecture

2. ✅ **Test All Features**
   - Test each AI agent
   - Try voice input
   - View all pages
   - Check real-time alerts

3. ✅ **Prepare Demo**
   - Practice demo flow
   - Prepare talking points
   - Test on presentation laptop

---

## 🆘 Need Help?

### Common Issues:
- **Port in use**: Change ports in .env files
- **watsonx errors**: System works with local NLP
- **Database errors**: Check connection string
- **Redis errors**: Verify Redis is running

### Check System Status:
```bash
# Backend health
curl http://localhost:5000/health

# View logs
tail -f backend/logs/combined.log
```

---

## ⏱️ Total Setup Time: ~15 minutes

- Database setup: 5 min
- Backend setup: 3 min
- Frontend setup: 3 min
- Testing: 2 min
- watsonx config: 10 min (optional)

---

**🎉 You're ready to demo MediFlow AI!**

*Built for IBM watsonx Orchestrate Hackathon*
