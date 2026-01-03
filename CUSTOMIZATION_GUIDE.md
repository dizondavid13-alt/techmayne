# TechMayne Chatbot - Full Customization Guide

## 🎯 Your Questions Answered

### Q1: What if a photographer doesn't offer all 8 event types?
✅ **SOLVED!** The chatbot now dynamically shows only the services each photographer offers.

### Q2: What if their FAQ answers are different (pricing, timeline, style)?
✅ **SOLVED!** Each client can customize FAQ answers through the onboarding page.

### Q3: How does the chatbot get client-specific information?
✅ The chatbot fetches data from your database in real-time for each client.

---

## 🏗️ How It Works Now

### Architecture Flow:

```
Visitor opens chatbot widget
   ↓
Widget sends client_token to Railway API
   ↓
Bot fetches client record from Supabase:
   ├─ business_name → Used in messages
   ├─ services_offered → Dynamic event type buttons  ✨ NEW
   ├─ gallery_timeline → Used in FAQ answers         ✨ NEW
   ├─ starting_price → Shown in packages view
   ├─ service_area → Shown in packages view
   ├─ booking_link → Shown after lead capture
   └─ Custom FAQs → Client's specific Q&As
   ↓
Bot generates personalized responses
```

### What's Dynamic Per Client:

| Feature | How It's Customized | Example |
|---------|-------------------|---------|
| **Business Name** | Set in onboarding | "Sarah's Photography" |
| **Event Types** | Select which services offered | Only shows: Wedding, Portrait, Maternity |
| **Gallery Timeline** | Custom delivery time | "6-8 weeks" or "2 weeks" |
| **Pricing** | Starting price & packages | "$2,500" or "$500" |
| **Service Area** | Geographic coverage | "San Francisco Bay Area" |
| **FAQ Answers** | Custom Q&As | "I shoot film and digital!" |
| **Booking Link** | Client's scheduler | Calendly, Honeybook, etc. |

---

## 🚀 Implementation Steps

### Step 1: Run Database Migration (REQUIRED)

This adds the new customization fields to your database.

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"
5. Copy and paste this SQL:

```sql
-- Add services_offered and gallery_timeline columns
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS services_offered text[] DEFAULT ARRAY['wedding', 'engagement', 'elopement'];

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS gallery_timeline text DEFAULT '4-6 weeks';

-- Update demo client to show all services
UPDATE clients
SET services_offered = ARRAY['wedding', 'engagement', 'elopement', 'portrait', 'corporate', 'family', 'maternity', 'other']
WHERE client_token = 'c8082d26-223f-4eee-af1b-001c197fa3d8';

-- Set gallery timeline for demo client
UPDATE clients
SET gallery_timeline = '4-6 weeks'
WHERE client_token = 'c8082d26-223f-4eee-af1b-001c197fa3d8';
```

6. Click "Run" button
7. You should see: "Success. No rows returned"

**Option B: Via Command Line**

```bash
cd backend
node -e "
const supabase = require('./config/supabase');
(async () => {
  const { error } = await supabase.rpc('exec', {
    sql: \`ALTER TABLE clients ADD COLUMN IF NOT EXISTS services_offered text[] DEFAULT ARRAY['wedding', 'engagement', 'elopement']\`
  });
  console.log(error || 'Success!');
})();
"
```

### Step 2: Run FAQ Migration (OPTIONAL - For Better FAQs)

This updates default FAQs to be more comprehensive.

**Via Supabase SQL Editor:**

1. Open SQL Editor (same as Step 1)
2. Copy and paste the contents of: `/database/migrations/update_default_faqs.sql`
3. Run the query
4. Run this to update your demo client's FAQs:

```sql
SELECT create_default_faqs('8d40e6f1-e429-4919-a637-3fb4c5b7d7c2'::uuid);
```

**Note:** This is optional. New clients will automatically get comprehensive FAQs. Existing clients can keep their current FAQs or be updated manually.

### Step 3: Deploy Backend Changes

```bash
git add .
git commit -m "Add dynamic service selection and client customization"
git push origin main
```

Railway will auto-deploy (takes ~2-3 minutes).

### Step 4: Update Your Onboarding Page (OPTIONAL)

To let clients select which services they offer, add this to your onboarding form:

```html
<!-- Service Selection -->
<div class="form-group">
  <label>Which services do you offer? (Select all that apply)</label>
  <div class="checkbox-group">
    <label><input type="checkbox" name="services" value="wedding" checked> Weddings</label>
    <label><input type="checkbox" name="services" value="engagement"> Engagement Sessions</label>
    <label><input type="checkbox" name="services" value="elopement"> Elopements</label>
    <label><input type="checkbox" name="services" value="portrait"> Portrait Sessions</label>
    <label><input type="checkbox" name="services" value="corporate"> Corporate Events</label>
    <label><input type="checkbox" name="services" value="family"> Family Sessions</label>
    <label><input type="checkbox" name="services" value="maternity"> Maternity</label>
    <label><input type="checkbox" name="services" value="other"> Other</label>
  </div>
</div>

<!-- Gallery Timeline -->
<div class="form-group">
  <label>Gallery Delivery Timeline</label>
  <input type="text" name="galleryTimeline" placeholder="e.g., 4-6 weeks, 2 weeks" value="4-6 weeks">
</div>

<script>
// When submitting the form, collect selected services
const services = Array.from(document.querySelectorAll('input[name="services"]:checked'))
  .map(cb => cb.value);

const formData = {
  // ... other fields
  servicesOffered: services,
  galleryTimeline: document.querySelector('input[name="galleryTimeline"]').value
};
</script>
```

---

## ✅ Verification & Testing

### Test 1: Service Customization

1. Go to Supabase Dashboard → Table Editor → `clients`
2. Find your demo client (token: `c8082d26...`)
3. Edit `services_offered` column
4. Change to: `["wedding", "portrait"]` (only 2 services)
5. Save
6. Open your demo chatbot
7. Click "Check Availability"
8. ✅ Should only show: Wedding, Portrait Session

### Test 2: Gallery Timeline

1. In Supabase, edit `gallery_timeline` to `"2 weeks"`
2. Open chatbot
3. Click "Ask a Question"
4. Type: "When will I get my photos?"
5. ✅ Should see: "...delivered within 2 weeks..."

### Test 3: New Client with Custom Services

1. Create a new test client via onboarding
2. Select only: Wedding, Family, Maternity
3. Set timeline: "3 weeks"
4. Complete onboarding
5. Open their chatbot
6. ✅ Should only show 3 event types
7. ✅ FAQ should say "3 weeks"

---

## 📊 Database Schema Reference

### clients table:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `business_name` | text | - | Used in all messages |
| `services_offered` | text[] | `['wedding','engagement','elopement']` | Event type buttons |
| `gallery_timeline` | text | `'4-6 weeks'` | FAQ answer customization |
| `starting_price` | text | null | Shown in packages view |
| `service_area` | text | null | Shown in packages view |
| `booking_link` | text | null | Shown after lead capture |
| `notification_email` | text | - | Receives lead notifications |

### faq_entries table:

| Column | Type | Purpose |
|--------|------|---------|
| `client_id` | uuid | Links FAQ to specific client |
| `question` | text | FAQ question |
| `answer` | text | FAQ answer (can be customized) |
| `keywords` | text[] | Keywords for matching |
| `is_custom` | boolean | User-added vs. default FAQ |

---

## 🎨 Customization Examples

### Example 1: Portrait-Only Photographer

**Onboarding Input:**
```json
{
  "businessName": "Jane Doe Photography",
  "servicesOffered": ["portrait", "family", "maternity"],
  "galleryTimeline": "1 week",
  "startingPrice": "$300"
}
```

**Chatbot Behavior:**
- Shows only 3 event types: Portrait, Family, Maternity
- "When will I get photos?" → "1 week"
- "What's the price?" → "Starting at $300"

### Example 2: Wedding Specialist

**Onboarding Input:**
```json
{
  "businessName": "Forever Weddings",
  "servicesOffered": ["wedding", "engagement", "elopement"],
  "galleryTimeline": "8 weeks",
  "startingPrice": "$3,500",
  "customFaqs": [
    {
      "question": "Do you shoot film?",
      "answer": "Yes! All our weddings are shot on medium format film.",
      "keywords": "film, medium format, analog"
    }
  ]
}
```

**Chatbot Behavior:**
- Shows only wedding-related services
- "When will I get photos?" → "8 weeks"
- "Do you shoot film?" → Custom answer shown

### Example 3: Full-Service Studio

**Onboarding Input:**
```json
{
  "businessName": "Complete Photo Studio",
  "servicesOffered": ["wedding", "engagement", "portrait", "corporate", "family", "maternity"],
  "galleryTimeline": "4-6 weeks",
  "startingPrice": "$500"
}
```

**Chatbot Behavior:**
- Shows all 6 main event types + "Other"
- Comprehensive service coverage

---

## 🔍 FAQ Keyword Matching

The bot matches visitor questions to FAQs using keywords. Here's how:

### Services Question:
**Visitor asks:** "What services do you offer?"
**Bot matches:** `services`, `types`, `options` keywords
**Bot responds:** Lists all event types from `services_offered`

### Pricing Question:
**Visitor asks:** "How much does it cost?"
**Bot matches:** `pricing`, `cost`, `price` keywords
**Bot responds:** Shows `starting_price` + package info

### Timeline Question:
**Visitor asks:** "When will I get my photos?"
**Bot matches:** `gallery`, `timeline`, `delivery` keywords
**Bot responds:** Shows `gallery_timeline` from database

---

## 🚨 Important Notes

1. **Backward Compatible**: Existing clients without `services_offered` will default to: Wedding, Engagement, Elopement

2. **FAQ Customization**: Clients can add unlimited custom FAQs via onboarding. These are added to default FAQs, not replacing them.

3. **"Other Event" Always Available**: Even if you don't include "other" in `services_offered`, visitors can still ask custom questions - they just won't see it as a button.

4. **Real-Time Updates**: Changes to the database take effect immediately. No need to redeploy.

5. **Per-Client Isolation**: Each client's chatbot is completely independent. Changing one client's settings doesn't affect others.

---

## 📝 Summary

**Before This Update:**
- ❌ All photographers saw the same 8 event types
- ❌ FAQ answers were generic for everyone
- ❌ No way to customize service offerings

**After This Update:**
- ✅ Each photographer selects which services they offer
- ✅ Event type buttons are dynamically generated
- ✅ FAQ answers can be customized per client
- ✅ Gallery timeline, pricing, service area all client-specific
- ✅ 100% accurate information for each photographer

**What You Need to Do:**
1. ✅ Run database migration (5 minutes)
2. ✅ Optional: Run FAQ migration for better defaults
3. ✅ Optional: Add service selection to onboarding form
4. ✅ Test with demo client

Everything is ready to deploy!
