# WordPress Integration Guide - TechMayne Onboarding Page

## Quick Start (Easiest Method)

### Method 1: Using WordPress Block Editor (Gutenberg)

1. **Log in to WordPress Admin**
   - Go to `https://techmayne.com/wp-admin`

2. **Create New Page**
   - Click "Pages" → "Add New"
   - Title: "Client Onboarding" (or whatever you prefer)

3. **Add HTML Block**
   - Click the `+` button to add a block
   - Search for "HTML" or "Custom HTML"
   - Select the "Custom HTML" block

4. **Paste the Code**
   - Open `/Users/djdizon/Projects/techmayne/onboarding-wordpress.html`
   - Copy ALL the contents
   - Paste into the HTML block

5. **Publish**
   - Click "Publish" button (top right)
   - Your page will be live at `https://techmayne.com/client-onboarding`

6. **Optional: Set Full Width**
   - In the right sidebar, under "Template", select "Full Width" or "No Sidebar"
   - This removes the sidebar for a cleaner look

---

## Method 2: Using Classic Editor

1. **Create New Page**
   - Pages → Add New

2. **Switch to Text/Code Editor**
   - Look for "Text" tab (next to "Visual" tab)
   - Click it to switch to HTML mode

3. **Paste the Code**
   - Copy all content from `onboarding-wordpress.html`
   - Paste into the editor

4. **Publish**

---

## Method 3: Using Page Builders (Elementor, Divi, etc.)

### For Elementor:
1. Create new page with Elementor
2. Drag an **HTML widget** onto the page
3. Paste the code from `onboarding-wordpress.html`
4. Publish

### For Divi:
1. Create new page with Divi Builder
2. Add a new section
3. Add a **Code module**
4. Paste the code
5. Publish

### For Beaver Builder:
1. Create page with Beaver Builder
2. Add **HTML module**
3. Paste the code
4. Publish

---

## Customization Tips

### Change the URL Slug
By default, WordPress creates the URL from the page title. To customize:
1. Under the page title, click "Permalink"
2. Change to your preferred URL (e.g., "onboarding", "get-started", "signup")
3. Save

### Remove WordPress Theme Elements
If you see your theme's header/footer and want a clean page:

**Option A: Use a Full Width Template**
- In page settings (right sidebar)
- Look for "Template" dropdown
- Select "Blank" or "Full Width" or "Landing Page"

**Option B: Use a Plugin**
- Install "Elementor" (free)
- Edit page with Elementor
- Settings → Page Layout → "Elementor Canvas" (completely blank)

---

## Troubleshooting

### Problem: Styles Look Broken
**Cause**: WordPress theme CSS conflicts
**Fix**: All styles are scoped with `.techmayne-onboarding-wrapper` class to prevent conflicts. If still broken:
1. Use a page builder's HTML widget instead
2. Or select a "Blank" template for the page

### Problem: Form Doesn't Submit
**Cause**: JavaScript conflicts with theme/plugins
**Fix**:
1. Check browser console for errors (F12 → Console tab)
2. Try disabling other plugins temporarily
3. Make sure the API URL is correct in the code

### Problem: Page Has Margins/Padding
**Cause**: WordPress theme container padding
**Fix**: Already handled with negative margins in the CSS. If still visible, add this CSS to your theme:
```css
.page-id-XXX .entry-content {
  padding: 0 !important;
  margin: 0 !important;
}
```
(Replace XXX with your page ID - visible in the page URL when editing)

---

## Advanced: Adding to Theme Template

If you want the page permanently in your theme:

1. **Access Theme Files**
   - Go to Appearance → Theme File Editor
   - Or use FTP/cPanel File Manager

2. **Create Template File**
   - In your theme folder, create: `page-onboarding.php`
   - Add this code:
   ```php
   <?php
   /*
   Template Name: Client Onboarding
   */
   get_header();
   ?>

   <!-- Paste the content from onboarding-wordpress.html here -->

   <?php
   get_footer();
   ?>
   ```

3. **Assign Template**
   - Edit your page
   - In right sidebar → Template → Select "Client Onboarding"

---

## Security Notes

- The form submits to your Railway backend (already secured)
- No sensitive data is stored in WordPress
- Installation credentials are sent directly to your admin email
- Google Sheets saves data automatically (when configured)

---

## Testing Your Integration

1. **Open the page** in a browser
2. **Fill out the form** with test data
3. **Submit** and verify:
   - ✅ Loading spinner appears
   - ✅ Success message shows with embed code
   - ✅ Email received at your admin email
   - ✅ Data saved to Google Sheets (if configured)
   - ✅ Client created in Supabase database

---

## Making Updates

If you need to update the form:
1. Edit the page in WordPress
2. Update the HTML in the HTML block
3. Publish changes

Or update the standalone `onboarding-wordpress.html` file and re-paste the code.

---

## URL Examples

Depending on your WordPress setup, your page will be at:
- `https://techmayne.com/client-onboarding`
- `https://techmayne.com/onboarding`
- `https://techmayne.com/signup`

You can customize this in the page permalink settings.
