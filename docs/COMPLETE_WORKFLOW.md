# TechMayne - Complete Client Workflow

## PHASE 0: One-Time Infrastructure Setup
**When:** Before your first client
**Who:** You
**Time:** 30 minutes total

### Step 1: Supabase (Database) - 5 minutes
**What:** Database to store all client data, leads, conversations

**You do:**
```
✅ Already done! You have:
   - Project URL: https://jzsgvyqtavkukehfdyed.supabase.co
   - Database tables created
   - RLS policies enabled
```

**Cost:** $25/month (covers unlimited clients)

**Per new client:** Nothing - automatic!

---

### Step 2: Deploy Backend to Railway - 15 minutes
**What:** Host your Node.js backend code so it runs 24/7

**You do:**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Navigate to backend folder
cd /Users/djdizon/Projects/techmayne/backend

# 4. Initialize Railway project
railway init
# Name: techmayne-backend

# 5. Deploy
railway up

# 6. Add custom domain (optional)
railway domain
# Result: https://techmayne-backend-production.up.railway.app
```

**Environment Variables to Set in Railway:**
```
PORT=3000
SUPABASE_URL=https://jzsgvyqtavkukehfdyed.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=(add in next step)
```

**Cost:** $5/month (covers unlimited clients)

**Per new client:** Nothing - same backend serves everyone!

---

### Step 3: Set Up Resend (Email Service) - 10 minutes
**What:** Send lead notification emails to photographers

**You do:**
```
1. Go to https://resend.com
2. Sign up (free)
3. Verify your email
4. Get API key from dashboard
5. Add to Railway environment variables:
   RESEND_API_KEY=re_xxxxxxxxxxxxx
6. Update backend/services/emailService.js (see code below)
```

**Code Update:**
Replace `backend/services/emailService.js` with:
```javascript
const { Resend } = require('resend');
const supabase = require('../config/supabase');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendLeadNotification(clientId, lead) {
  try {
    // Get client details
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (!client) {
      console.error('Client not found for notification');
      return;
    }

    // Get conversation transcript
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', lead.conversation_id)
      .order('created_at', { ascending: true });

    const transcript = messages
      .map(m => `${m.role === 'user' ? 'Visitor' : 'Bot'}: ${m.content}`)
      .join('\n');

    const emailBody = `
New Lead from Your Website Chat!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEAD DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || 'Not provided'}

${lead.event_type ? `Event Type: ${lead.event_type}` : ''}
${lead.event_date ? `Date: ${lead.event_date}` : ''}
${lead.location ? `Location: ${lead.location}` : ''}
${lead.coverage_range ? `Coverage: ${lead.coverage_range}` : ''}
${lead.additional_notes ? `\nNotes: ${lead.additional_notes}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSATION TRANSCRIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${transcript}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quick Tip: Respond within 1 hour to increase booking chances by 60%!

Powered by TechMayne
    `;

    const { data, error } = await resend.emails.send({
      from: 'TechMayne Leads <leads@yourdomain.com>', // Change to your domain
      to: client.notification_email,
      subject: `New Lead: ${lead.name} - ${lead.event_type || 'Inquiry'}`,
      text: emailBody
    });

    if (error) throw error;

    console.log('Email notification sent:', data.id);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendLeadNotification };
```

**Install Resend package:**
```bash
cd backend
npm install resend
```

**Cost:** Free (3,000 emails/month), then $20/month

**Per new client:** Nothing - same account sends to everyone!

---

### Step 4: Update Widget URL - 2 minutes
**What:** Point widget to your live backend

**You do:**
Edit `widget/src/widget.js`, line 11:
```javascript
// Change from:
const API_BASE_URL = 'http://localhost:3000';

// To:
const API_BASE_URL = 'https://techmayne-backend-production.up.railway.app';
```

**Per new client:** Nothing - same widget for everyone!

---

### Step 5: Host Onboarding Page - 5 minutes
**What:** Make the onboarding form accessible online

**You do:**
```bash
# Option A: Netlify (easiest)
1. Go to https://app.netlify.com/drop
2. Drag onboarding-page.html
3. Get URL: https://techmayne-onboarding.netlify.app

# Option B: Vercel
npm install -g vercel
vercel onboarding-page.html
```

**Update API URL in onboarding-page.html:**
```javascript
const API_URL = 'https://techmayne-backend-production.up.railway.app';
```

**Per new client:** Nothing - same form for everyone!

---

## ✅ PHASE 0 COMPLETE!

**Total Setup:**
- Time: 30 minutes
- Cost: $30/month (covers unlimited clients)
- Done: Once, never again!

Now you're ready for your first client!

---

# PHASE 1: Making a Sale

## Step 1: Prospect Finds You
**Who:** Prospect (photographer)
**Time:** Varies

**How they find you:**
- Google search "chatbot for photographers"
- Social media ads
- Referral from another photographer
- Content marketing (blog, YouTube)

**Your marketing channels:**
- Landing page showing demo
- Instagram/Facebook ads targeting photographers
- LinkedIn outreach
- Photography Facebook groups

---

## Step 2: Demo Call (Optional) or Video Demo
**Who:** You + Prospect
**Time:** 10-15 minutes

**You do:**
```
1. Show test-widget.html (the demo chatbot)
2. Walk through visitor experience
3. Show lead notification email example
4. Explain pricing: $99/month or $997/year
5. Answer questions
6. Close: "Ready to get started?"
```

**Alternative (Scalable):**
- Pre-recorded Loom video showing everything
- Self-service: Watch video → Sign up → Done

---

## Step 3: Close Sale & Payment
**Who:** You
**Time:** 5 minutes

**You do:**
```
1. Collect payment via Stripe/PayPal
   - $99/month subscription
   - OR $997/year (save $191)

2. Send welcome email with onboarding link:

   Subject: Welcome to TechMayne! 🎉

   Hi [Name],

   Welcome! Your chatbot is ready to set up.

   Click here to complete setup:
   https://techmayne-onboarding.netlify.app

   Takes 2 minutes!

   Questions? Reply to this email.

   [Your Name]
```

**Tools used:**
- Stripe (payment processing)
- Email (Gmail or ConvertKit)

**Per client cost:** $0 (Stripe fees ~3%)

---

# PHASE 2: Client Integration

## Step 1: Client Fills Onboarding Form
**Who:** Client
**Time:** 2 minutes
**Tool:** Onboarding page (https://techmayne-onboarding.netlify.app)

**Client does:**
```
1. Opens onboarding link
2. Fills out form:
   - Business name: "Sarah Johnson Photography"
   - Website: "https://sarahjohnson.com"
   - Email: "sarah@sarahjohnson.com"
   - Booking link: "https://calendly.com/sarah"
   - Service area: "Seattle, WA"
   - Starting price: "$3,500"
   - Accent color: Purple (#8B5CF6)
3. Clicks "Generate My Chatbot"
```

**What happens automatically:**
```
✅ Backend creates client record in Supabase
✅ Generates unique client token
✅ Creates 4 default FAQs
✅ Generates embed code
✅ Shows embed code on screen
```

**You do:** Nothing! It's automated.

**Tools involved:**
- Supabase: Stores client data
- Backend: Processes form, creates records

---

## Step 2: Client Installs Widget on Website
**Who:** Client
**Time:** 2-5 minutes
**Tool:** Their website platform (Squarespace, WordPress, etc.)

**Client does:**

### If Squarespace:
```
1. Copy embed code from onboarding page
2. Go to Settings → Advanced → Code Injection
3. Paste in "Footer" section
4. Click Save
5. Visit website to see chatbot!
```

### If WordPress:
```
1. Copy embed code
2. Install plugin "Insert Headers and Footers" (or edit footer.php)
3. Paste in footer section
4. Save
5. Visit website to see chatbot!
```

### If Wix:
```
1. Copy embed code
2. Settings → Custom Code → Add Custom Code
3. Paste, select "Body - End", apply to all pages
4. Publish site
5. Visit website to see chatbot!
```

### If Showit:
```
1. Copy embed code
2. Site Settings → Advanced → Custom Code → Footer
3. Paste code
4. Publish
5. Visit website to see chatbot!
```

**You do:** Nothing! Client does it themselves.

**If client needs help:**
- Send video tutorial (make once, reuse forever)
- Or offer white-glove installation for $50 extra

**Tools involved:**
- Widget (JavaScript file served from your backend)
- Client's website platform

---

## Step 3: Test & Verify
**Who:** Client (or you)
**Time:** 2 minutes

**Client does:**
```
1. Visit their website
2. Click chat bubble (bottom right)
3. Test conversation flow
4. Complete a test inquiry to verify email notification
```

**You verify:**
```
1. Check Supabase → clients table → see new client
2. Check leads table after test → see test lead
3. Confirm client received test email
```

**Tools involved:**
- Supabase (view data)
- Email (verify delivery)

---

## ✅ PHASE 2 COMPLETE!

**Total Time:**
- Client: 5-10 minutes
- You: 0 minutes (automated!)

Client's chatbot is now LIVE! 🎉

---

# PHASE 3: Lead Reception & Management

## When a Visitor Chats on Client's Website

### Step 1: Visitor Interaction
**Who:** Website visitor
**Time:** 2-5 minutes
**Tool:** Chatbot widget

**Visitor does:**
```
1. Lands on photographer's website
2. Sees chat bubble (bottom right)
3. Clicks to open chatbot
4. Chats with bot:
   - "When will I get my photos?" → FAQ answered
   - OR "Check availability" → Provides event details
5. Provides contact info (name, email, phone)
6. Completes conversation
```

**What happens automatically:**
```
✅ Conversation saved to Supabase (messages table)
✅ Lead created in Supabase (leads table)
✅ Email sent to photographer
✅ Visitor sees confirmation
```

**Tools involved:**
- Widget: Chat interface
- Backend: Processes messages, runs bot logic
- Supabase: Stores conversation + lead
- Resend: Sends email

---

### Step 2: Photographer Receives Lead
**Who:** Client (photographer)
**Time:** Instant
**Tool:** Email

**Client receives:**
```
Subject: New Lead: Sarah Williams - Wedding

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEAD DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: Sarah Williams
Email: sarah.williams@email.com
Phone: (206) 555-1234

Event Type: Wedding
Date: June 15, 2026
Location: Seattle, WA
Coverage: 8-10 hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSATION TRANSCRIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bot: Hi! How can I help?
Visitor: Check availability
Bot: What type of event?
Visitor: Wedding
...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Respond within 1 hour for best results!
```

**You do:** Nothing - automated!

**Tools involved:**
- Resend: Email delivery
- Client's email inbox

---

### Step 3: Client Follows Up
**Who:** Client (photographer)
**Time:** Varies

**Client does:**
```
1. Reads lead email
2. Reviews conversation transcript
3. Responds to prospect via email/phone
4. Sends quote
5. Books client!
```

**You do:** Nothing - this is their sales process

**Optional: You can add:**
- CRM integration (auto-add to HoneyBook, Dubsado)
- SMS notifications
- Slack notifications
- Status tracking

---

## ✅ PHASE 3 COMPLETE!

**Your involvement:** 0 minutes - fully automated!

---

# PHASE 4: Ongoing Maintenance

## Monthly Tasks

### Your Responsibilities

#### 1. Monitor Infrastructure (5 min/month)
**What:** Check that everything is running

**You do:**
```
1. Check Railway dashboard → Ensure backend is running
2. Check Supabase dashboard → Review usage (should be <50% of limits)
3. Check Resend dashboard → Review email delivery rate
```

**If issues:**
- Railway down: Automatic restart (usually)
- Supabase errors: Check logs, fix RLS policy issues
- Email bounces: Notify client to update email

**Tools used:**
- Railway dashboard
- Supabase dashboard
- Resend dashboard

---

#### 2. Review Errors (5 min/month)
**What:** Check for any system errors

**You do:**
```
1. Railway logs → Look for 500 errors
2. Supabase logs → Look for database errors
3. Fix if needed (rare)
```

**Common issues:**
- Database connection timeout: Restart Railway
- Email API limit: Upgrade Resend plan
- Widget not loading: Check CORS settings

---

#### 3. Handle Support Requests (10-30 min/month per client)
**What:** Answer client questions

**Common questions:**
```
Q: "How do I update my FAQs?"
A: Send them updated FAQ list → You add to Supabase

Q: "Can I change the chatbot color?"
A: Update accent_color in Supabase → clients table

Q: "I'm not receiving emails"
A: Check Resend logs, verify notification_email

Q: "How do I remove the chatbot temporarily?"
A: Remove embed code from website OR set is_active=false

Q: "Can I see all my leads?"
A: Give them Supabase dashboard access OR build client portal
```

**Tools used:**
- Supabase (update client settings)
- Email (support responses)

---

#### 4. Billing & Payments (5 min/month)
**What:** Ensure clients are paying

**You do:**
```
1. Stripe dashboard → Check for failed payments
2. If payment fails:
   - Email client to update card
   - After 7 days: Pause chatbot (set is_active=false)
   - After 30 days: Delete client data
```

**Tools used:**
- Stripe dashboard
- Supabase (update is_active status)

---

### Client Responsibilities

#### 1. Respond to Leads (ongoing)
**Client does:**
```
- Check email for new leads
- Respond to prospects
- Book clients
```

**You do:** Nothing

---

#### 2. Update Business Info (rare)
**Client may request:**
```
- Change pricing
- Update service area
- Add/remove FAQs
- Change accent color
```

**You do:**
```
- Update in Supabase → clients table
- OR build self-service dashboard (future feature)
```

**Time:** 2 minutes per update request

---

## Maintenance Summary

**Your Time Per Month:**
- Infrastructure monitoring: 5 min
- Error checking: 5 min
- Support (avg 10 clients): 30 min
- Billing: 5 min
**Total: 45 minutes/month**

**Your Costs:**
- Infrastructure: $30/month (fixed)
- Time: ~1 hour (scales slowly)

**Revenue (10 clients):**
- $990/month

**Profit:**
- $960/month for 1 hour of work = $960/hr! 🤯

---

# Complete Flow Summary

## Timeline Overview

```
PHASE 0: One-Time Setup
├─ You: 30 minutes, $30/month infrastructure
└─ Done once, never again

PHASE 1: Sales (per client)
├─ Demo: 10 min (or pre-recorded video)
├─ Close: 5 min
└─ Send onboarding link: 1 min
   Total: 15 min

PHASE 2: Integration (per client)
├─ Client fills form: 2 min
├─ System auto-creates: Instant
├─ Client installs: 5 min
└─ Test: 2 min
   Total: 9 min (client does it!)
   Your time: 0 min

PHASE 3: Ongoing Leads
├─ Lead comes in: Automated
├─ Email sent: Automated
└─ Client follows up: Their process
   Your time: 0 min

PHASE 4: Maintenance
└─ Monthly: 45 min
   Scales to: 2-3 hours (100 clients)
```

---

## Tool Usage Breakdown

| Tool | Setup | Per Client | Ongoing | Cost |
|------|-------|------------|---------|------|
| **Supabase** | Once | Auto | Monitor | $25/mo |
| **Railway** | Once | None | Monitor | $5/mo |
| **Resend** | Once | None | Auto | $0-20/mo |
| **Widget** | Once | None | None | Free |
| **Onboarding** | Once | Auto | None | Free |
| **Stripe** | Once | Auto | Check | 3% fee |

---

## Your Actual Work

**Per New Client:**
1. Demo call: 10 min (or skip with video)
2. Send onboarding link: 1 min
3. **Total: 11 minutes**

**Per Month (all clients):**
1. Check dashboards: 10 min
2. Support requests: 30 min
3. **Total: 40 minutes**

**Everything else:** AUTOMATED! ✅

---

## Questions?

Want me to help you with:
1. ✅ Deploy to Railway right now?
2. ✅ Set up Resend email?
3. ✅ Build client dashboard for self-service?
4. ✅ Create pre-recorded demo video?
5. ✅ Set up Stripe billing?

Everything is ready - you just need to deploy! 🚀
