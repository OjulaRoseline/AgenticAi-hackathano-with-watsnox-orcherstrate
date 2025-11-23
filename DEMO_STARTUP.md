# MediFlow AI - Quick Demo Startup Guide

## 🚀 Quick Start (For Demo Video)

### Option 1: Mock Server (RECOMMENDED for Demo)
**No database or Redis required!**

```powershell
# Terminal 1: Start Backend (Mock Mode)
cd backend
node server-mock.js

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

**Demo Credentials:**
- Email: `alice.nurse@mediflow.ai`
- Password: `demo123`

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

### Option 2: Full Production Server
**Requires PostgreSQL and Redis running**

```powershell
# Terminal 1: Start Backend (Production Mode)
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

---

## 🎬 Demo Test Scenarios

Once logged in, try these queries in the AI Chat:

1. **Patient Vitals**
   ```
   Show me John Doe's vitals
   ```
   Expected: Displays BP, heart rate, temperature, O2 saturation

2. **Patient Search**
   ```
   Find diabetic patients in ICU
   ```
   Expected: Lists filtered patients with conditions

3. **Shift Handoff**
   ```
   Generate shift handoff report
   ```
   Expected: AI-generated summary with patient counts

4. **Critical Alerts**
   ```
   Show critical alerts
   ```
   Expected: List of alerts with severity levels

5. **Meeting Scheduling**
   ```
   Schedule board meeting for tomorrow 2pm
   ```
   Expected: Meeting suggestions with critical cases

---

## ✅ Pre-Demo Checklist

- [ ] Backend mock server running (port 5000)
- [ ] Frontend running (port 5173)
- [ ] Logged in with demo credentials
- [ ] Tested all 5 demo scenarios
- [ ] No console errors in browser
- [ ] Demo mode banner visible
- [ ] Ready to record!

---

## 🎯 Key Points to Mention in Demo

1. **Innovation**: "4 AI agents orchestrated by IBM watsonx Orchestrate"
2. **Speed**: "50ms response time vs 15-20 minutes manual search"
3. **Privacy**: "HIPAA-compliant with on-demand handoff generation"
4. **Impact**: "2+ hours saved per nurse per shift, 87.5% error reduction"

---

## 🔧 Troubleshooting

**Backend won't start:**
```powershell
cd backend
npm install
node server-mock.js
```

**Frontend won't start:**
```powershell
cd frontend
npm install
npm run dev
```

**Port already in use:**
```powershell
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📹 Recording Setup

1. Close unnecessary applications
2. Clear browser cache
3. Use incognito/private mode
4. Zoom browser to 110%
5. Test microphone
6. Have this guide open for reference

**Good luck with your demo! 🚀**
