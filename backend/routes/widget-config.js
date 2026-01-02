const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get widget configuration
router.get('/:clientToken', async (req, res) => {
  try {
    const { clientToken } = req.params;

    const { data: client, error } = await supabase
      .from('clients')
      .select('business_name, accent_color, logo_url')
      .eq('client_token', clientToken)
      .eq('is_active', true)
      .single();

    if (error || !client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
