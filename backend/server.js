const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve widget files statically
const widgetPath = path.join(__dirname, 'widget/src');
console.log('Widget path:', widgetPath);
console.log('Widget path exists:', fs.existsSync(widgetPath));
if (fs.existsSync(widgetPath)) {
  console.log('Widget directory contents:', fs.readdirSync(widgetPath));
}
app.use('/widget', express.static(widgetPath));

// Routes
app.use('/api/chat', require('./routes/chat'));
app.use('/api/config', require('./routes/widget-config'));
app.use('/api/onboarding', require('./routes/onboarding'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
