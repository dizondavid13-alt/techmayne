# Resend Email Setup Guide

This guide walks you through setting up Resend for email notifications in TechMayne.

## Why Resend?

- ✅ Built for developers, simple API
- ✅ Free tier: 3,000 emails/month, 100/day
- ✅ Excellent deliverability (emails won't go to spam)
- ✅ Can use your own domain for professional emails
- ✅ Much better than Gmail app passwords
- ✅ Beautiful email templates supported

## What Emails Will Be Sent?

Your TechMayne system sends two types of emails:

1. **Lead Notifications** → Sent to photographers when they receive inquiries
2. **Admin Notifications** → Sent to YOU when new clients sign up

## Step 1: Create Resend Account

### 1.1 Sign Up

1. Go to https://resend.com/
2. Click "Get Started"
3. Sign up with GitHub or email
4. Verify your email address

### 1.2 Complete Onboarding

Resend will ask a few questions:
- What will you use Resend for? → **Transactional emails**
- How many emails per month? → **Less than 10,000**

## Step 2: Get Your API Key

### 2.1 Create API Key

1. In Resend dashboard, click "API Keys" in the left sidebar
2. Click "Create API Key"
3. Name it: `TechMayne Production`
4. Permission: **Sending access** (default)
5. Click "Add"

### 2.2 Copy API Key

**IMPORTANT:** Copy the API key immediately - you won't see it again!

It looks like: `re_123abc456def789ghi`

**Save it somewhere safe** - you'll need it for:
- Railway environment variables
- Local testing

## Step 3: Verify Your Domain (Optional but Recommended)

Using your own domain makes emails look more professional and improves deliverability.

### 3.1 Add Domain

1. Click "Domains" in left sidebar
2. Click "Add Domain"
3. Enter your domain: `yourdomain.com`
4. Click "Add"

### 3.2 Add DNS Records

Resend will show you DNS records to add. You need to add these to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

**DKIM Records (2 records):**
```
Type: TXT
Name: resend._domainkey
Value: [Resend will provide this]

Type: TXT
Name: resend2._domainkey
Value: [Resend will provide this]
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:your-email@yourdomain.com
```

### 3.3 Verify Domain

After adding DNS records (can take up to 48 hours):

1. Click "Verify" in Resend dashboard
2. Wait for all records to show green checkmarks
3. Status will change to "Verified"

**Note:** You can send emails immediately using Resend's domain while waiting for verification!

## Step 4: Update Email Services

Now you need to replace Nodemailer with Resend in your code.

### 4.1 Install Resend Package

```bash
cd backend
npm install resend
```

### 4.2 Update package.json

Your `package.json` dependencies should now include:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "googleapis": "^128.0.0",
    "resend": "^3.0.0",
    "uuid": "^9.0.1"
  }
}
```

**Note:** You can now remove `nodemailer` dependency.

### 4.3 Create New Resend Service

Create `backend/services/resendService.js`:

```javascript
const { Resend } = require('resend');

class ResendService {
  constructor() {
    this.resend = null;
    this.fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  }

  /**
   * Initialize Resend client
   */
  initialize() {
    if (this.resend) return this.resend;

    if (!process.env.RESEND_API_KEY) {
      console.warn('Resend API key not configured. Emails will not be sent.');
      return null;
    }

    try {
      this.resend = new Resend(process.env.RESEND_API_KEY);
      return this.resend;
    } catch (error) {
      console.error('Error initializing Resend:', error.message);
      return null;
    }
  }

  /**
   * Send lead notification to photographer
   */
  async sendLeadNotification(clientId, lead) {
    try {
      const resend = this.initialize();
      if (!resend) {
        console.warn('Resend not initialized. Skipping lead notification.');
        return { success: false, error: 'Not configured' };
      }

      // Get client info from Supabase
      const supabase = require('../config/supabase');
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (!client) {
        throw new Error('Client not found');
      }

      // Create email HTML
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .lead-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-row { margin-bottom: 10px; }
            .label { font-weight: 600; color: #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New Lead for ${client.business_name}!</h1>
              <p style="margin: 0; opacity: 0.9;">You have a new inquiry from your website</p>
            </div>
            <div class="content">
              <div class="lead-info">
                <h2 style="margin-top: 0; color: #667eea;">Contact Information</h2>
                <div class="info-row">
                  <span class="label">Name:</span> ${lead.name}
                </div>
                <div class="info-row">
                  <span class="label">Email:</span> <a href="mailto:${lead.email}">${lead.email}</a>
                </div>
                <div class="info-row">
                  <span class="label">Phone:</span> <a href="tel:${lead.phone}">${lead.phone}</a>
                </div>
              </div>

              <div class="lead-info">
                <h2 style="margin-top: 0; color: #667eea;">Event Details</h2>
                <div class="info-row">
                  <span class="label">Event Type:</span> ${lead.event_type}
                </div>
                <div class="info-row">
                  <span class="label">Date:</span> ${lead.event_date}
                </div>
                <div class="info-row">
                  <span class="label">Location:</span> ${lead.event_location}
                </div>
                <div class="info-row">
                  <span class="label">Coverage:</span> ${lead.coverage_type}
                </div>
              </div>

              <div style="margin-top: 30px; padding: 20px; background: #d1f2eb; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-weight: 600; color: #166534;">
                  💡 Respond quickly to increase your booking rate!
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email
      const result = await resend.emails.send({
        from: this.fromEmail,
        to: client.notification_email,
        subject: `New Lead: ${lead.name} - ${lead.event_type}`,
        html: emailHtml
      });

      console.log('Lead notification sent:', result.id);
      return { success: true, id: result.id };
    } catch (error) {
      console.error('Error sending lead notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send admin notification when new client signs up
   */
  async sendAdminNotification(clientData) {
    try {
      const resend = this.initialize();
      if (!resend) {
        console.warn('Resend not initialized. Skipping admin notification.');
        return { success: false, error: 'Not configured' };
      }

      if (!process.env.ADMIN_EMAIL) {
        console.warn('Admin email not configured. Skipping admin notification.');
        return { success: false, error: 'Admin email not set' };
      }

      // Format custom FAQs
      const customFaqsHtml = clientData.customFaqs && clientData.customFaqs.length > 0
        ? clientData.customFaqs.map((faq, i) => `
            <div style="margin-bottom: 15px; padding: 10px; background: #f9fafb; border-left: 3px solid #667eea;">
              <strong>Q${i+1}:</strong> ${faq.question}<br>
              <strong>A:</strong> ${faq.answer}<br>
              <strong>Keywords:</strong> ${faq.keywords || 'none'}
            </div>
          `).join('')
        : '<p style="color: #666;">No custom FAQs added</p>';

      // Format installation details
      const installationHtml = clientData.installation
        ? `
          <div style="padding: 15px; background: #fef3c7; border-radius: 8px; margin-top: 15px;">
            <h3 style="color: #92400e; margin-top: 0;">🔧 Installation Service Requested</h3>
            <p><strong>Platform:</strong> ${clientData.installation.platform}</p>
            <p><strong>Username:</strong> ${clientData.installation.username}</p>
            <p><strong>Password:</strong> ${clientData.installation.password}</p>
            <p><strong>Client Phone:</strong> ${clientData.phoneNumber}</p>
            <p><strong>2FA Status:</strong> ${clientData.installation.twoFactorStatus}</p>
            ${clientData.installation.twoFactorStatus === 'enabled_will_provide' ? `<p style="color: #92400e;"><em>📱 Text client for 2FA code (time-sensitive)</em></p>` : ''}
            ${clientData.installation.instructions ? `<p><strong>Special Instructions:</strong><br>${clientData.installation.instructions}</p>` : ''}
            <p style="color: #92400e; font-weight: 600;">⚠️ Client expects installation within 48 hours</p>
          </div>
        `
        : `
          <div style="padding: 15px; background: #f0fdf4; border-radius: 8px; margin-top: 15px;">
            <p style="color: #166534; margin: 0;"><strong>✅ DIY Installation</strong> - Client will install themselves</p>
          </div>
        `;

      // Create email HTML
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
            .info-row { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0; }
            .label { font-weight: 600; color: #667eea; }
            .section-title { font-size: 1.2em; color: #667eea; margin-top: 25px; margin-bottom: 15px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New Client Signup!</h1>
              <p style="margin: 0; opacity: 0.9;">TechMayne Client Onboarding</p>
            </div>
            <div class="content">
              <h2 class="section-title">📋 Business Information</h2>

              <div class="info-row">
                <div class="label">Business Name</div>
                <div>${clientData.businessName}</div>
              </div>

              <div class="info-row">
                <div class="label">Website URL</div>
                <div><a href="${clientData.websiteUrl}">${clientData.websiteUrl}</a></div>
              </div>

              <div class="info-row">
                <div class="label">Email</div>
                <div><a href="mailto:${clientData.notificationEmail}">${clientData.notificationEmail}</a></div>
              </div>

              <div class="info-row">
                <div class="label">Phone</div>
                <div>${clientData.phoneNumber || 'Not provided'}</div>
              </div>

              <h2 class="section-title">🎨 Chatbot Customization</h2>

              <div class="info-row">
                <div class="label">Booking Link</div>
                <div>${clientData.bookingLink ? `<a href="${clientData.bookingLink}">${clientData.bookingLink}</a>` : 'Not provided'}</div>
              </div>

              <div class="info-row">
                <div class="label">Service Area</div>
                <div>${clientData.serviceArea || 'Not provided'}</div>
              </div>

              <div class="info-row">
                <div class="label">Starting Price</div>
                <div>${clientData.startingPrice || 'Not provided'}</div>
              </div>

              <div class="info-row">
                <div class="label">Gallery Timeline</div>
                <div>${clientData.galleryTimeline || 'Not provided'}</div>
              </div>

              <div class="info-row">
                <div class="label">Accent Color</div>
                <div>
                  <span style="display: inline-block; width: 30px; height: 30px; background: ${clientData.accentColor}; border-radius: 5px; vertical-align: middle; margin-right: 10px; border: 1px solid #ddd;"></span>
                  ${clientData.accentColor}
                </div>
              </div>

              <h2 class="section-title">💬 Custom FAQs</h2>
              ${customFaqsHtml}

              ${installationHtml}

              <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #666;"><strong>Client Token:</strong></p>
                <code style="background: #1e293b; color: #10b981; padding: 8px 16px; border-radius: 5px; display: inline-block; margin-top: 10px;">${clientData.clientToken}</code>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email
      const result = await resend.emails.send({
        from: this.fromEmail,
        to: process.env.ADMIN_EMAIL,
        subject: `🎉 New Client Signup: ${clientData.businessName}`,
        html: emailHtml
      });

      console.log('Admin notification sent:', result.id);
      return { success: true, id: result.id };
    } catch (error) {
      console.error('Error sending admin notification:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ResendService();
```

### 4.4 Update botFlow.js to Use Resend

Edit `backend/services/botFlow.js`:

Find the section where it sends email:

```javascript
// Replace this:
try {
  const emailService = require('./emailService');
  await emailService.sendLeadNotification(this.clientId, lead);
} catch (emailError) {
  console.warn('Email notification failed (OK if not configured):', emailError.message);
}

// With this:
try {
  const resendService = require('./resendService');
  await resendService.sendLeadNotification(this.clientId, lead);
} catch (emailError) {
  console.warn('Email notification failed (OK if not configured):', emailError.message);
}
```

### 4.5 Update onboarding.js to Use Resend

Edit `backend/routes/onboarding.js`:

Find the admin notification section:

```javascript
// Replace this:
adminNotificationService.sendNewClientNotification(sheetData).catch(err => {
  console.error('Admin notification failed (non-critical):', err);
});

// With this:
const resendService = require('../services/resendService');
resendService.sendAdminNotification(sheetData).catch(err => {
  console.error('Admin notification failed (non-critical):', err);
});
```

## Step 5: Configure Environment Variables

### 5.1 Local Environment (.env)

Add to your `backend/.env`:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=your_admin_email@gmail.com
```

**Important:**
- `FROM_EMAIL`: Use `onboarding@resend.dev` until your domain is verified
- After domain verification: Use `noreply@yourdomain.com` or `hello@yourdomain.com`
- `ADMIN_EMAIL`: Where YOU receive signup notifications

### 5.2 Railway Environment

In Railway → Variables tab, add:

```bash
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=your_admin_email@gmail.com
```

### 5.3 Remove Old Email Variables

You can now remove these (no longer needed):
- `EMAIL_SERVICE`
- `EMAIL_USER`
- `EMAIL_PASSWORD`

## Step 6: Test Email Sending

### 6.1 Test Locally

```bash
cd backend
npm start
```

Complete a chatbot conversation and verify:
1. Lead is created in Supabase
2. Email is sent to photographer's notification email
3. Check Resend dashboard → "Emails" to see delivery status

### 6.2 Test Admin Notification

Fill out `onboarding-page-v2.html` and verify:
1. You receive email at your admin email
2. Email contains all client information
3. Check Resend dashboard for delivery status

## Step 7: Monitor Email Delivery

### 7.1 Resend Dashboard

View all sent emails:
1. Go to Resend dashboard
2. Click "Emails" in sidebar
3. See status: Delivered, Bounced, Complained, etc.

### 7.2 Email Status Codes

- ✅ **Delivered** - Email successfully delivered
- ⏳ **Queued** - Waiting to be sent
- ❌ **Bounced** - Email address doesn't exist
- 🚫 **Complained** - Recipient marked as spam

## Step 8: Use Custom Domain (Optional)

Once your domain is verified:

### 8.1 Update FROM_EMAIL

In `.env` and Railway variables:

```bash
# Before (using Resend's domain)
FROM_EMAIL=onboarding@resend.dev

# After (using your domain)
FROM_EMAIL=noreply@yourdomain.com
```

or

```bash
FROM_EMAIL=hello@yourdomain.com
```

### 8.2 Benefits

- ✅ More professional
- ✅ Better deliverability
- ✅ Brand recognition
- ✅ Less likely to go to spam

## Free Tier Limits

**Resend Free Plan:**
- 3,000 emails per month
- 100 emails per day
- API access
- Email logs for 30 days

**Calculation:**
- Each lead = 1 email to photographer
- Each signup = 1 email to you
- 10 clients × 10 leads/month = 100 emails/month
- Well within free tier!

## Upgrade (If Needed)

**Pro Plan: $20/month**
- 50,000 emails/month
- 1,000 emails/day
- Email logs for 90 days
- Priority support

You'll only need this if you have 50+ active clients receiving lots of leads.

## Troubleshooting

### Emails Not Sending

**Check:**
1. Resend API key is correct
2. `RESEND_API_KEY` is set in environment variables
3. `FROM_EMAIL` is valid (use `onboarding@resend.dev` if unsure)
4. Check Resend dashboard → Emails for error messages

### Emails Going to Spam

**Solutions:**
1. Verify your domain (SPF, DKIM, DMARC records)
2. Use a professional from address (not `test@`, `noreply@` is fine)
3. Don't include spam trigger words
4. Ask recipients to whitelist your domain

### "Invalid API Key" Error

**Check:**
1. API key starts with `re_`
2. No extra spaces before/after in .env
3. Environment variables loaded correctly (restart server)

### Domain Not Verifying

**Check:**
1. DNS records added correctly
2. Wait up to 48 hours for DNS propagation
3. Use `dig` or DNS checker tools to verify records
4. Contact Resend support if still failing after 48 hours

## Best Practices

### Email Content

✅ **Do:**
- Use professional language
- Include all relevant information
- Make important details stand out
- Add clear call-to-action
- Test emails before going live

❌ **Don't:**
- Use all caps (looks like spam)
- Include too many links
- Send from suspicious addresses
- Use URL shorteners
- Send without testing first

### Security

- 🔒 Keep API keys secret
- 🔒 Never commit API keys to Git
- 🔒 Use environment variables
- 🔒 Rotate API keys periodically
- 🔒 Monitor for unusual activity

## Next Steps

✅ Resend account created
✅ API key generated
✅ Code updated to use Resend
✅ Environment variables configured
✅ Email sending tested

**You're ready for production email notifications!**

## Support Resources

- Resend Docs: https://resend.com/docs
- Resend Status: https://status.resend.com/
- Email Resend: support@resend.com
- Discord: https://discord.gg/resend
