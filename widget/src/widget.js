/**
 * TechMayne Chat Widget
 * Embeddable chatbot for photographer websites
 */

(function() {
  'use strict';

  // Configuration
  const API_BASE_URL = 'http://localhost:3000/api'; // Change to production URL when deployed
  const CLIENT_TOKEN = document.currentScript.getAttribute('data-client-token');

  if (!CLIENT_TOKEN) {
    console.error('TechMayne: Missing data-client-token attribute');
    return;
  }

  // Generate unique visitor ID
  function getVisitorId() {
    let visitorId = localStorage.getItem('techmayne_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('techmayne_visitor_id', visitorId);
    }
    return visitorId;
  }

  const VISITOR_ID = getVisitorId();

  // Widget state
  let isOpen = false;
  let config = null;
  let messages = [];

  // Create widget HTML
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'techmayne-widget';
    widget.innerHTML = `
      <style>
        #techmayne-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        #techmayne-button {
          width: 60px;
          height: 60px;
          border-radius: 30px;
          background: var(--techmayne-accent, #6366f1);
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        #techmayne-button:hover {
          transform: scale(1.05);
        }

        #techmayne-button svg {
          width: 30px;
          height: 30px;
          fill: white;
        }

        #techmayne-chat {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 380px;
          height: 600px;
          max-height: calc(100vh - 120px);
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          display: none;
          flex-direction: column;
          overflow: hidden;
        }

        #techmayne-chat.open {
          display: flex;
        }

        #techmayne-header {
          background: var(--techmayne-accent, #6366f1);
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        #techmayne-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        #techmayne-close {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          line-height: 24px;
        }

        #techmayne-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .techmayne-message {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.4;
        }

        .techmayne-message.bot {
          background: #f3f4f6;
          color: #1f2937;
          align-self: flex-start;
        }

        .techmayne-message.user {
          background: var(--techmayne-accent, #6366f1);
          color: white;
          align-self: flex-end;
        }

        .techmayne-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }

        .techmayne-btn {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          text-align: left;
          transition: all 0.2s;
        }

        .techmayne-btn:hover {
          border-color: var(--techmayne-accent, #6366f1);
          background: #f9fafb;
        }

        #techmayne-input-area {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
        }

        #techmayne-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
        }

        #techmayne-input:focus {
          border-color: var(--techmayne-accent, #6366f1);
        }

        #techmayne-send {
          background: var(--techmayne-accent, #6366f1);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        #techmayne-send:hover {
          opacity: 0.9;
        }

        @media (max-width: 480px) {
          #techmayne-chat {
            width: calc(100vw - 40px);
            height: calc(100vh - 100px);
            bottom: 80px;
          }
        }
      </style>

      <button id="techmayne-button" aria-label="Open chat">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </button>

      <div id="techmayne-chat">
        <div id="techmayne-header">
          <h3 id="techmayne-title">Chat</h3>
          <button id="techmayne-close" aria-label="Close chat">&times;</button>
        </div>
        <div id="techmayne-messages"></div>
        <div id="techmayne-input-area">
          <input type="text" id="techmayne-input" placeholder="Type a message..." />
          <button id="techmayne-send">Send</button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    // Event listeners
    document.getElementById('techmayne-button').addEventListener('click', openChat);
    document.getElementById('techmayne-close').addEventListener('click', closeChat);
    document.getElementById('techmayne-send').addEventListener('click', sendMessage);
    document.getElementById('techmayne-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') sendMessage();
    });
  }

  // Load widget configuration
  async function loadConfig() {
    try {
      const response = await fetch(`${API_BASE_URL}/config/${CLIENT_TOKEN}`);
      config = await response.json();

      // Apply configuration
      if (config.accent_color) {
        document.documentElement.style.setProperty('--techmayne-accent', config.accent_color);
      }
      if (config.business_name) {
        document.getElementById('techmayne-title').textContent = config.business_name;
      }
    } catch (error) {
      console.error('TechMayne: Failed to load config', error);
    }
  }

  // Open chat
  function openChat() {
    isOpen = true;
    document.getElementById('techmayne-chat').classList.add('open');

    // Send initial message if no messages yet
    if (messages.length === 0) {
      sendToAPI('__START__');
    }
  }

  // Close chat
  function closeChat() {
    isOpen = false;
    document.getElementById('techmayne-chat').classList.remove('open');
  }

  // Send message
  async function sendMessage() {
    const input = document.getElementById('techmayne-input');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    input.value = '';

    // Send to API
    await sendToAPI(message);
  }

  // Send to API
  async function sendToAPI(message) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientToken: CLIENT_TOKEN,
          visitorId: VISITOR_ID,
          message: message
        })
      });

      const data = await response.json();

      // Add bot response
      addMessage(data.message, 'bot', data.buttons, data.inputType, data.placeholder);

    } catch (error) {
      console.error('TechMayne: API error', error);
      addMessage('Sorry, something went wrong. Please try again.', 'bot');
    }
  }

  // Add message to UI
  function addMessage(text, role, buttons = null, inputType = null, placeholder = null) {
    const messagesContainer = document.getElementById('techmayne-messages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `techmayne-message ${role}`;
    messageDiv.textContent = text;

    messagesContainer.appendChild(messageDiv);

    // Add buttons if provided
    if (buttons && buttons.length > 0) {
      const buttonsDiv = document.createElement('div');
      buttonsDiv.className = 'techmayne-buttons';

      buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.className = 'techmayne-btn';
        btn.textContent = button.text;
        btn.addEventListener('click', () => {
          addMessage(button.text, 'user');
          sendToAPI(button.action);
        });
        buttonsDiv.appendChild(btn);
      });

      messagesContainer.appendChild(buttonsDiv);
    }

    // Update input type and placeholder
    const input = document.getElementById('techmayne-input');
    if (inputType) {
      input.type = inputType;
    } else {
      input.type = 'text'; // Reset to default
    }

    if (placeholder) {
      input.placeholder = placeholder;
    } else {
      input.placeholder = 'Type a message...'; // Reset to default
    }

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Store message
    messages.push({ text, role });
  }

  // Initialize
  function init() {
    createWidget();
    loadConfig();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
