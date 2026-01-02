# Google Sheets Integration Setup

This guide explains how to configure Google Sheets to automatically save client onboarding data.

## Overview

When enabled, every new client signup will automatically:
1. Save all form data to a Google Spreadsheet
2. Send you an email notification with the client details

This is **optional** - the onboarding system works fine without it, but it provides a convenient backup and notification system.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "TechMayne" (or your preferred name)
4. Click "Create"

## Step 2: Enable Google Sheets API

1. In your new project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

## Step 3: Create a Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in the details:
   - Service account name: `techmayne-sheets`
   - Service account ID: (auto-generated)
   - Click "Create and Continue"
4. Skip the optional steps and click "Done"

## Step 4: Generate Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON" format
5. Click "Create"
6. A JSON file will download - **keep this safe!**

## Step 5: Create Your Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new blank spreadsheet
3. Name it "TechMayne Client Onboarding" (or your preferred name)
4. Copy the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
5. Click "Share" in the top-right corner
6. Paste the service account email (from the JSON file - it looks like `techmayne-sheets@project-id.iam.gserviceaccount.com`)
7. Give it "Editor" access
8. Click "Share"

## Step 6: Set Up the Spreadsheet

Run this once to create the header row:

```javascript
// In your backend/services/sheetsService.js
const sheetsService = require('./services/sheetsService');
sheetsService.createHeaderRow();
```

Or manually add these column headers to row 1:
- A: Timestamp
- B: Business Name
- C: Website URL
- D: Email
- E: Phone
- F: Booking Link
- G: Service Area
- H: Starting Price
- I: Gallery Timeline
- J: Accent Color
- K: Custom FAQs
- L: Installation Details
- M: Needs Installation
- N: Client Token

## Step 7: Configure Environment Variables

1. Open the downloaded JSON key file
2. Copy its **entire contents** (make sure it's on a single line, no line breaks)
3. Add to your `.env` file:

```bash
# Google Sheets Configuration
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"your-project-id",...}
GOOGLE_SHEETS_ID=your_spreadsheet_id_from_step_5
GOOGLE_SHEET_NAME=Client Onboarding
```

**Important**: The credentials must be on a single line with no line breaks!

### How to Convert JSON to Single Line

If your JSON has line breaks, use this command:

```bash
# macOS/Linux
cat path/to/downloaded-key.json | tr -d '\n'

# Or use an online tool like: https://tools.knowledgewalls.com/jsontoonelinetext
```

## Step 8: Test the Integration

1. Restart your backend server:
   ```bash
   npm start
   ```

2. Fill out the onboarding form
3. Check your Google Sheet - you should see a new row with the client data
4. Check your email - you should receive a notification

## Troubleshooting

### "Google Sheets not configured" warning

This is normal if you haven't set up the environment variables yet. The system will continue to work, just without spreadsheet integration.

### "Error initializing Google Sheets"

- Check that `GOOGLE_SHEETS_CREDENTIALS` is valid JSON
- Make sure there are no line breaks in the credentials string
- Verify the service account email has "Editor" access to the spreadsheet

### "Error appending to Google Sheets"

- Verify the spreadsheet ID is correct
- Make sure the sheet tab is named correctly (default: "Client Onboarding")
- Check that the service account has Editor permissions

### Email not received

- Check your spam folder
- Verify `ADMIN_EMAIL` is set in `.env`
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are configured
- Check server logs for email errors

## Security Notes

1. **Never commit the JSON key file to git** - it's already in `.gitignore`
2. The service account only has access to spreadsheets you explicitly share with it
3. Store the `.env` file securely - it contains sensitive credentials
4. Consider using a password manager to store the JSON key

## Cost

- Google Sheets API is **free** for up to 500 requests per 100 seconds
- At scale, this should cost you nothing
- The free tier is more than sufficient for this use case

## Optional: Multiple Spreadsheets

If you want separate spreadsheets for different purposes:

1. Create multiple sheet tabs in one spreadsheet, OR
2. Use different `GOOGLE_SHEET_NAME` values for different environments
3. Update `sheetsService.js` to use environment-specific sheet names

## Next Steps

Once configured, your client signups will automatically:
1. ✅ Save to Supabase database (always happens)
2. ✅ Save to Google Sheets (if configured)
3. ✅ Send email notification (if configured)

All three are independent - if Google Sheets fails, the database and email will still work!
