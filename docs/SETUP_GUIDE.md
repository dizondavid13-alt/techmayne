# TechMayne Setup Guide

## Project Overview
TechMayne is a scripted chatbot system for photographer websites that helps qualify leads, answer FAQs, and collect contact information - all without AI API costs.

## ✅ What's Been Set Up

### Database (Supabase)
- ✅ 5 tables created with proper relationships
- ✅ Row Level Security (RLS) policies enabled
- ✅ Indexes for performance optimization
- ✅ Default FAQ creation function
- ✅ Security advisor checks passed

**Tables:**
- `clients` - Multi-tenant client configurations
- `faq_entries` - FAQ knowledge base per client
- `conversations` - Visitor conversation tracking
- `messages` - Full conversation history
- `leads` - Qualified lead captures

### Backend API (Node.js + Express)
- ✅ Express server configured
- ✅ Supabase integration
- ✅ Email service (Nodemailer)
- ✅ Conversation flow engine (scripted, zero AI costs)
- ✅ FAQ matching system
- ✅ All routes implemented
- ✅ Google Sheets integration (optional)
- ✅ Admin email notifications (optional)

**API Endpoints:**
- `POST /api/chat/message` - Handle chat interactions
- `GET /api/config/:clientToken` - Widget configuration
- `POST /api/onboarding/create` - Onboard new photographers
- `GET /health` - Health check

**Services:**
- `botFlow.js` - Conversation state machine
- `emailService.js` - Lead notifications to clients
- `adminNotificationService.js` - Signup notifications to you
- `sheetsService.js` - Auto-save to Google Sheets
- `faqMatcher.js` - Keyword-based FAQ matching

### Widget (JavaScript)
- ✅ Embeddable chat widget
- ✅ Responsive design
- ✅ Customizable colors
- ✅ Button-based interaction flow

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd backend
npm start
```

The server will run on `http://localhost:3000`

### 2. Test the Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-12-31T..."}
```

### 3. Create Your First Client (Photographer)

```bash
curl -X POST http://localhost:3000/api/onboarding/create \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Your Photography Studio",
    "websiteUrl": "https://yourwebsite.com",
    "notificationEmail": "you@example.com",
    "bookingLink": "https://calendly.com/yourusername",
    "serviceArea": "San Francisco Bay Area",
    "startingPrice": "$2,500",
    "accentColor": "#6366f1"
  }'
```

**Save the `clientToken` from the response!** You'll need it for the widget.

### 4. Test the Widget Locally

Create a test HTML file (`test.html`):

```html
<!DOCTYPE html>
<html>
<head>
  <title>TechMayne Widget Test</title>
</head>
<body>
  <h1>My Photography Website</h1>
  <p>This is a test page for the TechMayne chatbot widget.</p>

  <!-- Replace YOUR_CLIENT_TOKEN with the token from step 3 -->
  <script src="http://localhost:3000/../widget/src/widget.js" data-client-token="YOUR_CLIENT_TOKEN"></script>
</body>
</html>
```

Open this file in your browser and click the chat button in the bottom right!

## 📧 Email Configuration (Optional)

### Lead Notifications (to Clients)

To send lead notifications to photographers when they receive inquiries:

1. **For Gmail:**
   - Go to https://myaccount.google.com/apppasswords
   - Create an "App Password" for "Mail"
   - Update `backend/.env`:
     ```
     EMAIL_SERVICE=gmail
     EMAIL_USER=your.email@gmail.com
     EMAIL_PASSWORD=your_16_char_app_password
     ```

2. **Test email functionality:**
   - Complete a conversation in the widget
   - Check your notification email

### Admin Notifications (to You)

To receive notifications when new clients sign up:

1. **Add admin email to `.env`:**
   ```
   ADMIN_EMAIL=your_admin_email@gmail.com
   ```

2. **Test:**
   - Create a new client via the onboarding form
   - You should receive a detailed email with all client info

## 📊 Google Sheets Integration (Optional)

Automatically save all client signups to a Google Spreadsheet for easy tracking and backup.

**See detailed setup guide:** [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)

**Quick summary:**
1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a service account and download JSON key
4. Create a Google Spreadsheet and share it with the service account
5. Add credentials to `.env`:
   ```
   GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...}
   GOOGLE_SHEETS_ID=your_spreadsheet_id
   GOOGLE_SHEET_NAME=Client Onboarding
   ```

**Benefits:**
- ✅ Automatic backup of all client data
- ✅ Easy filtering and sorting
- ✅ Export to CSV/Excel
- ✅ Share with team members
- ✅ No code changes needed - fully optional

## 🧪 Testing the Bot Flow

The bot has the following conversation paths:

1. **Check Availability Flow:**
   - Welcome → Main Menu → Check Availability
   - Collect: Event Type → Date → Location → Coverage
   - Collect: Name → Email → Phone
   - Create Lead → Send Email

2. **View Packages Flow:**
   - Welcome → Main Menu → View Packages
   - Display pricing info

3. **FAQ Flow:**
   - Welcome → Main Menu → Ask Question
   - Try keywords: "travel", "timeline", "included", "book"
   - If FAQ matches, show answer
   - If no match, collect contact info

## 🎨 Client Onboarding

### Enhanced Onboarding Page

Use `onboarding-page-v2.html` for a self-service client signup experience.

**Features:**
- ✅ Business information collection (name, website, email, phone)
- ✅ Chatbot customization (booking link, service area, pricing, colors)
- ✅ **Custom FAQ builder** - Clients can add their own FAQs beyond the 4 defaults
- ✅ **Installation service option** - Offer to install the widget for clients ($50 fee)
  - Securely collects platform credentials
  - Tracks 2FA status
  - Special instructions field
  - Consent checkbox
- ✅ Instant embed code generation
- ✅ Platform-specific installation instructions (Squarespace, WordPress, Wix, Showit)
- ✅ Auto-save to Google Sheets (if configured)
- ✅ Email notification to admin (if configured)

**What clients provide:**
- Business name, website, email, phone
- Optional: Booking link, service area, pricing, gallery timeline
- Optional: Custom FAQs (unlimited)
- Optional: Installation service credentials

**What they receive:**
- Unique client token
- Embed code ready to paste
- Installation instructions OR confirmation of 48-hour installation

### Installation Service Workflow

If a client requests installation help:

1. **Data collected:**
   - Website platform (Squarespace, WordPress, Wix, etc.)
   - Login username/email
   - Login password (type="password" for security)
   - 2FA status (disabled, can disable, will provide code)
   - Special instructions (optional)

2. **Security measures:**
   - Consent checkbox required
   - Clear messaging about what access you'll have
   - Password field type for visual security
   - Credentials stored in Supabase (can be encrypted in production)

3. **Your workflow:**
   - Receive email notification with all details
   - Check Google Sheet for credentials
   - Log into client's website within 48 hours
   - Paste embed code in footer
   - Test the chatbot
   - Notify client of completion
   - Delete credentials from database

4. **Access installation requests:**
   ```sql
   SELECT
     business_name,
     website_url,
     phone_number,
     installation_platform,
     installation_username,
     installation_password,
     installation_2fa_status,
     installation_instructions,
     created_at
   FROM clients
   WHERE installation_requested = true
   ORDER BY created_at DESC;
   ```

## 🔧 Customization

### Add Custom FAQs for a Client

```sql
-- In Supabase SQL Editor
INSERT INTO faq_entries (client_id, question, answer, keywords)
VALUES (
  'YOUR_CLIENT_UUID',
  'Do you offer videography?',
  'Yes! We offer videography packages starting at $1,500.',
  ARRAY['video', 'videography', 'film']
);
```

### Change Widget Colors

Update the `accentColor` when creating a client, or update directly:

```sql
UPDATE clients
SET accent_color = '#ff6b6b'
WHERE client_token = 'YOUR_CLIENT_TOKEN';
```

## 📊 Monitoring

### View All Leads

```sql
SELECT
  l.name,
  l.email,
  l.event_type,
  l.event_date,
  c.business_name,
  l.created_at
FROM leads l
JOIN clients c ON l.client_id = c.id
ORDER BY l.created_at DESC;
```

### View Conversation History

```sql
SELECT
  m.role,
  m.content,
  m.created_at
FROM messages m
JOIN conversations conv ON m.conversation_id = conv.id
WHERE conv.id = 'CONVERSATION_UUID'
ORDER BY m.created_at ASC;
```

## 🚀 Next Steps

1. **Test the complete flow** - Create a client and test all conversation paths
2. **Configure email notifications** - Set up Gmail app password
3. **Deploy to production:**
   - Deploy backend to Railway, Render, or Heroku
   - Host widget.js on a CDN or with your backend
   - Update `API_BASE_URL` in `widget/src/widget.js`
4. **Add more clients** - Onboard photographers using the `/api/onboarding/create` endpoint

## 📁 Project Structure

```
techmayne/
├── backend/
│   ├── config/
│   │   └── supabase.js          # Supabase client setup
│   ├── routes/
│   │   ├── chat.js              # Chat message handling
│   │   ├── onboarding.js        # Client creation
│   │   └── widget-config.js     # Widget configuration
│   ├── services/
│   │   ├── botFlow.js           # Conversation state machine
│   │   ├── emailService.js      # Lead notifications
│   │   └── faqMatcher.js        # Keyword matching
│   ├── .env                     # Environment variables (NOT in git)
│   ├── .env.example             # Template for .env
│   ├── package.json
│   └── server.js                # Express app entry point
├── widget/
│   ├── src/
│   │   └── widget.js            # Embeddable chat widget
│   └── package.json
├── docs/
│   └── SETUP_GUIDE.md           # This file
├── .gitignore
└── README.md
```

## 🔐 Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Client token authentication
- ✅ Input validation on all endpoints
- ✅ Environment variables for sensitive data
- ✅ CORS enabled for cross-origin requests
- ✅ SQL injection protection (parameterized queries)

## 🆘 Troubleshooting

### Widget doesn't appear
- Check browser console for errors
- Verify `data-client-token` is correct
- Ensure backend server is running
- Check CORS settings if hosting on different domain

### Email not sending
- Verify Gmail App Password is correct
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Look for errors in backend console logs

### Bot not responding
- Check network tab in browser dev tools
- Verify API endpoint URLs are correct
- Check backend console for errors
- Ensure Supabase connection is working

## 📞 Support

For issues or questions, check the backend logs:
```bash
cd backend
npm start
# Watch console output for errors
```
