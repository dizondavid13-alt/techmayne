# Pricing & Landing Page WordPress Guide

## Files Available

### 1. `pricing-landing-page-wordpress.html`
**What it is**: Just the pricing section from your Figma mockup
**Use when**: You want to add pricing to an existing page or use it as a section

### 2. `full-landing-page-wordpress.html`
**What it is**: Complete landing page with Hero + Pricing + CTA sections
**Use when**: You want a complete homepage/landing page
**Includes**:
- Hero section with gradient background
- Pricing section (your Figma design)
- Call-to-action section

---

## Quick Setup - Full Landing Page

### Step 1: Create the Page in WordPress

1. **Log in to WordPress Admin**
   - Go to `https://techmayne.com/wp-admin`

2. **Create New Page**
   - Click "Pages" → "Add New"
   - Title: "Home" or "Landing Page"

3. **Add HTML Block**
   - Click the `+` button
   - Search for "Custom HTML"
   - Select "Custom HTML" block

4. **Paste the Code**
   - Open `full-landing-page-wordpress.html`
   - Copy ALL contents
   - Paste into the HTML block

5. **Set Page Template**
   - In right sidebar → "Template" dropdown
   - Select "Full Width" or "Blank" template
   - This removes sidebar and gives clean layout

6. **Publish**
   - Click "Publish" button

### Step 2: Set as Homepage

1. Go to "Settings" → "Reading"
2. Under "Your homepage displays":
   - Select "A static page"
   - Choose your new page from dropdown
3. Click "Save Changes"

Your landing page is now live at `https://techmayne.com`!

---

## Quick Setup - Pricing Section Only

If you just want to add the pricing section to an existing page:

1. **Edit Your Page**
   - Go to the page where you want pricing

2. **Add HTML Block**
   - Click `+` to add a block
   - Select "Custom HTML"

3. **Paste Pricing Code**
   - Open `pricing-landing-page-wordpress.html`
   - Copy all contents
   - Paste into HTML block

4. **Update/Publish**

---

## Customization

### Change Button URLs

**In the code**, find these lines and update the URLs:

```html
<!-- For "Get Started" buttons -->
<button onclick="window.location.href='https://techmayne.com/onboarding'">

<!-- For "Contact Us" button -->
<button onclick="window.location.href='mailto:support@techmayne.com?subject=Studio Plan Inquiry'">
```

Replace the URLs with your actual onboarding page and contact email.

### Change Pricing

Find the price sections and update:

```html
<span class="tm-price-amount">$99</span>
<span class="tm-price-period">/mo</span>
```

### Change Plan Names and Features

Find the plan sections and edit the text:

```html
<h3 class="tm-plan-name">Starter</h3>

<ul class="tm-plan-features">
  <li>• FAQ answering</li>
  <li>• Basic lead capture</li>
  <!-- Add or remove features here -->
</ul>
```

### Change Hero Text (Full Landing Page)

```html
<h1>AI Chatbots Built for Photographers</h1>
<p>Capture more leads, answer questions 24/7...</p>
```

### Change Colors

Find the `<style>` section at the top and modify:

```css
/* Primary brand color (buttons, badges) */
background: #4F46E5; /* Change this hex code */

/* Dark background (hero, footer) */
background: #0A2540; /* Change this hex code */

/* Highlighted card background */
background: #EEF2FF; /* Change this hex code */
```

---

## Page Builder Instructions

### For Elementor:

1. Create new page with Elementor
2. Add a section
3. Drag **HTML widget** into section
4. Paste code from either file
5. In section settings:
   - Set Content Width to "Full Width"
   - Set Column Gap to "No Gap"
   - Remove padding/margins
6. Publish

### For Divi:

1. Create page with Divi Builder
2. Add new section
3. Add **Code module**
4. Paste code
5. In section settings:
   - Enable "Make This Section Full Width"
   - Set padding to 0
6. Save

### For WPBakery:

1. Create page
2. Add row
3. Add **Raw HTML** element
4. Paste code
5. Set row to full width
6. Update

---

## Styling Notes

### Why the Background Color Looks Different

The full landing page uses:
- **Cream/beige background** (`#F5F1E8`) for the pricing section only
- **White background** for hero
- **Dark blue background** (`#0A2540`) for CTA

This creates visual separation between sections. If you want the whole page in cream:

```css
/* Change this in the <style> section */
.tm-pricing-section {
  background: #F5F1E8; /* Already cream */
}

.tm-hero {
  background: #F5F1E8; /* Change from gradient to cream */
}

.tm-cta {
  background: #F5F1E8; /* Change from dark blue to cream */
  color: #111827; /* Change text to dark */
}
```

---

## Responsive Design

Both pages are fully responsive:
- **Desktop**: 3-column pricing grid
- **Tablet**: Single column
- **Mobile**: Optimized for small screens

No additional work needed!

---

## Integration with Onboarding Page

The buttons are pre-configured to link to:
- **Get Started** → `https://techmayne.com/onboarding`
- **Contact Us** → `mailto:support@techmayne.com`

Make sure your onboarding page is live at `/onboarding` for the buttons to work.

---

## Testing Checklist

- [ ] Page displays correctly on desktop
- [ ] Page displays correctly on mobile
- [ ] All buttons work and link to correct URLs
- [ ] Smooth scroll works (for full landing page)
- [ ] No conflicts with WordPress theme styles
- [ ] Page template set to Full Width/Blank
- [ ] Text is readable and colors are correct

---

## Troubleshooting

### Problem: Styles look broken
**Fix**: Make sure you selected "Full Width" or "Blank" template for the page

### Problem: WordPress header/footer showing
**Fix**: Use a page builder's "Canvas" mode or install a blank page plugin

### Problem: Buttons don't work
**Fix**: Check the `onclick` attributes have correct URLs

### Problem: Colors don't match Figma
**Fix**: All colors are exact from your Figma mockup. If different, check for theme CSS overrides.

---

## Next Steps

1. **Set up the landing page** as your homepage
2. **Create the onboarding page** (already have `onboarding-wordpress.html`)
3. **Test the flow**: Landing page → Click "Get Started" → Onboarding form → Success
4. **Set up analytics** to track button clicks and conversions
5. **Add custom domain** if not already done

---

## Support

If you need help:
- Check WordPress page template is set to "Full Width"
- Verify HTML block contains all the code
- Check browser console for JavaScript errors (F12)
- Email: support@techmayne.com
