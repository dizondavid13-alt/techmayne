# Supabase Migration Verification Guide

## 🔍 How to Verify Your Migration Was Successful

### Quick Check (30 seconds)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "Table Editor" (left sidebar)
4. Click "clients" table
5. Look at the column headers at the top

### ✅ What You Should See

Your `clients` table should have these columns:

**Existing Columns:**
- `id` (uuid)
- `client_token` (text)
- `business_name` (text)
- `website_url` (text)
- `notification_email` (text)
- `phone_number` (text)
- `booking_link` (text)
- `service_area` (text)
- `starting_price` (text)
- `accent_color` (text)
- `created_at` (timestamp)

**NEW Columns (Added by Migration):**
- ✨ `services_offered` (text[]) - array
- ✨ `gallery_timeline` (text)
- ✨ `chatbot_name` (text)

### How to Check Demo Client Data

1. In Table Editor, find the row where `client_token` = `c8082d26-223f-4eee-af1b-001c197fa3d8`
2. Click on that row to view details

**Expected Values:**
```
services_offered: ["wedding","engagement","elopement","portrait","corporate","family","maternity","other"]
gallery_timeline: "4-6 weeks"
chatbot_name: "PhotoBot AI"
```

---

## 🧪 Alternative Verification (Using SQL)

If you want to double-check using SQL:

1. Go to SQL Editor
2. Run this query:

```sql
SELECT
  business_name,
  chatbot_name,
  services_offered,
  gallery_timeline,
  starting_price
FROM clients
WHERE client_token = 'c8082d26-223f-4eee-af1b-001c197fa3d8';
```

**Expected Result:**
```
business_name    | chatbot_name | services_offered                          | gallery_timeline | starting_price
-----------------|--------------|-------------------------------------------|------------------|---------------
[Your Business]  | PhotoBot AI  | {wedding,engagement,elopement,portrait... | 4-6 weeks        | [Your Price]
```

---

## ✅ Success Indicators

### ✓ Migration Successful If:
1. All 3 new columns exist in `clients` table
2. Demo client has `services_offered` populated
3. Demo client has `gallery_timeline` = "4-6 weeks"
4. Demo client has `chatbot_name` = "PhotoBot AI"

### ⚠️ Migration Failed If:
1. Columns don't exist (error: "column does not exist")
2. Demo client data is empty/null
3. SQL query returns error

---

## 🔧 If Migration Failed

### Run This Query Again:

```sql
-- Add the columns
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS services_offered text[] DEFAULT ARRAY['wedding', 'engagement', 'elopement'];

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS gallery_timeline text DEFAULT '4-6 weeks';

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS chatbot_name text DEFAULT 'PhotoBot AI';

-- Update demo client
UPDATE clients
SET services_offered = ARRAY['wedding', 'engagement', 'elopement', 'portrait', 'corporate', 'family', 'maternity', 'other'],
    gallery_timeline = '4-6 weeks',
    chatbot_name = 'PhotoBot AI'
WHERE client_token = 'c8082d26-223f-4eee-af1b-001c197fa3d8';
```

### Verify Again:
```sql
SELECT * FROM clients WHERE client_token = 'c8082d26-223f-4eee-af1b-001c197fa3d8';
```

---

## 🎯 Testing the New Features

### Test 1: Service Customization

1. In Table Editor, click your demo client row
2. Click the `services_offered` cell
3. Edit to: `["wedding", "portrait"]` (only 2 services)
4. Save
5. Open your chatbot demo
6. Click "Check Availability"
7. **✅ Should only show Wedding & Portrait Session buttons**

### Test 2: Gallery Timeline

1. Edit demo client `gallery_timeline` to `"2 weeks"`
2. Save
3. Open chatbot
4. Click "Ask a Question"
5. Type: "When will I get my photos?"
6. **✅ Bot should say "2 weeks"**

### Test 3: Chatbot Name

1. Edit demo client `chatbot_name` to `"Test Bot"`
2. Save
3. Open chatbot
4. **✅ Should see "Test Bot" in header/welcome message**

---

## 📊 What Each Column Does

### `services_offered` (text[] array)
**Purpose**: Controls which event type buttons show in chatbot

**Format**: PostgreSQL array
```
ARRAY['wedding', 'engagement', 'portrait']
```

**How It Works**:
- Chatbot calls `getEventTypeButtons(client.services_offered)`
- Only creates buttons for services in the array
- If array = `['wedding']`, only "Wedding" button shows

**Default**: `['wedding', 'engagement', 'elopement']`

### `gallery_timeline` (text)
**Purpose**: Personalize "When will I get my photos?" FAQ answer

**Format**: Plain text
```
"2 weeks"
"4-6 weeks"
"Within 1 month"
```

**How It Works**:
- FAQ matcher finds "timeline" keywords
- Bot responds: "...delivered within [gallery_timeline]..."
- `handlePackagesView()` also shows this value

**Default**: `"4-6 weeks"`

### `chatbot_name` (text)
**Purpose**: Custom name for the chatbot

**Format**: Plain text
```
"PhotoBot AI"
"Sarah's Assistant"
"BookingBot"
```

**How It Works**:
- Used in welcome message (future enhancement)
- Displayed in chat header
- Personalizes the bot identity

**Default**: `"PhotoBot AI"`

---

## 🚀 Next Steps After Verification

### If Migration Successful ✅

1. **Upload Onboarding Page**
   - WordPress → Pages → Add New
   - Paste `onboarding-wordpress-v3.html`
   - Publish

2. **Upload Demo Page**
   - WordPress → Pages → Add New
   - Paste `chatbot-demo-wordpress-v2.html`
   - Publish

3. **Test Full Flow**
   - Fill out onboarding form
   - Select custom services (e.g., only Wedding + Portrait)
   - Set custom timeline (e.g., "2 weeks")
   - Name chatbot "My Test Bot"
   - Complete onboarding
   - Open generated chatbot
   - Verify it shows ONLY selected services

### If Migration Failed ❌

1. Re-run the SQL queries above
2. Check for error messages
3. Verify you're logged into correct Supabase project
4. Check if columns exist but are null
5. Try manual column creation one at a time

---

## 🎉 Confirmation Checklist

Once verified, you should have:

- [x] `services_offered` column exists
- [x] `gallery_timeline` column exists
- [x] `chatbot_name` column exists
- [x] Demo client has all 8 services in array
- [x] Demo client timeline = "4-6 weeks"
- [x] Demo client chatbot_name = "PhotoBot AI"
- [x] No SQL errors when querying
- [x] Can edit values successfully
- [x] Chatbot reflects changes in real-time

**All checked?** You're all set! ✨
