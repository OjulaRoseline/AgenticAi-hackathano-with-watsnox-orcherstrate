# MongoDB Atlas Setup (Free - 2 Minutes)

## Step-by-Step

### 1. Sign Up (30 seconds)
- Go to: https://www.mongodb.com/cloud/atlas/register
- Sign up with email or Google
- Choose "Free" tier

### 2. Create Cluster (1 minute)
- Click "Build a Database"
- Choose "M0 FREE"
- Select region (closest to you)
- Click "Create Cluster"

### 3. Create Database User (20 seconds)
- Username: `admin`
- Password: `admin123` (or generate one)
- Click "Create User"

### 4. Allow Access (10 seconds)
- IP Address: `0.0.0.0/0` (Allow from anywhere - for development)
- Click "Add Entry"
- Click "Finish and Close"

### 5. Get Connection String (20 seconds)
- Click "Connect"
- Choose "Connect your application"
- Copy the connection string
- It looks like: `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### 6. Update .env File
Replace `<password>` with your actual password:

```
DATABASE_URL=mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/onboarding_db?retryWrites=true&w=majority
```

## Alternative: Local MongoDB (if you prefer)

### Windows:
```powershell
# Download from: https://www.mongodb.com/try/download/community
# Install MongoDB Community Server
# Start MongoDB:
net start MongoDB

# Or use the installer's option to run as a service
```

### Check if running:
```powershell
mongod --version
```

If local MongoDB is running, your .env already has:
```
DATABASE_URL=mongodb://localhost:27017/onboarding_db
```

## Which Should I Choose?

- **MongoDB Atlas**: Best for hackathon, no installation, works immediately
- **Local MongoDB**: Better for production, more control, faster

For this hackathon, **MongoDB Atlas is recommended** - it's ready in 2 minutes!
