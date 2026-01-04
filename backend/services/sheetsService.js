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

      // Format services offered
      const servicesOffered = clientData.servicesOffered && clientData.servicesOffered.length > 0
        ? clientData.servicesOffered.join(', ')
        : 'Not specified';

      // Prepare row data with separate columns for installation fields
      const values = [[
        new Date().toISOString(), // A: Timestamp
        clientData.businessName, // B: Business Name
        clientData.chatbotName || 'Not provided', // C: Chatbot Name
        clientData.websiteUrl, // D: Website URL
        clientData.notificationEmail, // E: Notification Email
        clientData.phoneNumber || 'Not provided', // F: Phone Number
        clientData.bookingLink || 'Not provided', // G: Booking Link
        clientData.serviceArea || 'Not provided', // H: Service Area
        clientData.startingPrice || 'Not provided', // I: Starting Price
        clientData.galleryTimeline || 'Not provided', // J: Gallery Timeline
        servicesOffered, // K: Services Offered
        clientData.accentColor, // L: Accent Color
        customFaqs, // M: Custom FAQs
        clientData.installation && clientData.installation.needsInstallation ? 'YES' : 'NO', // N: Needs Installation
        clientData.installation && clientData.installation.platform ? clientData.installation.platform : 'Not provided', // O: Platform
        clientData.installation && clientData.installation.username ? clientData.installation.username : 'Not provided', // P: Website Username
        clientData.installation && clientData.installation.password ? clientData.installation.password : 'Not provided', // Q: Website Password
        clientData.installation && clientData.installation.twoFactorStatus ? clientData.installation.twoFactorStatus : 'Not provided', // R: 2FA Status
        clientData.installation && clientData.installation.instructions ? clientData.installation.instructions : 'Not provided', // S: Special Instructions
        clientData.clientToken, // T: Client Token
        clientData.embedCode || 'Not provided' // U: Embed Script
      ]];

      // Append to sheet
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:U`, // Columns A through U (21 columns)
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
        'Chatbot Name',
        'Website URL',
        'Notification Email',
        'Phone Number',
        'Booking Link',
        'Service Area',
        'Starting Price',
        'Gallery Timeline',
        'Services Offered',
        'Accent Color',
        'Custom FAQs',
        'Needs Installation',
        'Platform',
        'Website Username',
        'Website Password',
        '2FA Status',
        'Special Instructions',
        'Client Token',
        'Embed Script'
      ]];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A1:U1`,
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
