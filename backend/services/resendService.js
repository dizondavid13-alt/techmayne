const { Resend } = require('resend');
const supabase = require('../config/supabase');

/**
 * Resend Email Service
 * Handles all email notifications using Resend API
 */

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

      // Get client info
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (!client) {
        throw new Error('Client not found');
      }

      // SAFEGUARD: Skip email for demo/test clients
      const DEMO_CLIENT_TOKEN = 'c8082d26-223f-4eee-af1b-001c197fa3d8';
      if (client.client_token === DEMO_CLIENT_TOKEN) {
        console.log('🚫 Demo client detected - skipping lead notification email to preserve Resend quota');
        return { success: false, error: 'Demo client - email skipped' };
      }

      // Skip if notification email contains test/demo/example keywords
      const testEmailPatterns = ['demo', 'test', 'example', 'noreply'];
      const emailLower = (client.notification_email || '').toLowerCase();
      if (testEmailPatterns.some(pattern => emailLower.includes(pattern))) {
        console.log(`🚫 Test/demo email detected (${client.notification_email}) - skipping lead notification to preserve Resend quota`);
        return { success: false, error: 'Test email - email skipped' };
      }

      // Create email HTML
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .lead-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .info-row { margin-bottom: 12px; }
            .label { font-weight: 600; color: #667eea; display: inline-block; min-width: 120px; }
            .cta { margin-top: 30px; padding: 20px; background: #d1f2eb; border-radius: 8px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 New Lead!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${client.business_name}</p>
            </div>
            <div class="content">
              <div class="lead-info">
                <h2 style="margin-top: 0; color: #667eea;">Contact Information</h2>
                <div class="info-row">
                  <span class="label">Name:</span>
                  <strong>${lead.name}</strong>
                </div>
                <div class="info-row">
                  <span class="label">Email:</span>
                  <a href="mailto:${lead.email}" style="color: #667eea;">${lead.email}</a>
                </div>
                <div class="info-row">
                  <span class="label">Phone:</span>
                  <a href="tel:${lead.phone}" style="color: #667eea;">${lead.phone}</a>
                </div>
              </div>

              <div class="lead-info">
                <h2 style="margin-top: 0; color: #667eea;">Event Details</h2>
                <div class="info-row">
                  <span class="label">Event Type:</span>
                  <strong>${lead.event_type}</strong>
                </div>
                <div class="info-row">
                  <span class="label">Date:</span>
                  ${lead.event_date}
                </div>
                <div class="info-row">
                  <span class="label">Location:</span>
                  ${lead.event_location}
                </div>
                <div class="info-row">
                  <span class="label">Coverage:</span>
                  ${lead.coverage_type}
                </div>
              </div>

              <div class="cta">
                <p style="margin: 0; font-weight: 600; color: #166534;">
                  💡 Respond within 1 hour to increase your booking rate by 50%!
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

      console.log('Lead notification sent via Resend:', result.id);
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
            .info-row { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0; }
            .label { font-weight: 600; color: #667eea; }
            .value { margin-top: 5px; }
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
                <code style="background: #1e293b; color: #10b981; padding: 8px 16px; border-radius: 5px; display: inline-block; margin-top: 10px; font-family: monospace;">${clientData.clientToken}</code>
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

      console.log('Admin notification sent via Resend:', result.id);
      return { success: true, id: result.id };
    } catch (error) {
      console.error('Error sending admin notification:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ResendService();
