# Railway Deployment Guide

This guide walks you through deploying your TechMayne backend to Railway.

## Why Railway?

- 🚀 Simple deployment from GitHub
- 💰 $5/month covers unlimited clients
- 🔄 Automatic deployments when you push to GitHub
- 🌐 Free HTTPS domain included
- ⚙️ Easy environment variable management

## Prerequisites

- GitHub account
- Railway account (free to create)
- Your TechMayne code ready to deploy

## Step 1: Prepare Your Code for Deployment

### 1.1 Create a `.gitignore` (if not exists)

Make sure your `.gitignore` includes:

```
node_modules/
.env
.DS_Store
*.log
```

### 1.2 Verify package.json

Your `backend/package.json` should have a start script:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### 1.3 Update CORS Settings (Important!)

Railway will give you a domain like `techmayne-backend-production.up.railway.app`. You need to allow CORS from your onboarding page domain.

Edit `backend/server.js` - find the CORS configuration and update it:

```javascript
// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://your-domain.com', // Your actual domain where you'll host onboarding page
    // Railway will work with any origin for testing, but restrict in production
  ],
  credentials: true
}));
```

For now, you can use `origin: true` to allow all origins during testing.

## Step 2: Push Code to GitHub

### 2.1 Initialize Git (if not already done)

```bash
cd /Users/djdizon/Projects/techmayne
git init
git add .
git commit -m "Initial commit: TechMayne chatbot system"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `techmayne` (or your preferred name)
3. Make it **Private** (recommended)
4. Do NOT initialize with README (you already have one)
5. Click "Create repository"

### 2.3 Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/techmayne.git

# Push code
git branch -M main
git push -u origin main
```

## Step 3: Create Railway Account

1. Go to https://railway.app/
2. Click "Login"
3. Sign in with GitHub (recommended for easy repo access)
4. Verify your email

## Step 4: Deploy to Railway

### 4.1 Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `techmayne` repository
4. Railway will detect it's a Node.js project

### 4.2 Configure Root Directory

Since your backend is in a subdirectory:

1. Click on your deployment
2. Go to "Settings" tab
3. Find "Root Directory"
4. Set it to: `backend`
5. Click "Save"

### 4.3 Configure Start Command

1. Still in Settings
2. Find "Start Command"
3. It should auto-detect `npm start`
4. If not, manually set it to: `npm start`

## Step 5: Add Environment Variables

### 5.1 Navigate to Variables

1. In your Railway project, click "Variables" tab
2. Click "Raw Editor" for easier bulk entry

### 5.2 Add All Variables

Copy and paste these, replacing with your actual values:

```bash
PORT=3000

# Supabase (from your .env file)
SUPABASE_URL=https://jzsgvyqtavkukehfdyed.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6c2d2eXF0YXZrdWtlaGZkeWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMTkyMjksImV4cCI6MjA4Mjc5NTIyOX0.LSNDR8zUo6e1rRL6SqxMVXLXoRlfv5bxfnuGTWXhc10

# Resend (you'll get this from Resend setup)
RESEND_API_KEY=re_your_api_key_here

# Admin email (where you receive notifications)
ADMIN_EMAIL=your_admin_email@gmail.com

# Google Sheets (optional - add after you set it up)
GOOGLE_SHEETS_CREDENTIALS=
GOOGLE_SHEETS_ID=
GOOGLE_SHEET_NAME=Client Onboarding
```

**Important Notes:**
- DO NOT include `EMAIL_SERVICE`, `EMAIL_USER`, or `EMAIL_PASSWORD` - you'll use Resend instead
- Get `RESEND_API_KEY` from the Resend setup (see RESEND_SETUP.md)
- Replace `ADMIN_EMAIL` with your actual email

### 5.3 Save Variables

Click "Update Variables" - Railway will automatically redeploy.

## Step 6: Get Your Railway URL

### 6.1 Generate Domain

1. Go to "Settings" tab
2. Find "Domains" section
3. Click "Generate Domain"
4. You'll get a URL like: `techmayne-backend-production.up.railway.app`
5. **Copy this URL** - you'll need it!

### 6.2 Test Your Deployment

Open a new browser tab and visit:

```
https://your-railway-url.up.railway.app/health
```

You should see:
```json
{"status":"ok","timestamp":"2025-01-02T..."}
```

✅ **If you see this, your backend is live!**

## Step 7: Update Widget URL

Now you need to update your widget to use the Railway backend instead of localhost.

### 7.1 Edit Widget Source

Edit `widget/src/widget.js`:

```javascript
// Find this line near the top:
const API_BASE_URL = 'http://localhost:3000';

// Replace with your Railway URL:
const API_BASE_URL = 'https://techmayne-backend-production.up.railway.app';
```

### 7.2 Commit and Push

```bash
git add widget/src/widget.js
git commit -m "Update widget to use Railway backend"
git push
```

Railway will automatically redeploy!

## Step 8: Update Onboarding Pages

### 8.1 Update onboarding-page-v2.html

Find this line:

```javascript
const API_URL = 'http://localhost:3000';
```

Replace with:

```javascript
const API_URL = 'https://techmayne-backend-production.up.railway.app';
```

### 8.2 Update Embed Code in Backend

Edit `backend/routes/onboarding.js`:

Find this section:

```javascript
// Generate embed code
const embedCode = `<script
  src="http://localhost:3000/widget/widget.js"
  data-client-token="${clientToken}"
></script>`;
```

Replace with:

```javascript
// Generate embed code
const embedCode = `<script
  src="https://techmayne-backend-production.up.railway.app/widget/widget.js"
  data-client-token="${clientToken}"
></script>`;
```

### 8.3 Commit and Push

```bash
git add backend/routes/onboarding.js
git commit -m "Update embed code to use Railway URL"
git push
```

## Step 9: Verify Everything Works

### 9.1 Test Health Endpoint

```bash
curl https://your-railway-url.up.railway.app/health
```

Expected: `{"status":"ok","timestamp":"..."}`

### 9.2 Test Widget Config

```bash
curl https://your-railway-url.up.railway.app/api/config/YOUR_TEST_CLIENT_TOKEN
```

Expected: Client configuration JSON

### 9.3 Test Chat Endpoint

```bash
curl -X POST https://your-railway-url.up.railway.app/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "clientToken": "YOUR_TEST_CLIENT_TOKEN",
    "visitorId": "test-visitor-123",
    "message": "Hello"
  }'
```

Expected: Bot response JSON

## Step 10: Monitor Your Deployment

### 10.1 View Logs

1. In Railway dashboard, click on your service
2. Click "Deployments" tab
3. Click on the latest deployment
4. View real-time logs

### 10.2 Check for Errors

Look for any errors in the logs. Common issues:
- Missing environment variables
- Supabase connection errors
- Port binding issues

## Step 11: Set Up Custom Domain (Optional)

### 11.1 Add Custom Domain

1. Go to Settings → Domains
2. Click "Custom Domain"
3. Enter your domain: `api.yourdomain.com`
4. Add the CNAME record to your DNS provider

### 11.2 Update All References

After custom domain is active, update:
- `widget/src/widget.js` → `API_BASE_URL`
- `onboarding-page-v2.html` → `API_URL`
- `backend/routes/onboarding.js` → embed code URL

## Troubleshooting

### Build Fails

**Check:**
- Root directory is set to `backend`
- package.json has all dependencies
- No syntax errors in your code

**View build logs in Railway dashboard**

### Deployment Succeeds but Crashes

**Check:**
- Environment variables are set correctly
- Supabase credentials are valid
- Port is set to 3000 or use Railway's PORT variable

**Fix:** Update server.js to use Railway's PORT:

```javascript
const PORT = process.env.PORT || 3000;
```

### CORS Errors

**Fix:** Update CORS settings in server.js:

```javascript
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true
}));
```

For production, restrict to your domains:

```javascript
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://api.yourdomain.com'
  ],
  credentials: true
}));
```

### Database Connection Fails

**Check:**
- SUPABASE_URL is correct
- SUPABASE_KEY is the anon key (not service_role)
- Supabase project is active

## Costs

### Railway Pricing

- **Starter Plan:** $5/month
- Includes:
  - $5 of usage credits
  - This backend typically uses ~$3-4/month
  - Can serve unlimited clients

### What You Get

- Automatic HTTPS
- Auto-scaling
- 99.9% uptime
- Automatic deployments
- Real-time logs
- Metrics dashboard

## Next Steps

✅ Backend deployed to Railway
✅ Environment variables configured
✅ Custom domain added (optional)
✅ Widget updated to use Railway URL

**Next:** Set up Resend for email notifications (see RESEND_SETUP.md)

## Useful Commands

### View Logs
```bash
# Install Railway CLI (optional)
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs
```

### Redeploy

```bash
# Any git push triggers redeploy
git add .
git commit -m "Update"
git push
```

### Manual Redeploy

In Railway dashboard → Deployments → "Redeploy"

## Support

- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app/
