const supabase = require('../config/supabase');

async function checkSchema() {
  try {
    console.log('===== CHECKING FAQ_ENTRIES TABLE SCHEMA =====\n');

    // Get one FAQ entry to see its structure
    const { data: faq, error } = await supabase
      .from('faq_entries')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (!faq) {
      console.log('⚠️  No FAQ entries found in database');

      // Try to get table structure from PostgreSQL
      const { data: columns, error: schemaError } = await supabase
        .rpc('get_table_columns', { table_name: 'faq_entries' })
        .catch(() => null);

      console.log('\nAttempting to create a test FAQ to see schema...');

      // Let's just look at the database migrations to understand the schema
      console.log('\nPlease check database/migrations/ folder for table structure');
      return;
    }

    console.log('✅ Sample FAQ entry found:\n');
    console.log('Table columns:');
    Object.keys(faq).forEach(key => {
      console.log(`  - ${key}: ${typeof faq[key]} = ${JSON.stringify(faq[key])?.slice(0, 50)}...`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  } finally {
    process.exit(0);
  }
}

checkSchema();
