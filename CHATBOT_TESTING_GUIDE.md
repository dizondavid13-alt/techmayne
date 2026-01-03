# TechMayne Chatbot - Complete Testing Guide

## 🎯 Overview
This guide covers all chatbot features and testing scenarios to ensure everything works correctly.

---

## ✅ Core Features Checklist

### 1. **Welcome & Main Menu**
- [ ] Bot sends welcome message on `__START__`
- [ ] Displays 3 main buttons: Check Availability, View Packages & Pricing, Ask a Question
- [ ] Each button navigates to correct flow

### 2. **Check Availability Flow**

#### Event Type Selection
- [ ] Displays event type buttons: Wedding, Engagement, Elopement, Portrait, Corporate, Family, Maternity, Other Event
- [ ] Each button correctly stores event type
- [ ] "Other Event" asks for specific event type before continuing
- [ ] User cannot skip by typing (gets reminder to click button)

#### Event Date Collection
- [ ] Bot asks "When is your [event_type]?"
- [ ] Accepts free text input
- [ ] Stores date correctly

#### Location Collection
- [ ] Bot asks "Where will your event take place?"
- [ ] Accepts free text input
- [ ] Stores location correctly

#### Coverage Selection
- [ ] Displays coverage buttons: 4-6 hours, 6-8 hours, 8-10 hours, Full day (10+ hours), Not sure yet
- [ ] Each button correctly stores coverage preference
- [ ] User cannot skip by typing (gets reminder to click button)

#### Contact Information Collection
- [ ] **First time**: Asks for name, email, phone
- [ ] **Returning visitor**: Offers to reuse previous contact info
  - [ ] "Use Previous Info" button works
  - [ ] "Enter New Info" button clears old data and asks for new

- [ ] Name: Accepts free text
- [ ] Email: Uses email input type
- [ ] Phone: Allows skipping with "Skip" button
- [ ] Phone: Accepts tel input format

#### Lead Creation
- [ ] Lead is saved to database with all collected data
- [ ] Email notification is sent to photographer
- [ ] Booking link is shown if client has one configured
- [ ] Bot offers next options: Ask Another Question, I'm all set!

### 3. **View Packages & Pricing Flow**
- [ ] Shows starting price (if client configured it)
- [ ] Shows gallery delivery timeline
- [ ] Shows service area
- [ ] Offers buttons: Check My Date, Ask a Question
- [ ] Returns to main menu correctly

### 4. **Ask a Question (FAQ) Flow**

####FAQ Matching**
- [ ] Bot asks "What would you like to know?"
- [ ] Switches to text input
- [ ] Matches question against FAQ keywords
- [ ] Returns correct FAQ answer if keyword match found
- [ ] Asks "Did that answer your question?" after FAQ

#### FAQ Keywords Tested
Test these common photography questions:
- [ ] "When will I get my photos?" → Matches "gallery", "timeline", "delivery"
- [ ] "What's your pricing?" → Matches "price", "cost", "package"
- [ ] "Do you travel?" → Matches "travel", "destination", "location"
- [ ] "What's included?" → Matches "include", "package", "coverage"
- [ ] "Do you do engagement photos?" → Matches "engagement", "session"
- [ ] "Can I see your portfolio?" → Matches "portfolio", "work", "examples"
- [ ] "What's your style?" → Matches "style", "approach", "aesthetic"
- [ ] "Do you have insurance?" → Matches "insurance", "liability"
- [ ] "Can I get raw files?" → Matches "raw", "unedited"
- [ ] "How do I book?" → Matches "book", "reserve", "schedule"

#### Out-of-Scope Questions
- [ ] Question not in FAQ triggers lead collection
- [ ] If contact info already exists: Creates lead with question, confirms it's forwarded
- [ ] If no contact info: Asks for name/email/phone to forward question
- [ ] Polite message: "That's a great question! I've forwarded it to [business]..."

### 5. **"I'm All Set!" Closure**

Test from different states:
- [ ] From main menu completion → Proper closure
- [ ] After FAQ answered → Proper closure
- [ ] After lead captured → Personalized closure with name
- [ ] After viewing packages → Proper closure
- [ ] Without contact info → Generic closure
- [ ] With contact info → Personalized closure

Expected closure messages:
- **With contact**: "Thanks so much for reaching out, [NAME]! [BUSINESS] is excited to potentially work with you. Keep an eye on your inbox - you'll hear back soon! Have a wonderful day! 📸✨"
- **Without contact**: "Glad I could help! If you'd like to check availability or get in touch with [BUSINESS], feel free to come back anytime. Have a wonderful day! 📸✨"

### 6. **Conversation Restart**
- [ ] After closure, typing new message restarts conversation
- [ ] Shows "Welcome back!" message
- [ ] Displays main menu buttons
- [ ] Previous contact info is remembered (can be reused)

### 7. **Error Handling**

#### Invalid Input Handling
- [ ] Typing when buttons expected → Bot reminds to click buttons
- [ ] Displays buttons again
- [ ] Doesn't break conversation flow

#### Network Errors
- [ ] API timeout → Shows friendly error message
- [ ] Connection failure → Shows retry option
- [ ] Invalid responses handled gracefully

### 8. **Data Persistence**

#### Conversation State
- [ ] Current state saved after each message
- [ ] Collected data saved progressively
- [ ] Visitor can refresh page and continue
- [ ] Visitor ID persisted in sessionStorage

#### Lead Data Captured
Verify database `leads` table contains:
- [ ] client_id
- [ ] conversation_id
- [ ] name
- [ ] email
- [ ] phone (nullable)
- [ ] event_type (nullable)
- [ ] event_date (nullable)
- [ ] location (nullable)
- [ ] coverage_range (nullable)
- [ ] additional_notes (for questions, nullable)
- [ ] created_at timestamp

### 9. **Email Notifications**

#### Lead Notification Email
When lead is captured, photographer receives email with:
- [ ] Subject: "New Lead: [NAME] - [EVENT_TYPE]"
- [ ] From: Configured FROM_EMAIL
- [ ] To: Client's notification_email
- [ ] Email contains:
  - [ ] Lead name
  - [ ] Lead email
  - [ ] Lead phone
  - [ ] Event type
  - [ ] Event date
  - [ ] Location
  - [ ] Coverage hours
  - [ ] Additional notes (if any)
  - [ ] Business name
  - [ ] Professional HTML formatting

#### Test Email Scenarios
- [ ] Lead with all info → Full email sent
- [ ] Lead with question only → Question forwarded in email
- [ ] Lead without phone → Email shows "Not provided"
- [ ] Email fails gracefully (doesn't break chatbot)

### 10. **Client Customization**

#### From Onboarding Page
Verify that client's onboarding input affects their chatbot:
- [ ] business_name → Used in all bot messages
- [ ] notification_email → Receives lead notifications
- [ ] booking_link → Shown after lead capture (if provided)
- [ ] service_area → Shown in packages view
- [ ] starting_price → Shown in packages view
- [ ] gallery_timeline → Shown in packages view
- [ ] accent_color → Widget button color (not demo page)
- [ ] Custom FAQs → Added to default FAQs, searchable by keywords

#### Default FAQs Created
For every new client, these FAQs are created automatically:
- [ ] Gallery delivery timeline
- [ ] Travel policy
- [ ] Booking process
- [ ] What's included in packages
- [ ] Payment terms
- [ ] Rescheduling policy
- [ ] Second photographer availability
- [ ] Engagement sessions

#### Custom FAQs Added
- [ ] Client's custom FAQs from onboarding are saved
- [ ] Keywords are split and stored as array
- [ ] `is_custom: true` flag set
- [ ] Searchable alongside default FAQs

---

## 🧪 Test Scenarios

### Scenario 1: Complete Wedding Inquiry
1. Start conversation → Welcome message
2. Click "Check Availability"
3. Select "Wedding"
4. Enter date: "June 15, 2025"
5. Enter location: "Napa Valley, CA"
6. Select coverage: "8-10 hours"
7. Enter name: "Sarah Johnson"
8. Enter email: "sarah@email.com"
9. Enter phone: "(555) 123-4567"
10. Verify lead created in database
11. Verify email sent to photographer
12. Click "I'm all set!"
13. Verify proper closure with name

**Expected Result**: Full lead captured, email sent, personalized closure.

### Scenario 2: FAQ Then Book
1. Start conversation
2. Click "Ask a Question"
3. Type: "When will I get my photos?"
4. Verify FAQ answer returned
5. Click "Yes, thanks!"
6. Click "Check Availability"
7. Complete booking flow
8. Verify contact info only asked once

**Expected Result**: FAQ answered, seamless transition to booking.

### Scenario 3: Out-of-Scope Question
1. Start conversation
2. Click "Ask a Question"
3. Type: "Do you offer underwater photography?"
4. Verify "I'll forward this to..." message
5. Asked for contact info
6. Complete contact collection
7. Verify lead created with question in additional_notes
8. Verify email contains the question

**Expected Result**: Question forwarded, lead captured.

### Scenario 4: "Other Event" Type
1. Start conversation
2. Click "Check Availability"
3. Select "Other Event"
4. Bot asks: "What type of event?"
5. Type: "Corporate headshots"
6. Bot continues: "When is your corporate headshots?"
7. Complete normal flow

**Expected Result**: Custom event type captured correctly.

### Scenario 5: Returning Visitor
1. Complete one inquiry (name: "John", email: "john@email.com")
2. Click "Ask Another Question"
3. Type a question
4. Start new availability check
5. Reach coverage selection
6. Verify "Use Previous Info" option appears
7. Click "Use Previous Info"
8. Verify lead created with same contact info
9. Try "Enter New Info" → Should ask for fresh contact

**Expected Result**: Previous contact info reused seamlessly.

### Scenario 6: View Packages Only
1. Start conversation
2. Click "View Packages & Pricing"
3. Verify starting price shown
4. Verify gallery timeline shown
5. Verify service area shown
6. Click "Ask a Question"
7. Complete without booking

**Expected Result**: Package info displayed, no lead pressure.

---

## 📊 Database Verification

### Check `conversations` Table
```sql
SELECT * FROM conversations WHERE visitor_id = '[VISITOR_ID]' ORDER BY created_at DESC;
```

Verify:
- [ ] conversation created
- [ ] current_state updated progressively
- [ ] collected_data JSON populated
- [ ] completed = true after lead capture
- [ ] last_message_at timestamp updated

### Check `leads` Table
```sql
SELECT * FROM leads WHERE email = '[TEST_EMAIL]' ORDER BY created_at DESC;
```

Verify:
- [ ] All fields populated correctly
- [ ] client_id matches
- [ ] conversation_id matches
- [ ] Timestamps accurate

### Check `faq_entries` Table
```sql
SELECT * FROM faq_entries WHERE client_id = '[CLIENT_ID]';
```

Verify:
- [ ] Default FAQs created (8-10 entries)
- [ ] Custom FAQs from onboarding added
- [ ] Keywords stored as PostgreSQL array
- [ ] `is_custom` flag set correctly

---

## 🎨 UI/UX Testing (Demo Page)

### Visual Elements
- [ ] Gradient header with shimmer animation
- [ ] PhotoBot AI title with verified badge
- [ ] Pulsing green status dot
- [ ] Bot avatar in messages
- [ ] Message bubbles with correct colors (white for bot, blue gradient for user)
- [ ] Typing indicator with 3 animated dots
- [ ] Quick reply buttons with hover effect (translateX)
- [ ] Send button with gradient and hover lift
- [ ] Stats show "4.5x More Leads" and "99% Accuracy"

### Responsive Design
- [ ] Desktop: 3-column layout (side panels visible)
- [ ] Tablet/Mobile: Single column (side panels hidden)
- [ ] Chat messages wrap correctly
- [ ] Buttons stack vertically on mobile
- [ ] Input field responsive

### Animations
- [ ] Message fade-in animation
- [ ] Typing dot bounce animation
- [ ] Status dot pulse animation
- [ ] Header shimmer effect
- [ ] Button hover translateX
- [ ] Send button hover lift

---

## 🔧 Developer Testing

### API Endpoints
```bash
# Health check
curl https://techmayne-production.up.railway.app/health

# Send message
curl -X POST https://techmayne-production.up.railway.app/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "clientToken": "c8082d26-223f-4eee-af1b-001c197fa3d8",
    "visitorId": "test_visitor_123",
    "message": "__START__"
  }'
```

### Console Logs to Check
- [ ] "Lead created: [LEAD_ID]"
- [ ] "Email notification sent for lead: [LEAD_ID]"
- [ ] No errors in Railway logs
- [ ] No errors in browser console

### Environment Variables
Verify in Railway:
- [ ] SUPABASE_URL
- [ ] SUPABASE_KEY
- [ ] RESEND_API_KEY
- [ ] FROM_EMAIL (should be support@techmayne.com)
- [ ] ADMIN_EMAIL
- [ ] GOOGLE_SHEETS_CREDENTIALS (optional)
- [ ] GOOGLE_SHEETS_ID (optional)

---

## 🚨 Known Limitations & Edge Cases

### Current Limitations
1. **FAQ matching**: Simple keyword matching only (no NLP/AI)
2. **Date validation**: Accepts any text format (no date parsing)
3. **Email validation**: Basic HTML5 validation only
4. **Phone validation**: Accepts any format
5. **Spam protection**: None implemented yet

### Edge Cases to Test
- [ ] Very long message (500+ characters)
- [ ] Special characters in name/location
- [ ] Empty message submission
- [ ] Rapid-fire clicking buttons
- [ ] Browser refresh mid-conversation
- [ ] Multiple tabs open (different visitor IDs)
- [ ] Disable JavaScript → Graceful degradation
- [ ] Slow network → Timeout handling

---

## ✅ Acceptance Criteria

### Must Pass
- ✅ All core features work without errors
- ✅ Leads are captured correctly in database
- ✅ Email notifications are sent successfully
- ✅ "I'm all set!" closure works from all states
- ✅ "Other Event" asks for specific event type
- ✅ Custom FAQs from onboarding are searchable
- ✅ Previous contact info can be reused
- ✅ Out-of-scope questions are forwarded
- ✅ No console errors or warnings

### Nice to Have
- ✅ Smooth animations and transitions
- ✅ Helpful error messages
- ✅ Professional, friendly tone
- ✅ Responsive design works perfectly
- ✅ Fast response times (<2s)

---

## 📝 Reporting Issues

When reporting bugs, include:
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser/device**
5. **Screenshots** (if visual bug)
6. **Console errors** (F12 → Console tab)
7. **Network errors** (F12 → Network tab)

---

## 🎯 Quick Test Script

Run through this in 5 minutes for basic validation:
1. ✅ Load demo page → Welcome message appears
2. ✅ Click "Check Availability" → Event type buttons show
3. ✅ Select "Wedding" → Date question appears
4. ✅ Enter "June 15, 2025" → Location question appears
5. ✅ Enter "San Francisco" → Coverage buttons show
6. ✅ Select "8-10 hours" → Name question appears
7. ✅ Enter test name → Email question appears
8. ✅ Enter test email → Phone question with Skip appears
9. ✅ Click "Skip" → Confirmation message with booking link
10. ✅ Check database → Lead exists
11. ✅ Check email → Notification received
12. ✅ Click "I'm all set!" → Proper closure message
13. ✅ Type new message → Conversation restarts

If all 13 steps pass → Core functionality working! ✅
