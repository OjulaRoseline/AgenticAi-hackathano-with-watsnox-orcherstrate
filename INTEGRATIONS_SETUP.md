# Integrations Setup Guide

## 🤖 Part 1: IBM watsonx Orchestrate Setup

### Step 1: Get Access (5 minutes)

1. **Go to IBM watsonx**: https://www.ibm.com/products/watsonx-orchestrate
2. **Sign up** for trial or use existing IBM Cloud account
3. **Create watsonx Orchestrate instance**

### Step 2: Get API Credentials

1. Log into your watsonx Orchestrate instance
2. Go to **Settings** or **API Keys**
3. Generate new API key
4. Copy:
   - API Key
   - Instance ID
   - Region (usually `us-south`)

### Step 3: Update .env

```bash
WATSONX_API_KEY=your_actual_api_key_here
WATSONX_INSTANCE_ID=your_instance_id_here
WATSONX_REGION=us-south
```

### Step 4: Test Connection

```bash
# Restart server
npm run dev
```

The watsonx service will automatically use these credentials!

---

## 📧 Part 2: Email Configuration (Gmail)

### Option A: Gmail (Easiest - 2 minutes)

#### Step 1: Enable 2-Step Verification

1. Go to: https://myaccount.google.com/security
2. Click **2-Step Verification**
3. Follow prompts to enable

#### Step 2: Create App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Windows Computer**  
4. Click **Generate**
5. Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)

#### Step 3: Update .env

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=your.email@gmail.com
```

#### Step 4: Test

Create a new onboarding via API - you should receive an email!

### Option B: Other Email Providers

#### Outlook/Office 365
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your.email@outlook.com
SMTP_PASSWORD=your_password
```

#### SendGrid (Transactional Email Service)
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

Get SendGrid API key: https://sendgrid.com/

---

## 💬 Part 3: Slack Integration

### Step 1: Create Slack App (5 minutes)

1. **Go to**: https://api.slack.com/apps
2. Click **Create New App**
3. Choose **From scratch**
4. App Name: `HR Onboarding Assistant`
5. Workspace: Select your workspace
6. Click **Create App**

### Step 2: Configure Bot Scopes

1. Go to **OAuth & Permissions** (left sidebar)
2. Scroll to **Scopes**
3. Add these **Bot Token Scopes**:
   - `chat:write` - Send messages
   - `users:read` - Read user info
   - `users:read.email` - Read user emails
   - `channels:read` - Read channel info
   - `im:write` - Send DMs

### Step 3: Install to Workspace

1. Scroll up to **OAuth Tokens**
2. Click **Install to Workspace**
3. Click **Allow**
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

### Step 4: Get Team ID (Optional)

1. Go to your Slack workspace
2. Click workspace name → **Settings & administration** → **Workspace settings**
3. URL shows Team ID: `https://app.slack.com/client/T1234567890/`
4. Copy `T1234567890` part

### Step 5: Update .env

```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_TEAM_ID=T1234567890
```

### Step 6: Invite Bot to Channels

In Slack:
1. Go to channel (e.g., `#it-requests`)
2. Type `/invite @HR Onboarding Assistant`
3. Bot will join the channel

### Step 7: Test

Create a new onboarding - bot should send a welcome DM!

---

## 🧪 Testing Your Integrations

### Test Email

```bash
# Create new onboarding (you should get email)
curl -X POST http://localhost:3000/api/onboarding/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "your.email@gmail.com",
    "role": "Engineer",
    "department": "IT",
    "startDate": "2024-12-01"
  }'
```

✅ Check your email inbox for welcome email!

### Test Slack

Same command as above, but bot should:
1. Send DM to the email address (if it exists in Slack)
2. Post to #it-requests channel (if configured)

### Test watsonx

The workflows are automatically using watsonx! Check logs:
```bash
# You'll see in console:
{"level":"info","message":"Executing workflow: create_new_hire"}
```

---

## 🔍 Troubleshooting

### Email Not Sending?

**Check:**
- ✅ App password generated (not regular Gmail password)
- ✅ 2-Step verification enabled
- ✅ No spaces in app password in .env
- ✅ SMTP credentials correct
- ✅ Check spam folder

**Test connection:**
```bash
# Check logs when creating onboarding
# Should see: "Email sent to..."
```

### Slack Not Working?

**Check:**
- ✅ Bot token starts with `xoxb-`
- ✅ Bot has required scopes
- ✅ Bot installed to workspace
- ✅ Bot invited to channels
- ✅ User's email exists in Slack

**Test manually:**
```javascript
// Test in Node
const { WebClient } = require('@slack/web-api');
const client = new WebClient('your-bot-token');
client.chat.postMessage({ channel: '#general', text: 'Test!' });
```

### watsonx Not Working?

**Check:**
- ✅ API key is valid
- ✅ Instance ID is correct
- ✅ Region matches your instance
- ✅ Account has active subscription

**Note:** For hackathon, workflows will work with mock data even without watsonx credentials. Real watsonx integration requires active instance.

---

## 📊 Integration Status

After setup, verify in logs:

```
✅ Email service initialized
✅ Slack service initialized
✅ watsonx Orchestrate connected
```

Or check health endpoint:
```bash
curl http://localhost:3000/health
```

---

## 🎯 Quick Start (All 3 in 15 minutes)

1. **Email (2 min)**: Gmail app password → .env
2. **Slack (5 min)**: Create app → Get token → .env  
3. **watsonx (8 min)**: Sign up → Create instance → Get API key → .env

**Restart server after updating .env:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

Now all integrations are live! 🚀
