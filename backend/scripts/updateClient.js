const supabase = require('../config/supabase');

/**
 * Update Client Information Script
 *
 * Usage:
 *   node scripts/updateClient.js <client_token> <field> <value>
 *
 * Examples:
 *   node scripts/updateClient.js abc-123 starting_price "$3,500"
 *   node scripts/updateClient.js abc-123 booking_link "https://calendly.com/newlink"
 *   node scripts/updateClient.js abc-123 accent_color "#FF5722"
 *   node scripts/updateClient.js abc-123 services_offered "wedding,engagement,portrait"
 */

async function updateClient() {
  const [,, clientToken, field, ...valueParts] = process.argv;
  const value = valueParts.join(' ');

  if (!clientToken || !field || !value) {
    console.log('❌ Usage: node scripts/updateClient.js <client_token> <field> <value>');
    console.log('\nUpdatable fields:');
    console.log('  - business_name');
    console.log('  - chatbot_name');
    console.log('  - booking_link');
    console.log('  - notification_email');
    console.log('  - phone_number');
    console.log('  - service_area');
    console.log('  - starting_price');
    console.log('  - gallery_timeline');
    console.log('  - accent_color');
    console.log('  - services_offered (comma-separated: wedding,portrait,family)');
    console.log('  - is_active (true/false)');
    process.exit(1);
  }

  try {
    console.log(`\n🔍 Finding client with token: ${clientToken}...`);

    // Get client first to show current value
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('client_token', clientToken)
      .single();

    if (fetchError || !client) {
      console.error('❌ Client not found!');
      process.exit(1);
    }

    console.log(`✅ Found: ${client.business_name}`);
    console.log(`📊 Current ${field}: ${client[field]}`);

    // Parse value based on field type
    let parsedValue = value;
    if (field === 'services_offered') {
      parsedValue = value.split(',').map(s => s.trim().toLowerCase());
    } else if (field === 'is_active') {
      parsedValue = value.toLowerCase() === 'true';
    }

    // Update the client
    const updateData = { [field]: parsedValue };
    const { data: updated, error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('client_token', clientToken)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating client:', updateError);
      process.exit(1);
    }

    console.log(`✅ Updated ${field} to: ${parsedValue}`);

    // Clear cache for instant updates
    try {
      const cache = require('../config/cache');
      const cacheKey = `widget_config:${clientToken}`;
      cache.delete(cacheKey);
      console.log('🗑️  Cache cleared - changes are now INSTANT!');
    } catch (cacheError) {
      console.log('⚠️  Cache clear skipped (not critical)');
    }

    console.log('\n💡 Changes are now live on the client\'s chatbot!');
    console.log('   No re-installation needed - widget will show updates immediately.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

updateClient();
