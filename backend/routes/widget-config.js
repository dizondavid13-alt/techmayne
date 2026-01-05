const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const cache = require('../config/cache');

// Get widget configuration (with caching for Railway efficiency)
router.get('/:clientToken', async (req, res) => {
  try {
    const { clientToken } = req.params;
    const cacheKey = `widget_config:${clientToken}`;

    // Try cache first (5-minute TTL)
    const cached = cache.get(cacheKey);
    if (cached) {
      // Set cache headers to allow browser caching for 5 minutes
      res.set('Cache-Control', 'public, max-age=300');
      return res.json(cached);
    }

    // Cache miss - fetch from database
    const { data: client, error } = await supabase
      .from('clients')
      .select('business_name, accent_color, logo_url')
      .eq('client_token', clientToken)
      .eq('is_active', true)
      .single();

    if (error || !client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Cache for 5 minutes (300 seconds)
    cache.set(cacheKey, client, 300);

    // Set cache headers
    res.set('Cache-Control', 'public, max-age=300');
    res.json(client);
  } catch (error) {
    console.error('Config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
