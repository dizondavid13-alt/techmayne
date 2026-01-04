const supabase = require('../config/supabase');

// The client token from the user's installation
const CLIENT_TOKEN = '3e68a7a6-aef3-4a73-a63c-15cd39b8ca05';

async function checkFaqs() {
  try {
    console.log('===== FAQ DIAGNOSTIC TOOL =====\n');
    console.log('Checking FAQs for client token:', CLIENT_TOKEN);

    // First, get the client record
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('client_token', CLIENT_TOKEN)
      .single();

    if (clientError) {
      console.error('❌ Error fetching client:', clientError);
      return;
    }

    if (!client) {
      console.error('❌ Client not found with token:', CLIENT_TOKEN);
      return;
    }

    console.log('\n✅ Client found:');
    console.log('  - Client ID:', client.id);
    console.log('  - Business Name:', client.business_name);
    console.log('  - Website:', client.website_url);
    console.log('  - Created:', client.created_at);

    // Now get all FAQs for this client
    const { data: faqs, error: faqError } = await supabase
      .from('faq_entries')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: true });

    if (faqError) {
      console.error('\n❌ Error fetching FAQs:', faqError);
      return;
    }

    console.log('\n===== FAQ RESULTS =====');
    console.log('Total FAQs found:', faqs?.length || 0);

    if (!faqs || faqs.length === 0) {
      console.log('\n⚠️  NO FAQs FOUND FOR THIS CLIENT!');
      console.log('This means:');
      console.log('  1. Default FAQs were not created during onboarding');
      console.log('  2. Custom FAQs were not saved');
      console.log('  3. Or they were deleted');
      return;
    }

    // Separate custom and default FAQs
    const customFaqs = faqs.filter(f => f.is_custom === true);
    const defaultFaqs = faqs.filter(f => f.is_custom !== true);

    console.log('\nDefault FAQs:', defaultFaqs.length);
    console.log('Custom FAQs:', customFaqs.length);

    if (customFaqs.length > 0) {
      console.log('\n===== CUSTOM FAQs =====');
      customFaqs.forEach((faq, index) => {
        console.log(`\n${index + 1}. ${faq.question}`);
        console.log(`   Answer: ${faq.answer}`);
        console.log(`   Keywords: ${faq.keywords?.join(', ') || 'none'}`);
        console.log(`   Created: ${faq.created_at}`);
      });
    }

    if (defaultFaqs.length > 0) {
      console.log('\n===== DEFAULT FAQs =====');
      console.log(`Found ${defaultFaqs.length} default FAQs`);
      console.log('First few questions:');
      defaultFaqs.slice(0, 5).forEach((faq, index) => {
        console.log(`  ${index + 1}. ${faq.question}`);
      });
    }

    console.log('\n===== RECOMMENDATIONS =====');
    if (faqs.length === 0) {
      console.log('🔧 Run the updateDefaultFaqs.js script to add default FAQs');
    } else if (customFaqs.length === 0) {
      console.log('💡 No custom FAQs found - user either didn\'t add any or they failed to save');
    } else {
      console.log('✅ Everything looks good!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  } finally {
    process.exit(0);
  }
}

checkFaqs();
