# TechMayne Deployment Quick Start

This guide will get your TechMayne system fully deployed and ready for production in about 30-45 minutes.

## What You'll Deploy

1. **Backend** → Railway (hosting)
2. **Email** → Resend (notifications)
3. **Database** → Supabase (already set up ✅)
4. **Optional:** Google Sheets (auto-save)

## Prerequisites

- ✅ Supabase account (already configured)
- 🔄 GitHub account
- 🔄 Railway account (free to create)
- 🔄 Resend account (free to create)

## Total Costs

- **Supabase:** $25/month (all clients)
- **Railway:** $5/month (all clients)
- **Resend:** FREE up to 3,000 emails/month
- **Total:** ~$30/month for unlimited clients

---

## Part 1: Set Up Resend (10 minutes)

### Step 1: Create Resend Account

1. Go to https://resend.com/
2. Click "Get Started" → Sign up
3. Verify your email

### Step 2: Get API Key

1. In Resend dashboard → "API Keys"
2. Click "Create API Key"
3. Name: `TechMayne Production`
4. Click "Add"
5. **Copy the API key** (starts with `re_...`)

**Save it somewhere safe** - you'll need it in Step 3!

### Step 3: Add to Local Environment

Edit `backend/.env` and add:

```bash
# Resend Email
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=your_email@gmail.com
```

Replace:
- `re_your_api_key_here` with your actual API key
- `your_email@gmail.com` with where YOU want to receive signup notifications

✅ **Resend is ready!**

---

## Part 2: Deploy to Railway (15 minutes)

### Step 1: Push Code to GitHub

```bash
cd /Users/djdizon/Projects/techmayne

# Initialize git (if not done already)
git init
git add .
git commit -m "Initial commit: TechMayne production ready"

# Create GitHub repo
# Go to https://github.com/new and create a PRIVATE repository named "techmayne"

# Push code (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/techmayne.git
git branch -M main
git push -u origin main
```

### Step 2: Create Railway Account

1. Go to https://railway.app/
2. Click "Login" → Sign in with GitHub
3. Verify email

### Step 3: Deploy Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `techmayne` repository
4. Railway will start deploying

### Step 4: Configure Root Directory

1. Click on your deployment
2. Go to "Settings" tab
3. Find "Root Directory"
4. Set to: `backend`
5. Click outside to save

### Step 5: Add Environment Variables

1. Click "Variables" tab
2. Click "Raw Editor"
3. Paste this (replace with your actual values):

```bash
PORT=3000

# Supabase
SUPABASE_URL=https://jzsgvyqtavkukehfdyed.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6c2d2eXF0YXZrdWtlaGZkeWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMTkyMjksImV4cCI6MjA4Mjc5NTIyOX0.LSNDR8zUo6e1rRL6SqxMVXLXoRlfv5bxfnuGTWXhc10

# Resend (from Step 2)
RESEND_API_KEY=re_your_api_key_from_resend
FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=your_email@gmail.com

# Google Sheets (optional - can add later)
GOOGLE_SHEETS_CREDENTIALS=
GOOGLE_SHEETS_ID=
GOOGLE_SHEET_NAME=Client Onboarding
```

4. Click "Update Variables"

Railway will automatically redeploy.

### Step 6: Generate Domain

1. Go to "Settings" tab
2. Find "Domains" section
3. Click "Generate Domain"
4. You'll get: `techmayne-backend-production-XXXX.up.railway.app`
5. **Copy this URL!**

### Step 7: Test Deployment

Open browser and visit:

```
https://your-railway-url.up.railway.app/health
```

You should see:
```json
{"status":"ok","timestamp":"2025-01-02T..."}
```

✅ **Backend is live on Railway!**

---

## Part 3: Update Widget & Onboarding URLs (5 minutes)

Now you need to point everything to your Railway backend instead of localhost.

### Step 1: Update Widget

Edit `widget/src/widget.js`:

```javascript
// Find this line (around line 2):
const API_BASE_URL = 'http://localhost:3000';

// Replace with:
const API_BASE_URL = 'https://your-railway-url.up.railway.app';
```

### Step 2: Update Onboarding Page

Edit `onboarding-page-v2.html`:

```javascript
// Find this line (around line 566):
const API_URL = 'http://localhost:3000';

// Replace with:
const API_URL = 'https://your-railway-url.up.railway.app';
```

### Step 3: Update Embed Code

Edit `backend/routes/onboarding.js`:

```javascript
// Find this (around line 123):
const embedCode = `<script
  src="http://localhost:3000/widget/widget.js"
  data-client-token="${clientToken}"
></script>`;

// Replace with:
const embedCode = `<script
  src="https://your-railway-url.up.railway.app/widget/widget.js"
  data-client-token="${clientToken}"
></script>`;
```

### Step 4: Commit and Push

```bash
git add .
git commit -m "Update URLs to use Railway backend"
git push
```

Railway will automatically redeploy in ~30 seconds.

✅ **All URLs updated!**

---

## Part 4: Host Onboarding Page (5 minutes)

You need to host your onboarding page somewhere so clients can access it. Here are quick options:

### Option 1: Vercel (Recommended - FREE)

1. Go to https://vercel.com/
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your `techmayne` repository
5. Settings:
   - **Framework Preset:** Other
   - **Root Directory:** Leave blank (root)
   - **Build Command:** Leave blank
   - **Output Directory:** `.`
6. Click "Deploy"
7. Your onboarding page will be at: `https://techmayne-YOUR_PROJECT.vercel.app/onboarding-page-v2.html`

### Option 2: Netlify (FREE)

1. Go to https://www.netlify.com/
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose your `techmayne` repository
5. Settings:
   - **Build command:** Leave blank
   - **Publish directory:** `.`
6. Click "Deploy"
7. Your onboarding page will be at: `https://YOUR_SITE.netlify.app/onboarding-page-v2.html`

### Option 3: GitHub Pages (FREE)

1. In your GitHub repo → Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` → `/` (root)
4. Click Save
5. Your onboarding page will be at: `https://YOUR_USERNAME.github.io/techmayne/onboarding-page-v2.html`

✅ **Onboarding page is live!**

---

## Part 5: Test the Entire Flow (10 minutes)

### Test 1: Create a Real Test Client

1. Open your onboarding page URL
2. Fill out the form with real test data:
   - Business name: "Sarah's Photography"
   - Website: "https://sarahsphotography.com"
   - Email: Use your real email
   - Phone: Your real phone
   - Add at least 1 custom FAQ
   - Choose a color
3. Click "Complete Setup"
4. **Copy the client token** from the success message

**Check:**
- ✅ Email arrives at your admin email (from Resend)
- ✅ Client appears in Supabase `clients` table
- ✅ Custom FAQs appear in Supabase `faq_entries` table

### Test 2: Test the Chatbot Widget

Create a test HTML file (`test-production.html`):

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Production Chatbot</title>
</head>
<body>
  <h1>Sarah's Photography</h1>
  <p>Click the chat button to test!</p>

  <!-- Replace with your actual client token -->
  <script
    src="https://your-railway-url.up.railway.app/widget/widget.js"
    data-client-token="YOUR_CLIENT_TOKEN_HERE">
  </script>
</body>
</html>
```

Open in browser and:
1. Click chat button
2. Select "Check Availability"
3. Complete the full flow (event type, date, location, coverage, contact info)
4. **Check** that you receive a lead notification email (sent to the email you provided during onboarding)

**Verify:**
- ✅ Chatbot appears and works
- ✅ Custom FAQ shows up when you test it
- ✅ Lead notification email sent to client email
- ✅ Lead appears in Supabase `leads` table

### Test 3: Verify All Systems

Check these logs:

**Railway Logs:**
1. Railway dashboard → Your service → "Deployments"
2. Should see: "Lead created: [UUID]"
3. Should see: "Lead notification sent via Resend: [ID]"

**Resend Dashboard:**
1. Resend.com → "Emails"
2. Should see both emails (admin notification + lead notification)
3. Status should be "Delivered"

**Supabase Dashboard:**
1. Go to Table Editor
2. Check `clients` table → Your test client exists
3. Check `faq_entries` → Default + custom FAQs exist
4. Check `leads` → Your test lead exists
5. Check `conversations` → Conversation exists
6. Check `messages` → All messages exist

✅ **Everything is working!**

---

## Part 6: Final Configuration (Optional)

### Add Custom Domain to Railway

1. Buy domain (e.g., `yourdomain.com`)
2. Railway Settings → Domains → "Custom Domain"
3. Enter: `api.yourdomain.com`
4. Add CNAME record to your DNS:
   ```
   CNAME api -> your-railway-url.up.railway.app
   ```
5. Wait for verification
6. Update all URLs to use `https://api.yourdomain.com`

### Verify Your Domain in Resend

See `docs/RESEND_SETUP.md` for detailed instructions.

Benefits:
- Professional emails from your domain
- Better deliverability
- Brand recognition

---

## You're Live! 🎉

Your TechMayne system is now fully deployed and ready for production.

### What You Can Do Now:

1. **Share onboarding link** with photographer clients
2. **Receive automatic signup notifications** via email
3. **Clients receive lead notifications** automatically
4. **All data saved** to Supabase
5. **Unlimited clients** for $30/month

### Next Steps:

1. Set up Google Sheets (optional): See `docs/GOOGLE_SHEETS_SETUP.md`
2. Create a demo video for sales
3. Build a landing page for your service
4. Set up Stripe for $99/month subscriptions

### Useful Links:

- **Onboarding Page:** Your Vercel/Netlify URL
- **Backend API:** Your Railway URL
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Railway Dashboard:** https://railway.app/dashboard
- **Resend Dashboard:** https://resend.com/emails

### Support:

If you encounter any issues:
1. Check Railway logs
2. Check Resend email status
3. Check Supabase table data
4. See troubleshooting sections in:
   - `docs/RAILWAY_SETUP.md`
   - `docs/RESEND_SETUP.md`

---

## Common Issues

### Widget Not Appearing
- Check browser console for errors
- Verify client token is correct
- Ensure Railway backend is running
- Check CORS settings

### Emails Not Sending
- Verify RESEND_API_KEY is set in Railway
- Check Resend dashboard → Emails tab
- Ensure FROM_EMAIL is valid
- Check Railway logs for errors

### Onboarding Form Fails
- Check Railway logs
- Verify Supabase credentials
- Test with browser network tab
- Check CORS settings

---

**Congratulations! You're ready to onboard your first real client!** 🎉
