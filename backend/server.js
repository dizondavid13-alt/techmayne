const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve widget files statically
app.use('/widget', express.static(path.join(__dirname, '../widget/src')));

// Routes
app.use('/api/chat', require('./routes/chat'));
app.use('/api/config', require('./routes/widget-config'));
app.use('/api/onboarding', require('./routes/onboarding'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint - shows which env vars are set
app.get('/debug/env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    PORT: process.env.PORT || 'NOT SET',
    SUPABASE_URL: process.env.SUPABASE_URL ? 'SET (hidden)' : 'NOT SET',
    SUPABASE_KEY: process.env.SUPABASE_KEY ? 'SET (hidden)' : 'NOT SET',
    RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET (hidden)' : 'NOT SET',
    FROM_EMAIL: process.env.FROM_EMAIL || 'NOT SET',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'NOT SET',
    allEnvKeys: Object.keys(process.env).filter(key => !key.includes('KEY') && !key.includes('SECRET'))
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TechMayne API running on http://localhost:${PORT}`);
});
