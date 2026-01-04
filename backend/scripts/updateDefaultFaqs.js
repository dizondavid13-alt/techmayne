const supabase = require('../config/supabase');

// Comprehensive default FAQs for photographers with refined keywords
const DEFAULT_FAQS = [
  {
    question: 'What services do you offer?',
    answer: 'I offer a variety of photography services including weddings, engagement sessions, elopements, portrait sessions, corporate events, family sessions, and maternity photography. Each service can be customized to fit your specific needs and vision!',
    keywords: ['services', 'service', 'types of photography', 'what do you offer', 'what do you do', 'photography types', 'event types', 'what type', 'kinds of sessions']
  },
  {
    question: 'What are your pricing and packages?',
    answer: 'My packages are customized based on your specific needs, event type, and coverage hours. Wedding packages typically start around the price shown above and include edited high-resolution images, an online gallery, and full usage rights. I\'d love to create a custom quote for you - just let me know your event details!',
    keywords: ['pricing', 'price', 'cost', 'how much', 'packages', 'package', 'rates', 'fees', 'investment', 'budget']  },
  {
    question: 'When will I receive my photos?',
    answer: 'Your beautifully edited photos will be delivered within 4-6 weeks after your event in a private online gallery. You\'ll receive full resolution images with printing rights, and the gallery will be available for download and sharing with family and friends!',
    keywords: ['gallery', 'timeline', 'delivery', 'when', 'receive', 'turnaround', 'how long', 'photos ready', 'wait time']  },
  {
    question: 'Do you travel for events?',
    answer: 'Absolutely! I love destination events and travel frequently for weddings and sessions. My service area is listed above, but I\'m always excited to travel beyond that. Travel fees may apply for locations outside my local area, and we can discuss those details when planning your event.',
    keywords: ['travel', 'destination', 'location', 'out of state', 'out of town', 'far', 'distance', 'come to', 'service area']  },
  {
    question: 'How do I book you?',
    answer: 'I\'m so glad you\'re interested! The booking process is simple: First, we\'ll chat about your event details and vision. Then I\'ll send you a custom proposal and contract. Once you sign the contract and pay the retainer (typically 25-30%), your date is officially reserved! I only take one wedding per day to give you my full attention.',
    keywords: ['book', 'booking', 'reserve', 'schedule', 'secure', 'hold date', 'availability', 'how to book']  },
  {
    question: 'What\'s included in your packages?',
    answer: 'Great question! All packages include: full coverage for your chosen hours, professionally edited high-resolution images, a private online gallery for viewing and downloading, printing rights, and a personalized timeline consultation. Depending on your package, you may also get engagement sessions, second shooters, albums, and more!',
    keywords: ['included', 'include', 'what do i get', 'comes with', 'part of package', 'coverage', 'features']  },
  {
    question: 'What are your payment terms?',
    answer: 'To secure your date, I require a signed contract and a retainer (typically 25-30% of the total package price). The remaining balance is due 2 weeks before your event date. I accept payment via credit card, bank transfer, or check. Payment plans are available for weddings - just ask!',
    keywords: ['payment', 'deposit', 'retainer', 'pay', 'due', 'payment plan', 'installments', 'how to pay']  },
  {
    question: 'What if I need to reschedule?',
    answer: 'I completely understand that plans can change! If you need to reschedule, just let me know as soon as possible. As long as I\'m available on your new date, we can move your booking at no additional charge. Your retainer will transfer to the new date. Cancellation policies are outlined in the contract.',
    keywords: ['reschedule', 'change date', 'postpone', 'move date', 'cancel', 'cancellation', 'different date']  },
  {
    question: 'Do you work with a second photographer?',
    answer: 'For larger weddings (150+ guests) or full-day coverage, I highly recommend a second photographer to capture multiple angles and moments happening simultaneously. I work with talented associate photographers who match my style perfectly. This can be added to any package!',
    keywords: ['second photographer', 'assistant', 'team', 'multiple photographers', 'two photographers', 'backup']  },
  {
    question: 'Do you offer engagement sessions?',
    answer: 'Yes! Engagement sessions are a wonderful way to get comfortable in front of the camera before your big day, and they create beautiful photos for save-the-dates or your wedding website. Many of my wedding packages include a complimentary engagement session, or they can be added separately.',
    keywords: ['engagement', 'engagement session', 'engagement photos', 'couple session', 'save the date']  },
  {
    question: 'What is your photography style?',
    answer: 'My style is natural, timeless, and emotion-focused. I blend candid documentary moments with beautifully composed portraits. I love capturing authentic emotions and real connections while also creating stunning editorial-style images. Think romantic, light and airy, with true-to-life colors that will stand the test of time!',
    keywords: ['style', 'approach', 'aesthetic', 'look', 'vibe', 'editing style', 'photo style', 'artistic']  },
  {
    question: 'Are you insured?',
    answer: 'Yes! I carry full professional liability insurance and can provide a certificate of insurance to your venue if needed. I also have backup equipment for every piece of gear and backup photographers on call in case of emergency. Your day is too important to leave anything to chance!',
    keywords: ['insurance', 'insured', 'liability', 'professional', 'backup', 'backup equipment', 'licensed']  },
  {
    question: 'Can I get the raw/unedited files?',
    answer: 'I don\'t provide raw files as they aren\'t representative of my final work and artistic vision. However, you\'ll receive ALL edited, high-resolution images from your event with full printing rights - typically 500-800 images for a full wedding day! These are professionally retouched and color-corrected to ensure you have stunning photos you\'ll love forever.',
    keywords: ['raw', 'raw files', 'unedited', 'all photos', 'negatives', 'original files']  },
  {
    question: 'Do you offer albums or prints?',
    answer: 'Yes! I offer gorgeous heirloom-quality albums through professional print labs. Albums can be added to any package, and I\'ll help you design a custom layout. I also offer prints, canvases, and wall art at wholesale prices. Many couples love having a tangible keepsake of their day!',
    keywords: ['album', 'albums', 'prints', 'print', 'wall art', 'canvas', 'photo book', 'physical photos']  },
  {
    question: 'How long have you been photographing?',
    answer: 'I\'ve been a professional photographer for several years, specializing in weddings and portraits. I\'ve photographed hundreds of events and love every moment! I stay current with the latest techniques through workshops and education, and I\'m passionate about creating beautiful, timeless images for my clients.',
    keywords: ['experience', 'how long', 'background', 'weddings shot', 'professional', 'years', 'portfolio']  },
  {
    question: 'What equipment do you use?',
    answer: 'I use professional-grade cameras and lenses (Canon/Nikon/Sony professional systems) to ensure the highest quality images in any lighting condition. I carry backup bodies, lenses, memory cards, and batteries to every event. All images are backed up to multiple locations immediately after your event for security.',
    keywords: ['equipment', 'gear', 'camera', 'what do you use', 'backup', 'technology']  },
  {
    question: 'Do you help with timeline planning?',
    answer: 'Absolutely! Once you book, I\'ll send you a detailed timeline questionnaire and we\'ll have a consultation to plan the perfect photography timeline for your day. I\'ve photographed many events and can recommend timing that ensures we capture everything beautifully without feeling rushed. Great timeline planning makes for better photos and less stress!',
    keywords: ['timeline', 'planning', 'schedule', 'help plan', 'timing', 'consultation', 'meeting']  }
];

async function updateClientFaqs(clientId) {
  try {
    console.log(`Updating FAQs for client: ${clientId}`);

    // Delete all existing FAQs for this client
    const { error: deleteError } = await supabase
      .from('faq_entries')
      .delete()
      .eq('client_id', clientId);

    if (deleteError) {
      console.error('Error deleting old FAQs:', deleteError);
      return;
    }

    // Insert new default FAQs
    const faqsToInsert = DEFAULT_FAQS.map(faq => ({
      client_id: clientId,
      ...faq
    }));

    const { error: insertError } = await supabase
      .from('faq_entries')
      .insert(faqsToInsert);

    if (insertError) {
      console.error('Error inserting new FAQs:', insertError);
      return;
    }

    console.log(`✅ Successfully updated ${DEFAULT_FAQS.length} FAQs for client ${clientId}`);
  } catch (error) {
    console.error('Error updating FAQs:', error);
  }
}

// Update for specific client (demo client)
const DEMO_CLIENT_TOKEN = 'c8082d26-223f-4eee-af1b-001c197fa3d8';

async function main() {
  // Get client ID from token
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('client_token', DEMO_CLIENT_TOKEN)
    .single();

  if (!client) {
    console.error('Demo client not found!');
    return;
  }

  await updateClientFaqs(client.id);
  console.log('Done!');
  process.exit(0);
}

main();
