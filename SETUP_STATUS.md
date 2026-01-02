# TechMayne Setup Status

## ✅ What's Already Complete

### 1. Backend Deployment
- ✅ Backend deployed to Railway at: `https://techmayne-production.up.railway.app`
- ✅ All environment variables configured (Supabase, Resend)
- ✅ Health check endpoint working
- ✅ All API routes accessible

### 2. Email Service (Resend)
- ✅ Resend API configured with your key
- ✅ Domain (techmayne.com) verified
- ✅ Admin email set to: support@techmayne.com
- ✅ Email templates ready:
  - Lead notifications (when visitors submit contact info via chatbot)
  - Admin notifications (when new clients complete onboarding)

### 3. Enterprise Onboarding Page
- ✅ Created: `onboarding-enterprise.html`
- ✅ Enterprise branding applied:
  - Primary Blue: #1E6FD9
  - Deep Navy: #0A2540
  - Metallic Gray: #8B8F97
  - Charcoal Black: #0B0B0D
  - Inter font family
- ✅ Connected to production Railway backend
- ✅ All functionality working:
  - Business information collection
  - Custom FAQ builder
  - Installation service option
  - Color picker for widget accent
  - Generates embed code on success

### 4. Google Sheets Auto-Save (Backend Ready)
- ✅ Google Sheets service fully coded
- ✅ googleapis package installed
- ✅ Integration added to onboarding endpoint
- ⏳ **Needs configuration** (see below)

---

## 🔧 What You Need to Do

### Step 1: Set Up Google Sheets (Required for auto-save)

Follow the guide in **GOOGLE_SHEETS_SETUP.md**. Here's the quick version:

1. **Create Google Cloud Service Account** (5 minutes)
   - Go to Google Cloud Console
   - Create new project "TechMayne"
   - Enable Google Sheets API
   - Create service account
   - Download JSON key file

2. **Create Google Spreadsheet** (2 minutes)
   - Create new Google Sheet
   - Name it "TechMayne Client Onboarding"
   - Share it with service account email (from JSON file)
   - Copy spreadsheet ID from URL

3. **Add to Railway** (2 minutes)
   - Add these 3 environment variables in Railway:
     ```
     GOOGLE_SHEETS_CREDENTIALS=<paste entire JSON file contents>
     GOOGLE_SHEETS_ID=<your spreadsheet ID>
     GOOGLE_SHEET_NAME=Client Onboarding
     ```
   - Railway will auto-deploy

### Step 2: Upload Onboarding Page to Bluehost

1. **Log in to Bluehost cPanel**
2. **Go to File Manager**
3. **Upload the file:**
   - Upload: `/Users/djdizon/Projects/techmayne/onboarding-enterprise.html`
   - Location: `public_html/onboarding.html` (or wherever you want)
4. **Test it:**
   - Go to: `https://techmayne.com/onboarding.html`
   - Fill out the form
   - Submit and verify:
     - ✅ Success page shows embed code
     - ✅ You receive email at support@techmayne.com
     - ✅ Data appears in Google Sheet (once Step 1 is done)

### Step 3: Test Everything

Once Google Sheets is configured:

1. Open: `https://techmayne.com/onboarding.html`
2. Fill out a test client onboarding form
3. Submit and verify:
   - Success message appears with embed code
   - Email received at support@techmayne.com
   - New row added to Google Sheet
   - Client data saved in Supabase database

---

## 📊 How It Works

### When a Client Completes Onboarding:

1. **Form submitted** → Data sent to Railway backend
2. **Backend processes**:
   - Generates unique client token
   - Saves to Supabase database
   - Creates default FAQs
   - Saves custom FAQs (if provided)
   - **Saves to Google Sheets** (if configured)
   - **Sends admin email notification** (already working)
   - Returns embed code to client
3. **Client receives**:
   - Success message
   - Widget embed code to add to their site
   - Confirmation of installation service (if requested)

### When a Visitor Uses the Chatbot:

1. **Visitor clicks chat button** on client's website
2. **Bot collects information** (name, email, event details)
3. **Lead notification sent** to client's email (the photographer)
4. **Lead saved** in Supabase database

---

## 🎨 Current Files

### Production Files (Ready to Use):
- `onboarding-enterprise.html` - New enterprise-styled onboarding page
- `backend/` - Deployed to Railway
- `widget/src/widget.js` - Chat widget (served from Railway)

### Documentation:
- `GOOGLE_SHEETS_SETUP.md` - Step-by-step Google Sheets setup
- `SETUP_STATUS.md` - This file

### Legacy Files (Still functional):
- `onboarding-page-v2.html` - Original onboarding page (still works, old styling)

---

## 🚀 Next Steps After This

Once you complete Steps 1-3 above, you'll have:
- ✅ Auto-save to Google Sheets
- ✅ Email notifications working
- ✅ Professional onboarding page live on your domain

Then you can:
1. **Create additional onboarding pages** for different use cases
2. **Customize each page** for specific photographer types
3. **Eventually convert to WordPress** (when ready)

---

## 🆘 Support

If you run into issues:
1. Check Railway logs for errors
2. Verify environment variables have no leading spaces
3. Test with the onboarding page directly
4. Check email spam folder for notifications

**Current Admin Email:** support@techmayne.com
**Production Backend:** https://techmayne-production.up.railway.app
**Health Check:** https://techmayne-production.up.railway.app/health
