const supabase = require('../config/supabase');

async function checkAllFaqs() {
  try {
    console.log('===== CHECKING FAQs FOR ALL CLIENTS =====\n');

    // Get all clients
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id, business_name, client_token')
      .order('created_at', { ascending: false });

    if (clientError || !clients || clients.length === 0) {
      console.log('No clients found');
      return;
    }

    console.log(`Checking ${clients.length} clients...\n`);

    for (const client of clients) {
      // Get FAQs for this client
      const { data: faqs, error: faqError } = await supabase
        .from('faq_entries')
        .select('id, question')
        .eq('client_id', client.id);

      if (faqError) {
        console.log(`❌ Error for ${client.business_name}: ${faqError.message}`);
        continue;
      }

      const totalFaqs = faqs?.length || 0;

      const status = totalFaqs === 0 ? '⚠️ ' : '✅';
      console.log(`${status} ${client.business_name || 'Unnamed'}`);
      console.log(`   Token: ${client.client_token}`);
      console.log(`   Total FAQs: ${totalFaqs}`);

      if (faqs && faqs.length > 0) {
        console.log(`   First 3 FAQs:`);
        faqs.slice(0, 3).forEach(faq => {
          console.log(`      - ${faq.question}`);
        });
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  } finally {
    process.exit(0);
  }
}

checkAllFaqs();
