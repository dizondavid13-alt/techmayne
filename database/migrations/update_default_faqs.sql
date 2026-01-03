-- Update create_default_faqs function with comprehensive photographer FAQs
-- This replaces the existing function with refined keywords and more Q&As

CREATE OR REPLACE FUNCTION create_default_faqs(p_client_id uuid)
RETURNS void AS $$
BEGIN
  -- Insert comprehensive default FAQs for photographers
  INSERT INTO faq_entries (client_id, question, answer, keywords, is_custom)
  VALUES
    -- Services Offered (refined keywords - NOT pricing related)
    (
      p_client_id,
      'What services do you offer?',
      'I offer a variety of photography services including weddings, engagement sessions, elopements, portrait sessions, corporate events, family sessions, and maternity photography. Each service can be customized to fit your specific needs and vision!',
      ARRAY['services', 'types', 'what do you offer', 'what do you do', 'photography types', 'options', 'kinds'],
      false
    ),

    -- Pricing & Packages (pricing-specific keywords)
    (
      p_client_id,
      'What are your pricing and packages?',
      'My packages are customized based on your specific needs, event type, and coverage hours. Wedding packages typically start around the price shown above and include edited high-resolution images, an online gallery, and full usage rights. I''d love to create a custom quote for you - just let me know your event details!',
      ARRAY['pricing', 'price', 'cost', 'how much', 'packages', 'rates', 'fees', 'investment', 'budget'],
      false
    ),

    -- Gallery Delivery Timeline
    (
      p_client_id,
      'When will I receive my photos?',
      'Your beautifully edited photos will be delivered within 4-6 weeks after your event in a private online gallery. You''ll receive full resolution images with printing rights, and the gallery will be available for download and sharing with family and friends!',
      ARRAY['gallery', 'timeline', 'delivery', 'when', 'receive', 'turnaround', 'how long', 'photos ready', 'wait time'],
      false
    ),

    -- Travel Policy
    (
      p_client_id,
      'Do you travel for events?',
      'Absolutely! I love destination events and travel frequently for weddings and sessions. My service area is listed above, but I''m always excited to travel beyond that. Travel fees may apply for locations outside my local area, and we can discuss those details when planning your event.',
      ARRAY['travel', 'destination', 'location', 'out of state', 'out of town', 'far', 'distance', 'come to', 'service area'],
      false
    ),

    -- Booking Process
    (
      p_client_id,
      'How do I book you?',
      'I''m so glad you''re interested! The booking process is simple: First, we''ll chat about your event details and vision. Then I''ll send you a custom proposal and contract. Once you sign the contract and pay the retainer (typically 25-30%), your date is officially reserved! I only take one wedding per day to give you my full attention.',
      ARRAY['book', 'booking', 'reserve', 'schedule', 'secure', 'hold date', 'availability', 'how to book'],
      false
    ),

    -- What''s Included
    (
      p_client_id,
      'What''s included in your packages?',
      'Great question! All packages include: full coverage for your chosen hours, professionally edited high-resolution images, a private online gallery for viewing and downloading, printing rights, and a personalized timeline consultation. Depending on your package, you may also get engagement sessions, second shooters, albums, and more!',
      ARRAY['included', 'include', 'what do i get', 'comes with', 'part of package', 'coverage', 'features'],
      false
    ),

    -- Payment Terms
    (
      p_client_id,
      'What are your payment terms?',
      'To secure your date, I require a signed contract and a retainer (typically 25-30% of the total package price). The remaining balance is due 2 weeks before your event date. I accept payment via credit card, bank transfer, or check. Payment plans are available for weddings - just ask!',
      ARRAY['payment', 'deposit', 'retainer', 'pay', 'due', 'payment plan', 'installments', 'how to pay'],
      false
    ),

    -- Rescheduling Policy
    (
      p_client_id,
      'What if I need to reschedule?',
      'I completely understand that plans can change! If you need to reschedule, just let me know as soon as possible. As long as I''m available on your new date, we can move your booking at no additional charge. Your retainer will transfer to the new date. Cancellation policies are outlined in the contract.',
      ARRAY['reschedule', 'change date', 'postpone', 'move date', 'cancel', 'cancellation', 'different date'],
      false
    ),

    -- Second Photographer
    (
      p_client_id,
      'Do you work with a second photographer?',
      'For larger weddings (150+ guests) or full-day coverage, I highly recommend a second photographer to capture multiple angles and moments happening simultaneously. I work with talented associate photographers who match my style perfectly. This can be added to any package!',
      ARRAY['second photographer', 'assistant', 'team', 'multiple photographers', 'two photographers', 'backup'],
      false
    ),

    -- Engagement Sessions
    (
      p_client_id,
      'Do you offer engagement sessions?',
      'Yes! Engagement sessions are a wonderful way to get comfortable in front of the camera before your big day, and they create beautiful photos for save-the-dates or your wedding website. Many of my wedding packages include a complimentary engagement session, or they can be added separately.',
      ARRAY['engagement', 'engagement session', 'engagement photos', 'couple session', 'save the date'],
      false
    ),

    -- Photography Style
    (
      p_client_id,
      'What is your photography style?',
      'My style is natural, timeless, and emotion-focused. I blend candid documentary moments with beautifully composed portraits. I love capturing authentic emotions and real connections while also creating stunning editorial-style images. Think romantic, light and airy, with true-to-life colors that will stand the test of time!',
      ARRAY['style', 'approach', 'aesthetic', 'look', 'vibe', 'editing style', 'photo style', 'artistic'],
      false
    ),

    -- Insurance & Professionalism
    (
      p_client_id,
      'Are you insured?',
      'Yes! I carry full professional liability insurance and can provide a certificate of insurance to your venue if needed. I also have backup equipment for every piece of gear and backup photographers on call in case of emergency. Your day is too important to leave anything to chance!',
      ARRAY['insurance', 'insured', 'liability', 'professional', 'backup', 'backup equipment', 'licensed'],
      false
    ),

    -- Raw Files
    (
      p_client_id,
      'Can I get the raw/unedited files?',
      'I don''t provide raw files as they aren''t representative of my final work and artistic vision. However, you''ll receive ALL edited, high-resolution images from your event with full printing rights - typically 500-800 images for a full wedding day! These are professionally retouched and color-corrected to ensure you have stunning photos you''ll love forever.',
      ARRAY['raw', 'raw files', 'unedited', 'all photos', 'negatives', 'original files'],
      false
    ),

    -- Albums & Prints
    (
      p_client_id,
      'Do you offer albums or prints?',
      'Yes! I offer gorgeous heirloom-quality albums through professional print labs. Albums can be added to any package, and I''ll help you design a custom layout. I also offer prints, canvases, and wall art at wholesale prices. Many couples love having a tangible keepsake of their day!',
      ARRAY['album', 'albums', 'prints', 'print', 'wall art', 'canvas', 'photo book', 'physical photos'],
      false
    ),

    -- Experience & Background
    (
      p_client_id,
      'How long have you been photographing?',
      'I''ve been a professional photographer for several years, specializing in weddings and portraits. I''ve photographed hundreds of events and love every moment! I stay current with the latest techniques through workshops and education, and I''m passionate about creating beautiful, timeless images for my clients.',
      ARRAY['experience', 'how long', 'background', 'weddings shot', 'professional', 'years', 'portfolio'],
      false
    ),

    -- Equipment & Backup
    (
      p_client_id,
      'What equipment do you use?',
      'I use professional-grade cameras and lenses (Canon/Nikon/Sony professional systems) to ensure the highest quality images in any lighting condition. I carry backup bodies, lenses, memory cards, and batteries to every event. All images are backed up to multiple locations immediately after your event for security.',
      ARRAY['equipment', 'gear', 'camera', 'what do you use', 'backup', 'technology'],
      false
    ),

    -- Timeline & Planning
    (
      p_client_id,
      'Do you help with timeline planning?',
      'Absolutely! Once you book, I''ll send you a detailed timeline questionnaire and we''ll have a consultation to plan the perfect photography timeline for your day. I''ve photographed many events and can recommend timing that ensures we capture everything beautifully without feeling rushed. Great timeline planning makes for better photos and less stress!',
      ARRAY['timeline', 'planning', 'schedule', 'help plan', 'timing', 'consultation', 'meeting'],
      false
    );

END;
$$ LANGUAGE plpgsql;

-- Comment explaining the function
COMMENT ON FUNCTION create_default_faqs(uuid) IS 'Creates comprehensive default FAQs for photographers with refined keyword matching. Services keywords focus on event types, pricing keywords focus on cost.';
