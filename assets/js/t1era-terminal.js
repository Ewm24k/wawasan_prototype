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
    input.value = '';

    // Snapshot of PRIOR turns only — the current message is sent
    // separately as "message", so it must not also be in "history"
    // or the backend ends up seeing it twice and loses track of
    // what's actually new.
    var priorHistory = history.slice(-10);

    busy = true;
    if (sendBtn) sendBtn.disabled = true;
    var pending = appendLine('menaip…', 'pending');

    fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, history: priorHistory })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Terminal request failed: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        pending.remove();
        var reply = (data && data.reply) ? data.reply : 'Maaf, tiada respons diterima.';
        appendLine(reply, 'ai');

        // Only now, once both sides of the exchange are known, do
        // they get added to history together — keeps user/assistant
        // turns paired and in order for next time.
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: reply });

        if (data && data.location && window.T1ERA_MAP) {
          // Real coordinates get printed once the map's own geocoding
          // finishes — see the 'zv:location-result' listener below.
          // We never let the AI state numbers itself (it can't know
          // them accurately); the actual search result is the only
          // source of truth for coordinates.
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

  // The map (wawasanverse.js) broadcasts the outcome of every location
  // lookup with a "source" tag. We only care about ones triggered by
  // this terminal's own AI replies — list clicks / search bar lookups
  // stay silent here.
  window.addEventListener('zv:location-result', function (e) {
    var d = e.detail;
    if (!d || d.source !== 'ai') return;

    if (d.matched) {
      appendLine(
        '📍 ' + d.name + ' — Koordinat: ' + d.lat.toFixed(5) + ', ' + d.lng.toFixed(5),
        'ai'
      );
    } else {
      appendLine(
        '📍 Tiada padanan tepat untuk "' + d.name + '" — peta ditunjukkan pada anggaran kawasan berkenaan.',
        'ai'
      );
    }
  });
})();
