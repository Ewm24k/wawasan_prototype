/* ============================================================
   T1ERA Terminal — standalone widget script.
   Kept separate from wawasanverse.js. Only touches the map
   through the small window.T1ERA_MAP.flyToPlace() hook that
   wawasanverse.js exposes — no shared internals.

   This file only handles UI + talking to the backend endpoint
   below. The AI persona, system prompt, and the actual call to
   the language model all live server-side in
   netlify/functions/t1era-chat.js — never in client-side code,
   since that's the only place an API key can be kept secret.
   ============================================================ */

(function () {
  var CHAT_ENDPOINT = '/.netlify/functions/t1era-chat';

  var toggle = document.getElementById('t1eraToggle');
  var panel = document.getElementById('t1eraPanel');
  var log = document.getElementById('t1eraLog');
  var form = document.getElementById('t1eraForm');
  var input = document.getElementById('t1eraInput');
  var sendBtn = form ? form.querySelector('.t1era__send') : null;

  if (!toggle || !panel || !form || !input || !log) return;

  var history = []; // [{role:'user'|'assistant', content:'...'}, ...]
  var busy = false;

  toggle.addEventListener('click', function () {
    var isOpen = panel.hidden === false;
    panel.hidden = isOpen;
    toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    if (!isOpen) input.focus();
  });

  function appendLine(text, kind) {
    var p = document.createElement('p');
    p.className = 't1era__line t1era__line--' + kind;
    p.textContent = text;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
    return p;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var message = input.value.trim();
    if (!message || busy) return;

    appendLine(message, 'user');
    history.push({ role: 'user', content: message });
    input.value = '';

    busy = true;
    if (sendBtn) sendBtn.disabled = true;
    var pending = appendLine('menaip…', 'pending');

    fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, history: history.slice(-10) })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Terminal request failed: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        pending.remove();
        var reply = (data && data.reply) ? data.reply : 'Maaf, tiada respons diterima.';
        appendLine(reply, 'ai');
        history.push({ role: 'assistant', content: reply });

        if (data && data.location && window.T1ERA_MAP) {
          window.T1ERA_MAP.flyToPlace(data.location, data.dun || null);
        }
      })
      .catch(function () {
        pending.remove();
        appendLine('Sambungan ke T1ERA terganggu. Cuba lagi sebentar.', 'error');
      })
      .finally(function () {
        busy = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
      });
  });
})();
