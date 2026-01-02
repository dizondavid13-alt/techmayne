# Google Sheets Setup Guide for TechMayne

This guide will help you set up Google Sheets integration to automatically save client onboarding data.

## Step 1: Create Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one:
   - Click "Select a Project" at the top
   - Click "NEW PROJECT"
   - Name it "TechMayne" (or any name)
   - Click "CREATE"

3. Enable Google Sheets API:
   - In the search bar, type "Google Sheets API"
   - Click on "Google Sheets API"
   - Click "ENABLE"

4. Create Service Account:
   - In the left sidebar, go to "IAM & Admin" → "Service Accounts"
   - Click "+ CREATE SERVICE ACCOUNT"
   - Enter details:
     - Service account name: `techmayne-sheets`
     - Service account ID: (auto-generated)
     - Description: "Service account for TechMayne onboarding data"
   - Click "CREATE AND CONTINUE"
   - Skip the optional steps (click "CONTINUE" then "DONE")

5. Create JSON Key:
   - Find your new service account in the list
   - Click the three dots (⋮) on the right
   - Select "Manage keys"
   - Click "ADD KEY" → "Create new key"
   - Select "JSON" format
   - Click "CREATE"
   - **IMPORTANT**: A JSON file will download automatically - save this file securely!

## Step 2: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "TechMayne Client Onboarding"
4. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
   The ID is the long string between `/d/` and `/edit`

5. Share with Service Account:
   - Open the JSON key file you downloaded
   - Find the `client_email` field (looks like: `techmayne-sheets@project-name.iam.gserviceaccount.com`)
   - In your Google Sheet, click "Share" button
   - Paste the service account email
   - Give it "Editor" permission
   - **Uncheck** "Notify people"
   - Click "Share"

## Step 3: Add Environment Variables to Railway

1. Open the JSON key file you downloaded
2. Copy the ENTIRE contents of the file (it's one long JSON object)
3. Go to your Railway project
4. Click on your service → "Variables" tab
5. Click "RAW EDITOR"
6. Add these three variables (make sure there are NO leading spaces):

```bash
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"..."}
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SHEET_NAME=Client Onboarding
```

**IMPORTANT**:
- For `GOOGLE_SHEETS_CREDENTIALS`, paste the ENTIRE JSON content on ONE line
- For `GOOGLE_SHEETS_ID`, paste just the spreadsheet ID (not the full URL)
- Make sure there are NO spaces before the variable names

6. Click "Save"
7. Railway will automatically redeploy with new variables

## Step 4: Test the Integration

1. Open the enterprise onboarding page in your browser
2. Fill out the form completely
3. Submit the form
4. Check your Google Sheet - you should see a new row with the client data
5. Check your email (support@techmayne.com) - you should receive an admin notification

## Expected Google Sheet Format

Your sheet will have these columns:
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

## Troubleshooting

**If data doesn't appear in Google Sheets:**
1. Check Railway logs for any Google Sheets errors
2. Verify the service account email has Editor access to the spreadsheet
3. Make sure GOOGLE_SHEETS_CREDENTIALS is valid JSON (no line breaks in Railway)
4. Verify GOOGLE_SHEETS_ID matches your spreadsheet

**If you get "credentials not configured" errors:**
- Make sure the JSON credentials are on ONE line in Railway
- Check there are no extra spaces before/after the variable value

## Security Notes

- Never commit the JSON key file to GitHub
- The JSON key is already in Railway environment variables (secure)
- Only share the spreadsheet with the service account email (not publicly)
