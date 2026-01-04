const supabase = require('../config/supabase');

async function listClients() {
  try {
    console.log('===== ALL CLIENTS IN DATABASE =====\n');

    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, business_name, website_url, client_token, created_at, is_active')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ Error fetching clients:', error);
      return;
    }

    if (!clients || clients.length === 0) {
      console.log('⚠️  NO CLIENTS FOUND IN DATABASE!');
      return;
    }

    console.log(`Found ${clients.length} clients:\n`);

    clients.forEach((client, index) => {
      console.log(`${index + 1}. ${client.business_name || 'Unnamed Business'}`);
      console.log(`   Website: ${client.website_url}`);
      console.log(`   Client Token: ${client.client_token}`);
      console.log(`   Active: ${client.is_active ? '✅' : '❌'}`);
      console.log(`   Created: ${new Date(client.created_at).toLocaleString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  } finally {
    process.exit(0);
  }
}

listClients();
