const { google } = require('googleapis');

/**
 * Google Sheets Service
 * Handles saving client onboarding data to Google Sheets
 */

class SheetsService {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    this.sheetName = process.env.GOOGLE_SHEET_NAME || 'Client Onboarding';
  }

  /**
   * Initialize Google Sheets API client
   */
  async initialize() {
    try {
      // Check if Google Sheets is configured
      if (!process.env.GOOGLE_SHEETS_CREDENTIALS || !this.spreadsheetId) {
        console.warn('Google Sheets not configured. Skipping spreadsheet save.');
        return false;
      }

      // Parse credentials from environment variable
      const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);

      // Create JWT auth client
      const auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
      );

      // Initialize Sheets API
      this.sheets = google.sheets({ version: 'v4', auth });
      return true;
    } catch (error) {
      console.error('Error initializing Google Sheets:', error.message);
      return false;
    }
  }

  /**
   * Append client data to Google Sheets
   */
  async appendClientData(clientData) {
    try {
      // Initialize if not already done
      if (!this.sheets) {
        const initialized = await this.initialize();
        if (!initialized) {
          console.warn('Google Sheets not initialized. Skipping spreadsheet save.');
          return { success: false, error: 'Not configured' };
        }
      }

      // Format custom FAQs as readable text
      const customFaqs = clientData.customFaqs && clientData.customFaqs.length > 0
        ? clientData.customFaqs.map((faq, i) =>
            `Q${i+1}: ${faq.question} | A: ${faq.answer} | Keywords: ${faq.keywords || 'none'}`
          ).join('\n')
        : 'None';

      // Format installation info
      const installationInfo = clientData.installation
        ? `Platform: ${clientData.installation.platform} | 2FA: ${clientData.installation.twoFactorStatus} | Instructions: ${clientData.installation.instructions || 'None'}`
        : 'DIY Installation';

      // Prepare row data
      const values = [[
        new Date().toISOString(), // Timestamp
        clientData.businessName,
        clientData.websiteUrl,
        clientData.notificationEmail,
        clientData.phoneNumber || 'Not provided',
        clientData.bookingLink || 'Not provided',
        clientData.serviceArea || 'Not provided',
        clientData.startingPrice || 'Not provided',
        clientData.galleryTimeline || 'Not provided',
        clientData.accentColor,
        customFaqs,
        installationInfo,
        clientData.installation ? 'YES' : 'NO',
        clientData.clientToken
      ]];

      // Append to sheet
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:N`, // Columns A through N
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });

      console.log('Client data saved to Google Sheets:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error appending to Google Sheets:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create header row if sheet is empty (one-time setup)
   */
  async createHeaderRow() {
    try {
      if (!this.sheets) {
        const initialized = await this.initialize();
        if (!initialized) return;
      }

      const headers = [[
        'Timestamp',
        'Business Name',
        'Website URL',
        'Email',
        'Phone',
        'Booking Link',
        'Service Area',
        'Starting Price',
        'Gallery Timeline',
        'Accent Color',
        'Custom FAQs',
        'Installation Details',
        'Needs Installation',
        'Client Token'
      ]];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A1:N1`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: headers }
      });

      console.log('Header row created successfully');
    } catch (error) {
      console.error('Error creating header row:', error.message);
    }
  }
}

module.exports = new SheetsService();
