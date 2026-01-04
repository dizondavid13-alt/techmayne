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

    // 1. Try exact keyword matching first
    for (const faq of faqs) {
      if (faq.keywords && faq.keywords.length > 0 && faq.keywords.some(keyword =>
        questionLower.includes(keyword.toLowerCase())
      )) {
        return {
          found: true,
          answer: faq.answer,
          question: faq.question
        };
      }
    }

    // 2. Try matching against FAQ question text (fuzzy match)
    for (const faq of faqs) {
      const faqQuestionLower = faq.question.toLowerCase();
      const questionWords = questionLower.split(/\s+/);
      const faqWords = faqQuestionLower.split(/\s+/);

      // Count matching words
      let matchCount = 0;
      for (const word of questionWords) {
        if (word.length > 3 && faqWords.some(faqWord =>
          faqWord.includes(word) || word.includes(faqWord)
        )) {
          matchCount++;
        }
      }

      // If more than 50% of significant words match, consider it a match
      if (questionWords.length > 0 && matchCount / questionWords.length > 0.5) {
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
