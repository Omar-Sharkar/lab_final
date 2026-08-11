const customerChatbotPage = {
  async render() {
    const sessionRes = await window.api.auth.getSession();
    const user = sessionRes.user;

    let history = [];
    if (user) {
      const histRes = await window.api.ai.getChatHistory(user.id);
      if (histRes.success) history = histRes.messages;
    }

    return `
      <div class="container py-4">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card custom-card">
              <!-- Chat Header -->
              <div class="card-header bg-dark text-white p-3 d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-3">
                  <div class="fs-2">🤖</div>
                  <div>
                    <h5 class="fw-bold mb-0">Smart Resto AI Assistant</h5>
                    <small class="text-white-50">Powered by Google Gemini 2.0 Flash</small>
                  </div>
                </div>
                <span class="badge bg-success rounded-pill px-3 py-2"><i class="bi bi-circle-fill me-1 small"></i> Online</span>
              </div>

              <!-- Chat Message History Container -->
              <div class="card-body p-0">
                <div id="chat-box" class="chat-box">
                  <div class="chat-bubble chat-bubble-ai">
                    👋 Hello! I'm your AI Restaurant Assistant. Ask me anything about our menu, prices, vegetarian dishes, popular recommendations, or your current order status!
                  </div>

                  ${history.map(msg => `
                    <div class="chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}">
                      ${msg.message}
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Quick Suggestion Chips -->
              <div class="px-3 pt-2 pb-1 bg-light border-top">
                <div class="d-flex flex-wrap gap-2 small">
                  <button class="btn btn-sm btn-outline-secondary rounded-pill chip-btn">What foods are available?</button>
                  <button class="btn btn-sm btn-outline-secondary rounded-pill chip-btn">Which foods are vegetarian?</button>
                  <button class="btn btn-sm btn-outline-secondary rounded-pill chip-btn">What is the price of Chicken Burger?</button>
                  <button class="btn btn-sm btn-outline-secondary rounded-pill chip-btn">What do you recommend?</button>
                  <button class="btn btn-sm btn-outline-secondary rounded-pill chip-btn">What is my order status?</button>
                </div>
              </div>

              <!-- Chat Input Form -->
              <div class="card-footer p-3 bg-white border-top">
                <form id="chat-form" class="d-flex gap-2">
                  <input type="text" id="chat-input" class="form-control rounded-pill px-4" placeholder="Ask about menu, prices, order status..." required autocomplete="off">
                  <button type="submit" id="send-chat-btn" class="btn btn-primary rounded-pill px-4">
                    <i class="bi bi-send-fill"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');

    const scrollToBottom = () => {
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    };
    scrollToBottom();

    const appendMessage = (text, role) => {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`;
      bubble.textContent = text;
      chatBox.appendChild(bubble);
      scrollToBottom();
    };

    const handleSend = async (messageText) => {
      if (!messageText.trim()) return;

      appendMessage(messageText, 'user');
      chatInput.value = '';

      // Typing Indicator
      const typingEl = document.createElement('div');
      typingEl.className = 'chat-bubble chat-bubble-ai fst-italic text-muted';
      typingEl.id = 'typing-indicator';
      typingEl.innerHTML = `<span class="spinner-grow spinner-grow-sm me-2"></span>AI is typing...`;
      chatBox.appendChild(typingEl);
      scrollToBottom();

      sendBtn.disabled = true;

      const res = await window.api.ai.chat(null, messageText);
      
      const typingIndicator = document.getElementById('typing-indicator');
      if (typingIndicator) typingIndicator.remove();

      sendBtn.disabled = false;

      if (res.success) {
        appendMessage(res.reply, 'assistant');
      } else {
        appendMessage(`Sorry, I ran into an issue: ${res.error}`, 'assistant');
      }
    };

    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSend(chatInput.value);
      });
    }

    // Quick Chip Buttons Handler
    document.querySelectorAll('.chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        handleSend(chip.textContent.trim());
      });
    });
  }
};
