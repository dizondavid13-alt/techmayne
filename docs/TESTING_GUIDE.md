# Testing Your TechMayne Chatbot

## Quick Test - Using Existing Demo

The easiest way to test is to use the existing `test-widget.html` file:

1. **Make sure your backend is running:**
   ```bash
   cd backend
   npm start
   ```

2. **Open test-widget.html in your browser:**
   ```bash
   open /Users/djdizon/Projects/techmayne/test-widget.html
   ```

3. **You'll see the chat button in the bottom-right corner**

## Testing a Newly Created Client

When you create a new client via `onboarding-page-v2.html`, you'll receive a **client token**. Here's how to test that specific client's chatbot:

### Option 1: Update the Demo File

1. **Copy the client token** from the onboarding success message

2. **Edit test-widget.html:**
   ```html
   <!-- Find this line near the bottom: -->
   <script
     src="http://localhost:3000/widget/widget.js"
     data-client-token="YOUR_CLIENT_TOKEN_HERE">
   </script>

   <!-- Replace YOUR_CLIENT_TOKEN_HERE with the actual token -->
   ```

3. **Refresh the page** in your browser

### Option 2: Create a Quick Test File

Create a new file `test-new-client.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test My Chatbot</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .content {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    h1 { color: #667eea; }
  </style>
</head>
<body>
  <div class="content">
    <h1>Welcome to My Photography Studio</h1>
    <p>This is a test page to see my chatbot in action!</p>
    <p>Click the chat button in the bottom-right corner to start a conversation.</p>

    <h2>What to Test:</h2>
    <ul>
      <li>✅ Check if the chatbot appears</li>
      <li>✅ Test the main menu options</li>
      <li>✅ Try asking FAQ questions with keywords</li>
      <li>✅ Test custom FAQs you added</li>
      <li>✅ Complete a full conversation flow</li>
    </ul>
  </div>

  <!-- Replace PASTE_YOUR_CLIENT_TOKEN_HERE with your actual client token -->
  <script
    src="http://localhost:3000/widget/widget.js"
    data-client-token="PASTE_YOUR_CLIENT_TOKEN_HERE">
  </script>
</body>
</html>
```

**Replace `PASTE_YOUR_CLIENT_TOKEN_HERE` with your client token and open in browser!**

## Testing Custom FAQs

Custom FAQs work automatically! Here's how to verify:

### 1. **Add Custom FAQ During Onboarding**

When filling out `onboarding-page-v2.html`:

- Click "Add Custom FAQ"
- **Question:** "Do you offer engagement sessions?"
- **Answer:** "Yes! All wedding packages include a complimentary engagement session."
- **Keywords:** "engagement, session, couples, pre-wedding"

### 2. **Test in the Chatbot**

1. Open your test page
2. Click the chat button
3. Select "Ask a Question"
4. Type: **"Do you do engagement sessions?"**
5. The bot should match the keyword "engagement" and show your custom answer!

### 3. **Try Different Keyword Variations**

The FAQ matcher looks for keywords anywhere in the question:
- "couples session" → matches "couples"
- "pre wedding shoot" → matches "pre-wedding"
- "engagement photos" → matches "engagement"

## What Gets Customized Per Client?

When you create a new client, these things are automatically configured:

### ✅ Default FAQs (Always Included)

Every client gets these 4 default FAQs:

1. **Travel fees** - Keywords: travel, destination, out of town
2. **Gallery timeline** - Keywords: timeline, when, receive, gallery
3. **What's included** - Keywords: included, package, deliverables
4. **Booking process** - Keywords: book, reserve, availability

### ✅ Custom FAQs (Client-Added)

Any FAQs the client added during onboarding are automatically available in the chatbot.

### ✅ Business Info

The chatbot uses the client's actual information:
- Business name in welcome message
- Booking link (if provided)
- Service area in conversations
- Starting price when asked about packages
- Gallery timeline when asked

### ✅ Brand Colors

The chatbot button and header use the accent color the client chose.

## Complete Test Flow

Here's a full test scenario to verify everything works:

### Test 1: Check Availability Flow

1. **Start chat** → "Hi! I'm TechMayne, your photography assistant..."
2. **Select** "Check Availability"
3. **Select event type** (e.g., "Wedding")
4. **Enter date** (e.g., "June 15, 2024")
5. **Enter location** (e.g., "San Francisco")
6. **Select coverage** (e.g., "Full Day (8-10 hours)")
7. **Enter name** (e.g., "Sarah Johnson")
8. **Enter email** (e.g., "sarah@email.com")
9. **Enter phone** (e.g., "415-555-0123")
10. **Verify** → "Thanks for reaching out, Sarah! I've sent your inquiry..."

**Check backend logs** - you should see:
```
Lead created: [UUID]
```

### Test 2: Custom FAQ

1. **Start chat**
2. **Select** "Ask a Question"
3. **Type** a question with keywords from your custom FAQ
4. **Verify** the bot shows your custom answer
5. **Select** "Yes, thanks!" or "I'm all set!"

### Test 3: Contact Reuse

1. **Complete Test 1** (provide contact info)
2. **Select** "Ask a Question"
3. **Ask another question**
4. **When asked for contact** → Bot should offer to reuse your previous info!
5. **Select** "Use Previous Info"
6. **Verify** → Lead created without asking for contact again

### Test 4: Re-engagement

1. **Complete a conversation** until you see the goodbye message
2. **Type another message** in the input
3. **Verify** → Bot says "Welcome back!" and returns to main menu

## Verify Data in Database

After testing, check that data was saved:

### View Leads in Supabase

1. Go to your Supabase dashboard
2. Navigate to Table Editor → `leads`
3. You should see your test lead with all the data you entered

### View Conversations

```sql
SELECT
  c.visitor_id,
  c.current_state,
  c.created_at,
  COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
GROUP BY c.id
ORDER BY c.created_at DESC;
```

### View All Custom FAQs

```sql
SELECT
  cl.business_name,
  f.question,
  f.answer,
  f.keywords,
  f.is_custom
FROM faq_entries f
JOIN clients cl ON f.client_id = cl.id
WHERE f.is_custom = true
ORDER BY cl.business_name, f.created_at;
```

## Troubleshooting Tests

### Chatbot doesn't appear
- **Check browser console** (F12) for errors
- Verify client token is correct
- Ensure backend is running on http://localhost:3000
- Try hard refresh (Cmd+Shift+R)

### Custom FAQ not matching
- **Check keywords** - make sure your question includes at least one keyword
- Keywords are case-insensitive
- Check Supabase to verify FAQ was created:
  ```sql
  SELECT * FROM faq_entries WHERE client_id = 'YOUR_CLIENT_ID';
  ```

### Bot not responding
- **Open browser console** (F12) → Network tab
- Look for failed API calls to `/api/chat/message`
- Check backend logs for errors
- Verify Supabase connection is working

### Lead not saving
- **Check backend logs** for errors
- Verify RLS policies are enabled (they should be)
- Check Supabase Table Editor → `leads` table

## Testing Email Notifications

If you've configured email:

### Test Lead Notification (to Client)

1. Complete a full conversation flow
2. Client should receive email with:
   - Visitor's contact info
   - Event details (type, date, location, coverage)
   - Full conversation transcript

### Test Admin Notification (to You)

1. Complete the onboarding form
2. You should receive email with:
   - All client information
   - Custom FAQs they added
   - Installation service details (if requested)

## Testing on Different Devices

Once working locally, test responsiveness:

1. **Desktop browser** - Verify chat button positioning
2. **Mobile phone** - Test on actual device using ngrok or similar
3. **Tablet** - Verify responsive layout

## Next Steps After Testing

Once everything works:

1. ✅ Verified chatbot appears and responds
2. ✅ Tested all conversation flows
3. ✅ Confirmed custom FAQs work
4. ✅ Checked data saves to database
5. ✅ Verified contact info reuse
6. ✅ Tested re-engagement

**You're ready for production!**

See `COMPLETE_WORKFLOW.md` for deployment steps.
