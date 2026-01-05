const supabase = require('../config/supabase');

/**
 * Update Client FAQs Script
 *
 * Usage:
 *   List FAQs:    node scripts/updateClientFAQs.js <client_token> list
 *   Add FAQ:      node scripts/updateClientFAQs.js <client_token> add
 *   Update FAQ:   node scripts/updateClientFAQs.js <client_token> update <faq_id>
 *   Delete FAQ:   node scripts/updateClientFAQs.js <client_token> delete <faq_id>
 */

async function updateFAQs() {
  const [,, clientToken, action, faqId] = process.argv;

  if (!clientToken || !action) {
    console.log('❌ Usage: node scripts/updateClientFAQs.js <client_token> <action> [faq_id]');
    console.log('\nActions:');
    console.log('  list              - List all FAQs for client');
    console.log('  add               - Add a new FAQ');
    console.log('  update <faq_id>   - Update existing FAQ');
    console.log('  delete <faq_id>   - Delete FAQ');
    process.exit(1);
  }

  try {
    // Get client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, business_name')
      .eq('client_token', clientToken)
      .single();

    if (clientError || !client) {
      console.error('❌ Client not found!');
      process.exit(1);
    }

    console.log(`\n📋 Managing FAQs for: ${client.business_name}\n`);

    switch (action.toLowerCase()) {
      case 'list':
        await listFAQs(client.id);
        break;
      case 'add':
        await addFAQ(client.id);
        break;
      case 'update':
        if (!faqId) {
          console.error('❌ FAQ ID required for update');
          process.exit(1);
        }
        await updateFAQ(faqId);
        break;
      case 'delete':
        if (!faqId) {
          console.error('❌ FAQ ID required for delete');
          process.exit(1);
        }
        await deleteFAQ(faqId);
        break;
      default:
        console.error('❌ Unknown action:', action);
        process.exit(1);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

async function listFAQs(clientId) {
  const { data: faqs, error } = await supabase
    .from('faq_entries')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching FAQs:', error);
    return;
  }

  if (!faqs || faqs.length === 0) {
    console.log('⚠️  No FAQs found for this client');
    return;
  }

  console.log(`Found ${faqs.length} FAQs:\n`);
  faqs.forEach((faq, index) => {
    console.log(`${index + 1}. ID: ${faq.id}`);
    console.log(`   Q: ${faq.question}`);
    console.log(`   A: ${faq.answer.substring(0, 100)}${faq.answer.length > 100 ? '...' : ''}`);
    console.log(`   Keywords: ${faq.keywords?.join(', ') || 'none'}`);
    console.log('');
  });
}

async function addFAQ(clientId) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise((resolve) => {
    readline.question(prompt, resolve);
  });

  console.log('📝 Adding new FAQ:\n');

  const faqQuestion = await question('Question: ');
  const answer = await question('Answer: ');
  const keywordsInput = await question('Keywords (comma-separated): ');

  readline.close();

  const keywords = keywordsInput.split(',').map(k => k.trim()).filter(k => k);

  const { data, error } = await supabase
    .from('faq_entries')
    .insert({
      client_id: clientId,
      question: faqQuestion,
      answer: answer,
      keywords: keywords
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error adding FAQ:', error);
    return;
  }

  console.log('\n✅ FAQ added successfully!');
  console.log(`   ID: ${data.id}`);
}

async function updateFAQ(faqId) {
  const { data: existing, error: fetchError } = await supabase
    .from('faq_entries')
    .select('*')
    .eq('id', faqId)
    .single();

  if (fetchError || !existing) {
    console.error('❌ FAQ not found!');
    return;
  }

  console.log('Current FAQ:');
  console.log(`Q: ${existing.question}`);
  console.log(`A: ${existing.answer}\n`);

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise((resolve) => {
    readline.question(prompt, resolve);
  });

  const newQuestion = await question('New Question (press Enter to keep current): ');
  const newAnswer = await question('New Answer (press Enter to keep current): ');
  const newKeywords = await question('New Keywords (comma-separated, press Enter to keep current): ');

  readline.close();

  const updateData = {};
  if (newQuestion.trim()) updateData.question = newQuestion.trim();
  if (newAnswer.trim()) updateData.answer = newAnswer.trim();
  if (newKeywords.trim()) updateData.keywords = newKeywords.split(',').map(k => k.trim());

  if (Object.keys(updateData).length === 0) {
    console.log('⚠️  No changes made');
    return;
  }

  const { error: updateError } = await supabase
    .from('faq_entries')
    .update(updateData)
    .eq('id', faqId);

  if (updateError) {
    console.error('❌ Error updating FAQ:', updateError);
    return;
  }

  console.log('\n✅ FAQ updated successfully!');
}

async function deleteFAQ(faqId) {
  const { data: existing, error: fetchError } = await supabase
    .from('faq_entries')
    .select('question')
    .eq('id', faqId)
    .single();

  if (fetchError || !existing) {
    console.error('❌ FAQ not found!');
    return;
  }

  console.log(`⚠️  About to delete: "${existing.question}"`);

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise((resolve) => {
    readline.question('Are you sure? (yes/no): ', resolve);
  });

  readline.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Deletion cancelled');
    return;
  }

  const { error: deleteError } = await supabase
    .from('faq_entries')
    .delete()
    .eq('id', faqId);

  if (deleteError) {
    console.error('❌ Error deleting FAQ:', deleteError);
    return;
  }

  console.log('\n✅ FAQ deleted successfully!');
}

updateFAQs();
