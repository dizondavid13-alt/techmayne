const { createClient } = require('@supabase/supabase-js');

// Load dotenv only in development (Railway provides env vars natively)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Temporarily log all environment variables for debugging
console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'SET' : 'MISSING');
console.log('All env var names:', Object.keys(process.env).join(', '));
console.log('=== END DEBUG ===');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('WARNING: Missing Supabase environment variables!');
  console.error('Using dummy values - app will not work correctly!');
  // Temporarily allow app to start for debugging
  process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://dummy.supabase.co';
  process.env.SUPABASE_KEY = process.env.SUPABASE_KEY || 'dummy-key';
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;
