const apiKey = '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'; // Replace with your actual API key
const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const responseDiv = document.getElementById('response');
const conversationContext = "You are a human-like conversational AI agent. You will generate responses using information exclusively from the official websites of the FDA (Food and Drug Administration), CDC (Centers for Disease Control and Prevention), and NIH (National Institutes of Health).";
const historyDiv  = document.getElementById('history');


// Use let so we can replace the array when loading from storage
let conversationHistory = []; // [{role:'user'|'assistant', content:'...', ts: 1712345678901}]

const LS_KEY = 'conversationHistoryV1';

/* ---------- Utilities ---------- */

// Minimal HTML escape (+ newline -> <br>) for safe rendering
function escapeHtml(str) {
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#39;")
    .replace(/\n/g, '<br>');
}

// Save / load history (so it survives refresh)
function saveHistory() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(conversationHistory)); } catch {}
}

function loadHistory() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) conversationHistory = JSON.parse(saved);
  } catch {}
  renderHistory();
}

// Render the history panel from conversationHistory
function renderHistory() {
  if (!historyDiv) return;
  historyDiv.innerHTML = '';

  conversationHistory.forEach(({ role, content }) => {
    const row = document.createElement('div');
    row.className = `msg ${role}`;
    const who = role === 'user' ? 'You' : 'AI';
    row.innerHTML = `<span class="role">${who}:</span> <span class="text">${escapeHtml(content)}</span>`;
    historyDiv.appendChild(row);
  });

  // Auto-scroll to latest
  historyDiv.scrollTop = historyDiv.scrollHeight;
}

/* ---------- Main flow ---------- */

loadHistory();

sendButton.addEventListener('click', async () => {
  const rawUserMessage = userInput.value.trim();
  if (!rawUserMessage) return;

  // We only DISPLAY the user's raw message in history (no prepended context)
  conversationHistory.push({ role: 'user', content: rawUserMessage, ts: Date.now() });
  saveHistory();
  renderHistory();

  // Build the message sent to the API (keep your original behavior)
  const fullMessage = `${conversationContext} ${rawUserMessage}`;

  responseDiv.innerHTML = "Loading...";
  userInput.value = "";

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: fullMessage }]
      })
    });

    const data = await response.json();

    const botReply = data?.choices?.[0]?.message?.content ?? "(No content returned)";
    responseDiv.innerHTML = botReply;

    // Add bot reply to history and re-render
    conversationHistory.push({ role: 'assistant', content: botReply, ts: Date.now() });
    saveHistory();
    renderHistory();

    console.log("API raw response:", data);

  } catch (error) {
    console.error('Fetch error:', error);
    responseDiv.innerHTML = "Error occurred while fetching response.";
    // (Optional) also log the error line in history
    conversationHistory.push({ role: 'assistant', content: "Error occurred while fetching response.", ts: Date.now() });
    saveHistory();
    renderHistory();
  }
});

// Clear history (optional)
document.getElementById('clear-history')?.addEventListener('click', () => {
  conversationHistory = [];
  saveHistory();
  renderHistory();
});
