const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { BotFlow, STATES } = require('../services/botFlow');

// Handle incoming messages
router.post('/message', async (req, res) => {
  try {
    const { clientToken, visitorId, message } = req.body;

    if (!clientToken || !visitorId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get client ID from token
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('client_token', clientToken)
      .eq('is_active', true)
      .single();

    if (clientError || !client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Find or create conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('client_id', client.id)
      .eq('visitor_id', visitorId)
      .eq('completed', false)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Handle initial start message
    const isStart = message === '__START__';

    if (!conversation) {
      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          client_id: client.id,
          visitor_id: visitorId,
          current_state: STATES.WELCOME,
          collected_data: {}
        })
        .select()
        .single();

      if (convError) throw convError;
      conversation = newConv;
    }

    // Don't save the __START__ message
    if (!isStart) {
      // Save user message
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          role: 'user',
          content: message
        });
    }

    // Get bot response
    const botFlow = new BotFlow(client.id, conversation.id);
    const response = await botFlow.getResponse(
      isStart ? 'welcome' : message,
      isStart ? STATES.WELCOME : conversation.current_state,
      conversation.collected_data || {}
    );

    // Save bot message
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        role: 'bot',
        content: response.message,
        metadata: {
          buttons: response.buttons,
          inputType: response.inputType,
          placeholder: response.placeholder
        }
      });

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Sorry, something went wrong. Please try again.'
    });
  }
});

module.exports = router;
