/**
 * TechMayne Chat Widget v2.0
 * Polished embeddable chatbot for photographer websites
 * Matches demo page quality with all UX improvements
 */

(function() {
  'use strict';

  // Configuration
  const API_BASE_URL = 'https://techmayne-production.up.railway.app/api';
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
  let conversationClosed = false;

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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        #techmayne-button {
          width: 64px;
          height: 64px;
          border-radius: 32px;
          background: linear-gradient(135deg, var(--techmayne-accent, #1E6FD9), var(--techmayne-accent-dark, #1557B0));
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(30, 111, 217, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        #techmayne-button:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 12px 32px rgba(30, 111, 217, 0.4);
        }

        #techmayne-button svg {
          width: 32px;
          height: 32px;
          fill: white;
        }

        #techmayne-chat {
          position: absolute;
          bottom: 88px;
          right: 0;
          width: 400px;
          height: 600px;
          max-height: calc(100vh - 120px);
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          display: none;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        #techmayne-chat.open {
          display: flex;
        }

        #techmayne-header {
          background: linear-gradient(135deg, var(--techmayne-accent, #1E6FD9), var(--techmayne-accent-dark, #1557B0));
          color: white;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }

        #techmayne-header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .techmayne-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          position: relative;
          z-index: 1;
        }

        .techmayne-header-text {
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .techmayne-header-text h3 {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
        }

        .techmayne-header-subtitle {
          font-size: 13px;
          opacity: 0.95;
          margin: 4px 0 0 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .techmayne-status-dot {
          width: 8px;
          height: 8px;
          background: #4ADE80;
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        #techmayne-close {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 8px;
          width: 32px;
          height: 32px;
          line-height: 16px;
          border-radius: 8px;
          transition: all 0.2s;
          position: relative;
          z-index: 1;
        }

        #techmayne-close:hover {
          background: rgba(255,255,255,0.3);
        }

        #techmayne-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: #F9FAFB;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        #techmayne-messages::-webkit-scrollbar {
          width: 6px;
        }

        #techmayne-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        #techmayne-messages::-webkit-scrollbar-thumb {
          background: #D1D5DB;
          border-radius: 3px;
        }

        #techmayne-messages::-webkit-scrollbar-thumb:hover {
          background: #9CA3AF;
        }

        .techmayne-message-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .techmayne-message-wrapper {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .techmayne-message-wrapper.user {
          justify-content: flex-end;
        }

        .techmayne-bot-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--techmayne-accent, #1E6FD9), var(--techmayne-accent-dark, #1557B0));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
          color: white;
        }

        .techmayne-message-bubble {
          max-width: 100%;
          padding: 14px 18px;
          border-radius: 18px;
          font-size: 15px;
          line-height: 1.5;
          animation: fadeIn 0.3s ease-out;
          word-wrap: break-word;
          white-space: normal;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .techmayne-message-bubble.bot {
          background: white;
          color: #0A2540;
          border-top-left-radius: 6px;
          border: 1px solid #E1E4E8;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .techmayne-message-bubble.user {
          background: linear-gradient(135deg, var(--techmayne-accent, #1E6FD9), var(--techmayne-accent-dark, #1557B0));
          color: white;
          border-top-right-radius: 6px;
          margin-left: auto;
          box-shadow: 0 2px 8px rgba(30, 111, 217, 0.2);
        }

        .techmayne-message-bubble p {
          margin: 0;
        }

        .techmayne-message-time {
          font-size: 11px;
          color: #8B8F97;
          margin-top: 4px;
          padding-left: 48px;
        }

        .techmayne-message-wrapper.user .techmayne-message-time {
          text-align: right;
          padding-left: 0;
          padding-right: 0;
        }

        .techmayne-quick-replies {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 8px;
          padding-left: 48px;
        }

        .techmayne-quick-reply-btn {
          background: white;
          border: 2px solid #E1E4E8;
          color: #0A2540;
          padding: 12px 18px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }

        .techmayne-quick-reply-btn:hover:not(:disabled) {
          border-color: var(--techmayne-accent, #1E6FD9);
          background: linear-gradient(135deg, rgba(30, 111, 217, 0.05), rgba(21, 87, 176, 0.05));
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(30, 111, 217, 0.15);
        }

        .techmayne-quick-reply-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .techmayne-typing-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 0;
        }

        .techmayne-typing-dots {
          display: flex;
          gap: 4px;
          padding: 14px 18px;
          background: white;
          border-radius: 18px;
          border-top-left-radius: 6px;
          border: 1px solid #E1E4E8;
        }

        .techmayne-typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #8B8F97;
          animation: typing 1.4s infinite;
        }

        .techmayne-typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .techmayne-typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-8px);
          }
        }

        #techmayne-input-area {
          padding: 20px;
          border-top: 1px solid #E1E4E8;
          background: white;
          display: flex;
          gap: 12px;
        }

        #techmayne-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #E1E4E8;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
        }

        #techmayne-input:focus {
          border-color: var(--techmayne-accent, #1E6FD9);
          box-shadow: 0 0 0 3px rgba(30, 111, 217, 0.1);
        }

        #techmayne-input:disabled {
          background: #F3F4F6;
          cursor: not-allowed;
        }

        #techmayne-send {
          background: linear-gradient(135deg, var(--techmayne-accent, #1E6FD9), var(--techmayne-accent-dark, #1557B0));
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(30, 111, 217, 0.2);
        }

        #techmayne-send:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(30, 111, 217, 0.3);
        }

        #techmayne-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          #techmayne-widget {
            bottom: 16px;
            right: 16px;
            left: 16px;
          }

          #techmayne-chat {
            width: 100%;
            left: 0;
            right: 0;
            bottom: 88px;
            height: calc(100vh - 120px);
            max-height: calc(100vh - 120px);
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
          <div class="techmayne-avatar">📸</div>
          <div class="techmayne-header-text">
            <h3 id="techmayne-title">Chat</h3>
            <div class="techmayne-header-subtitle">
              <span class="techmayne-status-dot"></span>
              <span>Online now</span>
            </div>
          </div>
          <button id="techmayne-close" aria-label="Close chat">&times;</button>
        </div>
        <div id="techmayne-messages"></div>
        <div id="techmayne-input-area">
          <input type="text" id="techmayne-input" placeholder="Type your message..." />
          <button id="techmayne-send">Send</button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    // Event listeners
    document.getElementById('techmayne-button').addEventListener('click', openChat);
    document.getElementById('techmayne-close').addEventListener('click', closeChat);
    document.getElementById('techmayne-send').addEventListener('click', handleTextSend);
    document.getElementById('techmayne-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleTextSend();
      }
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
        // Create darker shade for gradient
        const darkerShade = shadeColor(config.accent_color, -20);
        document.documentElement.style.setProperty('--techmayne-accent-dark', darkerShade);
      }
      if (config.business_name) {
        document.getElementById('techmayne-title').textContent = config.business_name;
      }
    } catch (error) {
      console.error('TechMayne: Failed to load config', error);
    }
  }

  // Utility: Darken/lighten color
  function shadeColor(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    const RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
  }

  // Open chat
  function openChat() {
    isOpen = true;
    document.getElementById('techmayne-chat').classList.add('open');

    // Send initial message if this is the first time
    const messagesContainer = document.getElementById('techmayne-messages');
    if (messagesContainer.children.length === 0) {
      sendToAPI('__START__');
    }
  }

  // Close chat
  function closeChat() {
    isOpen = false;
    document.getElementById('techmayne-chat').classList.remove('open');
  }

  // Handle text input send
  async function handleTextSend() {
    const input = document.getElementById('techmayne-input');
    const sendBtn = document.getElementById('techmayne-send');
    const message = input.value.trim();

    if (!message) return;

    // Clear input
    input.value = '';

    // Add user message
    addMessage(message, 'user');

    // Disable input temporarily
    input.disabled = true;
    sendBtn.disabled = true;

    // Show typing
    showTyping();

    // Check if conversation was closed - typing restarts it
    if (conversationClosed) {
      conversationClosed = false;
    }

    // Send to API
    const response = await sendToAPI(message);

    // Hide typing
    hideTyping();

    // Add bot response
    if (response.message) {
      addMessage(response.message, 'bot');
    }

    // Add buttons if any
    if (response.buttons && response.buttons.length > 0) {
      addQuickReplies(response.buttons);
    }

    // Re-enable input if text is expected
    if (response.inputType === 'text' || response.inputType === 'email' || response.inputType === 'tel') {
      input.disabled = false;
      sendBtn.disabled = false;
      input.type = response.inputType || 'text';
      input.placeholder = response.placeholder || 'Type your message...';
      input.focus();
    } else {
      input.disabled = true;
      sendBtn.disabled = true;
    }
  }

  // Handle quick reply button click
  async function handleQuickReply(action, displayText) {
    const input = document.getElementById('techmayne-input');
    const sendBtn = document.getElementById('techmayne-send');

    // Disable all quick reply buttons
    const allButtons = document.querySelectorAll('.techmayne-quick-reply-btn');
    allButtons.forEach(btn => btn.disabled = true);

    // Add user message
    addMessage(displayText, 'user');

    // Show typing indicator
    showTyping();

    // Check if conversation was closed and user clicked a button - this restarts it
    if (conversationClosed) {
      conversationClosed = false;
      input.disabled = false;
      sendBtn.disabled = false;
    }

    // Send to API
    const response = await sendToAPI(action);

    // Hide typing indicator
    hideTyping();

    // Check if conversation is being closed
    if (action === 'complete') {
      conversationClosed = true;
      // Keep input ENABLED so user can type to restart
      input.disabled = false;
      sendBtn.disabled = false;
      input.placeholder = "Type to start a new conversation...";
      input.value = '';
      input.focus();
    }

    // Add bot response
    if (response.message) {
      addMessage(response.message, 'bot');
    }

    // Add buttons if any
    if (response.buttons && response.buttons.length > 0) {
      addQuickReplies(response.buttons);
    }

    // Enable input if text is expected (but not if conversation just closed)
    if (!conversationClosed && (response.inputType === 'text' || response.inputType === 'email' || response.inputType === 'tel')) {
      input.disabled = false;
      sendBtn.disabled = false;
      input.type = response.inputType || 'text';
      input.placeholder = response.placeholder || 'Type your message...';
      input.focus();
    } else if (!conversationClosed) {
      // Disable input when buttons are expected (but not if conversation closed - we want to keep it enabled)
      input.disabled = true;
      sendBtn.disabled = true;
    }
  }

  // Show typing indicator
  function showTyping() {
    const messagesContainer = document.getElementById('techmayne-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'techmayne-message-group typing-indicator';
    typingDiv.innerHTML = `
      <div class="techmayne-typing-indicator">
        <div class="techmayne-bot-avatar">📸</div>
        <div class="techmayne-typing-dots">
          <div class="techmayne-typing-dot"></div>
          <div class="techmayne-typing-dot"></div>
          <div class="techmayne-typing-dot"></div>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Hide typing indicator
  function hideTyping() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
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

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('TechMayne: API error', error);
      return {
        message: "Sorry, I'm having trouble connecting. Please try again in a moment.",
        buttons: []
      };
    }
  }

  // Add message to UI
  function addMessage(text, role) {
    const messagesContainer = document.getElementById('techmayne-messages');
    const messageGroup = document.createElement('div');
    messageGroup.className = 'techmayne-message-group';

    const wrapperClass = role === 'user' ? 'techmayne-message-wrapper user' : 'techmayne-message-wrapper';
    const avatarHtml = role === 'bot' ? '<div class="techmayne-bot-avatar">📸</div>' : '';

    messageGroup.innerHTML = `
      <div class="${wrapperClass}">
        ${role === 'bot' ? avatarHtml : ''}
        <div>
          <div class="techmayne-message-bubble ${role}">
            <p>${text}</p>
          </div>
          <div class="techmayne-message-time" style="${role === 'user' ? 'text-align: right;' : ''}">Just now</div>
        </div>
      </div>
    `;

    messagesContainer.appendChild(messageGroup);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Add quick reply buttons
  function addQuickReplies(buttons) {
    const messagesContainer = document.getElementById('techmayne-messages');
    const lastMessageGroup = messagesContainer.lastElementChild;
    if (!lastMessageGroup) return;

    const quickRepliesDiv = document.createElement('div');
    quickRepliesDiv.className = 'techmayne-quick-replies';

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.className = 'techmayne-quick-reply-btn';
      button.textContent = btn.text;
      button.onclick = () => handleQuickReply(btn.action, btn.text);
      quickRepliesDiv.appendChild(button);
    });

    lastMessageGroup.appendChild(quickRepliesDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
