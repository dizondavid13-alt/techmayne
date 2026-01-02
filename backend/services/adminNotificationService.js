const nodemailer = require('nodemailer');

/**
 * Admin Notification Service
 * Sends email notifications to admin when new clients sign up
 */

class AdminNotificationService {
  constructor() {
    this.transporter = null;
    this.adminEmail = process.env.ADMIN_EMAIL;
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    if (this.transporter) return this.transporter;

    try {
      // For production, use a service like Resend, SendGrid, or Gmail
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      return this.transporter;
    } catch (error) {
      console.error('Error initializing email transporter:', error.message);
      return null;
    }
  }

  /**
   * Send notification email when new client signs up
   */
  async sendNewClientNotification(clientData) {
    try {
      // Check if admin email is configured
      if (!this.adminEmail) {
        console.warn('Admin email not configured. Skipping notification.');
        return { success: false, error: 'Admin email not configured' };
      }

      const transporter = this.initializeTransporter();
      if (!transporter) {
        console.warn('Email transporter not initialized. Skipping notification.');
        return { success: false, error: 'Email not configured' };
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
                <div class="value">${clientData.businessName}</div>
              </div>

              <div class="info-row">
                <div class="label">Website URL</div>
                <div class="value"><a href="${clientData.websiteUrl}">${clientData.websiteUrl}</a></div>
              </div>

              <div class="info-row">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${clientData.notificationEmail}">${clientData.notificationEmail}</a></div>
              </div>

              <div class="info-row">
                <div class="label">Phone</div>
                <div class="value">${clientData.phoneNumber || 'Not provided'}</div>
              </div>

              <h2 class="section-title">🎨 Chatbot Customization</h2>

              <div class="info-row">
                <div class="label">Booking Link</div>
                <div class="value">${clientData.bookingLink ? `<a href="${clientData.bookingLink}">${clientData.bookingLink}</a>` : 'Not provided'}</div>
              </div>

              <div class="info-row">
                <div class="label">Service Area</div>
                <div class="value">${clientData.serviceArea || 'Not provided'}</div>
              </div>

              <div class="info-row">
                <div class="label">Starting Price</div>
                <div class="value">${clientData.startingPrice || 'Not provided'}</div>
              </div>

              <div class="info-row">
                <div class="label">Gallery Timeline</div>
                <div class="value">${clientData.galleryTimeline || 'Not provided'}</div>
              </div>

              <div class="info-row">
                <div class="label">Accent Color</div>
                <div class="value">
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
      const info = await transporter.sendMail({
        from: `"TechMayne System" <${process.env.EMAIL_USER}>`,
        to: this.adminEmail,
        subject: `🎉 New Client Signup: ${clientData.businessName}`,
        html: emailHtml
      });

      console.log('Admin notification sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending admin notification:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new AdminNotificationService();
