# Quick Start Guide

Get the Smart HR Onboarding Assistant running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/OjulaRoseline/AgenticAi-hackathano-with-watsnox-orcherstrate.git
cd AgenticAi-hackathano-with-watsnox-orcherstrate
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
# At minimum, set these:
# - WATSONX_API_KEY
# - WATSONX_INSTANCE_ID
# - JWT_SECRET
```

### 4. Start the server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Quick Test

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Create User (Demo)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}'
```

### 3. Create Onboarding
```bash
# Use token from login response
curl -X POST http://localhost:3000/api/onboarding/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@test.com",
    "role": "Software Engineer",
    "department": "Engineering",
    "startDate": "2024-12-01"
  }'
```

## Next Steps

- Read [API Documentation](docs/API_DOCUMENTATION.md)
- Follow [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md)
- Check [Architecture](docs/ARCHITECTURE.md)

## Troubleshooting

**Port 3000 already in use?**
```bash
# Change PORT in .env
PORT=3001
```

**Database connection error?**
- Ensure database is running
- Check DATABASE_URL in .env

**Need help?**
- Check the docs folder
- Open an issue on GitHub
