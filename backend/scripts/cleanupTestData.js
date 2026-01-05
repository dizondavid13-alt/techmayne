const supabase = require('../config/supabase');

/**
 * Cleanup Test Data Before Launch
 *
 * ⚠️  WARNING: This will DELETE data permanently!
 *
 * Usage:
 *   Review test data:  node scripts/cleanupTestData.js --review
 *   Delete specific:   node scripts/cleanupTestData.js --client <client_token>
 *   Delete all test:   node scripts/cleanupTestData.js --all-test (requires confirmation)
 *   Keep production:   node scripts/cleanupTestData.js --production-only
 */

async function cleanupTestData() {
  const [,, flag, value] = process.argv;

  if (!flag) {
    console.log('❌ Usage:');
    console.log('  node scripts/cleanupTestData.js --review           Review all clients');
    console.log('  node scripts/cleanupTestData.js --client <token>   Delete specific client');
    console.log('  node scripts/cleanupTestData.js --all-test         Delete all test clients');
    console.log('  node scripts/cleanupTestData.js --production-only  Keep only production clients');
    console.log('\n⚠️  WARNING: Deletions are PERMANENT and cascade to FAQs, leads, conversations!');
    process.exit(1);
  }

  try {
    switch (flag) {
      case '--review':
        await reviewClients();
        break;
      case '--client':
        if (!value) {
          console.error('❌ Client token required');
          process.exit(1);
        }
        await deleteClient(value);
        break;
      case '--all-test':
        await deleteAllTestClients();
        break;
      case '--production-only':
        await keepProductionOnly();
        break;
      default:
        console.error('❌ Unknown flag:', flag);
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

async function reviewClients() {
  console.log('\n📋 Reviewing all clients...\n');

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (!clients || clients.length === 0) {
    console.log('⚠️  No clients found');
    return;
  }

  console.log(`Found ${clients.length} clients:\n`);

  for (const client of clients) {
    // Get related data counts
    const { count: faqCount } = await supabase
      .from('faq_entries')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);

    const { count: leadCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);

    const { count: convCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);

    const isTest = isTestClient(client);

    console.log(`${isTest ? '🧪' : '🚀'} ${client.business_name}`);
    console.log(`   Token: ${client.client_token}`);
    console.log(`   Website: ${client.website_url}`);
    console.log(`   Email: ${client.notification_email}`);
    console.log(`   Created: ${new Date(client.created_at).toLocaleString()}`);
    console.log(`   FAQs: ${faqCount} | Leads: ${leadCount} | Conversations: ${convCount}`);
    console.log(`   Type: ${isTest ? '🧪 TEST DATA' : '🚀 PRODUCTION'}`);
    console.log('');
  }

  console.log('\n💡 Legend:');
  console.log('   🧪 = Test data (safe to delete)');
  console.log('   🚀 = Production data (keep for launch)');
}

async function deleteClient(clientToken) {
  console.log(`\n🗑️  Deleting client: ${clientToken}...\n`);

  // Get client first
  const { data: client, error: fetchError } = await supabase
    .from('clients')
    .select('*')
    .eq('client_token', clientToken)
    .single();

  if (fetchError || !client) {
    console.error('❌ Client not found!');
    return;
  }

  console.log(`Found: ${client.business_name}`);
  console.log('⚠️  This will also delete:');

  const { count: faqCount } = await supabase
    .from('faq_entries')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', client.id);

  const { count: leadCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', client.id);

  const { count: convCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', client.id);

  console.log(`   - ${faqCount} FAQs`);
  console.log(`   - ${leadCount} leads`);
  console.log(`   - ${convCount} conversations`);

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise((resolve) => {
    readline.question('\n⚠️  Type "DELETE" to confirm: ', resolve);
  });

  readline.close();

  if (answer !== 'DELETE') {
    console.log('❌ Deletion cancelled');
    return;
  }

  // Delete client (cascades to all related data)
  const { error: deleteError } = await supabase
    .from('clients')
    .delete()
    .eq('id', client.id);

  if (deleteError) throw deleteError;

  console.log('\n✅ Client deleted successfully!');
  console.log('   All related FAQs, leads, and conversations were also deleted.');
}

async function deleteAllTestClients() {
  console.log('\n🧪 Deleting ALL test clients...\n');

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  const testClients = clients.filter(isTestClient);

  if (testClients.length === 0) {
    console.log('✅ No test clients found!');
    return;
  }

  console.log(`Found ${testClients.length} test clients:\n`);
  testClients.forEach(c => {
    console.log(`   🧪 ${c.business_name} (${c.notification_email})`);
  });

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise((resolve) => {
    readline.question(`\n⚠️  Delete ${testClients.length} test clients? Type "DELETE ALL": `, resolve);
  });

  readline.close();

  if (answer !== 'DELETE ALL') {
    console.log('❌ Deletion cancelled');
    return;
  }

  let deleted = 0;
  for (const client of testClients) {
    await supabase.from('clients').delete().eq('id', client.id);
    deleted++;
    console.log(`✅ Deleted ${deleted}/${testClients.length}: ${client.business_name}`);
  }

  console.log(`\n✅ Successfully deleted ${deleted} test clients!`);
}

async function keepProductionOnly() {
  console.log('\n🚀 Production-only mode...\n');

  const { data: clients } = await supabase
    .from('clients')
    .select('*');

  const testClients = clients.filter(isTestClient);
  const prodClients = clients.filter(c => !isTestClient(c));

  console.log(`📊 Current database:`);
  console.log(`   🧪 Test clients: ${testClients.length}`);
  console.log(`   🚀 Production clients: ${prodClients.length}`);
  console.log(`   📦 Total: ${clients.length}\n`);

  if (testClients.length === 0) {
    console.log('✅ Already production-only!');
    return;
  }

  console.log('Will DELETE:');
  testClients.forEach(c => {
    console.log(`   🧪 ${c.business_name} (${c.notification_email})`);
  });

  console.log('\nWill KEEP:');
  prodClients.forEach(c => {
    console.log(`   🚀 ${c.business_name} (${c.notification_email})`);
  });

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise((resolve) => {
    readline.question(`\n⚠️  Proceed with cleanup? Type "PRODUCTION": `, resolve);
  });

  readline.close();

  if (answer !== 'PRODUCTION') {
    console.log('❌ Cleanup cancelled');
    return;
  }

  for (const client of testClients) {
    await supabase.from('clients').delete().eq('id', client.id);
  }

  console.log(`\n✅ Database cleaned! Kept ${prodClients.length} production clients.`);
}

// Helper: Determine if client is test data
function isTestClient(client) {
  const testIndicators = [
    // Test email patterns
    client.notification_email?.toLowerCase().includes('test'),
    client.notification_email?.toLowerCase().includes('demo'),
    client.notification_email?.toLowerCase().includes('example'),

    // Test business names
    client.business_name?.toLowerCase().includes('test'),
    client.business_name?.toLowerCase().includes('demo'),
    client.business_name?.toLowerCase() === 'dj photography',

    // Test websites
    client.website_url?.toLowerCase().includes('test'),
    client.website_url?.toLowerCase().includes('example'),
    client.website_url?.toLowerCase().includes('localhost'),
  ];

  return testIndicators.some(indicator => indicator === true);
}

cleanupTestData();
