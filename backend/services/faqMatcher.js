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
    console.log('FAQ Matcher - User question:', question);
    console.log('FAQ Matcher - Total FAQs found:', faqs.length);

    // 1. Try exact keyword matching first
    for (const faq of faqs) {
      if (faq.keywords && faq.keywords.length > 0) {
        console.log('FAQ - Checking keywords for:', faq.question, '| Keywords:', faq.keywords);
        if (faq.keywords.some(keyword =>
          questionLower.includes(keyword.toLowerCase())
        )) {
          console.log('FAQ - MATCH FOUND via keywords!');
          return {
            found: true,
            answer: faq.answer,
            question: faq.question
          };
        }
      }
    }

    // 2. Try matching against FAQ question text (fuzzy match)
    for (const faq of faqs) {
      const faqQuestionLower = faq.question.toLowerCase();
      const faqAnswerLower = faq.answer.toLowerCase();
      const questionWords = questionLower.split(/\s+/).filter(w => w.length > 3);
      const faqWords = faqQuestionLower.split(/\s+/).filter(w => w.length > 3);

      // Count matching words in question
      let matchCount = 0;
      for (const word of questionWords) {
        if (faqWords.some(faqWord =>
          faqWord.includes(word) || word.includes(faqWord)
        )) {
          matchCount++;
        }
      }

      // Also check if user question is contained in FAQ answer
      const answerContainsQuestion = questionWords.some(word =>
        faqAnswerLower.includes(word)
      );

      // If more than 40% of words match OR answer contains key words, consider it a match
      const matchRatio = questionWords.length > 0 ? matchCount / questionWords.length : 0;
      console.log('FAQ - Fuzzy match ratio for:', faq.question, '| Ratio:', matchRatio);

      if (matchRatio > 0.4 || (answerContainsQuestion && matchCount > 0)) {
        console.log('FAQ - MATCH FOUND via fuzzy matching!');
        return {
          found: true,
          answer: faq.answer,
          question: faq.question
        };
      }
    }

    console.log('FAQ - No match found for question:', question);

    return { found: false };
  } catch (error) {
    console.error('FAQ matching error:', error);
    return { found: false };
  }
}

module.exports = { matchFAQ };
