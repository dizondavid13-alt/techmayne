const supabase = require('../config/supabase');

async function matchFAQ(clientId, question) {
  try {
    // Get all FAQs for this client
    const { data: faqs, error } = await supabase
      .from('faq_entries')
      .select('*')
      .eq('client_id', clientId);

    if (error) throw error;
    if (!faqs || faqs.length === 0) {
      return { found: false };
    }

    const questionLower = question.toLowerCase();

    // Simple keyword matching
    for (const faq of faqs) {
      if (faq.keywords && faq.keywords.some(keyword =>
        questionLower.includes(keyword.toLowerCase())
      )) {
        return {
          found: true,
          answer: faq.answer,
          question: faq.question
        };
      }
    }

    return { found: false };
  } catch (error) {
    console.error('FAQ matching error:', error);
    return { found: false };
  }
}

module.exports = { matchFAQ };
