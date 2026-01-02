const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const sheetsService = require('../services/sheetsService');
const resendService = require('../services/resendService');

// Create new client
router.post('/create', async (req, res) => {
  try {
    const {
      businessName,
      websiteUrl,
      bookingLink,
      notificationEmail,
      phoneNumber,
      serviceArea,
      startingPrice,
      galleryTimeline,
      accentColor,
      customFaqs,
      installation
    } = req.body;

    // Validate required fields
    if (!businessName || !websiteUrl || !notificationEmail || !phoneNumber) {
      return res.status(400).json({
        error: 'Missing required fields: businessName, websiteUrl, notificationEmail, phoneNumber'
      });
    }

    // Generate unique client token
    const clientToken = uuidv4();

    // Prepare client data
    const clientData = {
      client_token: clientToken,
      business_name: businessName,
      website_url: websiteUrl,
      booking_link: bookingLink || null,
      notification_email: notificationEmail,
      phone_number: phoneNumber,
      service_area: serviceArea || null,
      starting_price: startingPrice || null,
      accent_color: accentColor || '#6366f1'
    };

    // Add installation fields if requested
    if (installation && installation.needsInstallation) {
      clientData.installation_requested = true;
      clientData.installation_platform = installation.platform;
      clientData.installation_username = installation.username;
      clientData.installation_password = installation.password;
      clientData.installation_2fa_status = installation.twoFactorStatus;
      clientData.installation_instructions = installation.instructions || null;
    }

    // Create client in database
    const { data: client, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }

    // Create default FAQs
    const { error: faqError } = await supabase
      .rpc('create_default_faqs', { p_client_id: client.id });

    if (faqError) {
      console.error('Error creating default FAQs:', faqError);
    }

    // Create custom FAQs if provided
    if (customFaqs && Array.isArray(customFaqs) && customFaqs.length > 0) {
      const customFaqEntries = customFaqs.map(faq => ({
        client_id: client.id,
        question: faq.question,
        answer: faq.answer,
        keywords: faq.keywords ? faq.keywords.split(',').map(k => k.trim()) : [],
        is_custom: true
      }));

      const { error: customFaqError } = await supabase
        .from('faq_entries')
        .insert(customFaqEntries);

      if (customFaqError) {
        console.error('Error creating custom FAQs:', customFaqError);
      }
    }

    // Save to Google Sheets (non-blocking)
    const sheetData = {
      businessName,
      websiteUrl,
      notificationEmail,
      phoneNumber,
      bookingLink,
      serviceArea,
      startingPrice,
      galleryTimeline,
      accentColor,
      customFaqs,
      installation,
      clientToken
    };

    sheetsService.appendClientData(sheetData).catch(err => {
      console.error('Google Sheets save failed (non-critical):', err);
    });

    // Send admin notification (non-blocking)
    resendService.sendAdminNotification(sheetData).catch(err => {
      console.error('Admin notification failed (non-critical):', err);
    });

    // Generate embed code
    const embedCode = `<script
  src="http://localhost:3000/widget/widget.js"
  data-client-token="${clientToken}"
></script>`;

    res.json({
      success: true,
      client: {
        id: client.id,
        businessName: client.business_name,
        websiteUrl: client.website_url,
        clientToken: clientToken,
        installationRequested: client.installation_requested || false
      },
      embedCode: embedCode,
      message: 'Client created successfully! Use the embed code to install the widget.'
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      error: 'Failed to create client',
      details: error.message
    });
  }
});

module.exports = router;
