const { createClient } = require('@supabase/supabase-js');

// Load dotenv only in development (Railway provides env vars natively)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('Environment variables check:');
  console.error('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
  console.error('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'SET' : 'MISSING');
  throw new Error('Missing Supabase environment variables!');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;
