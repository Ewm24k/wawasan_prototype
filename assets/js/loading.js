/* ============================================================
   Parti Wawasan Negara — Loading Page Script
   Typewriter cycle across 4 phases, total runtime ~7 seconds,
   then redirect to landing.html
   ============================================================ */

(function () {
  var textEl = document.getElementById('loaderText');
  var cursorEl = document.getElementById('loaderCursor');
  var loaderEl = document.getElementById('loader');
  var barFill = document.getElementById('loaderBarFill');

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var GREETING = 'SELAMAT DATANG KE PARTI WAWASAN';
  var LOADING = 'Loading please wait...';
  var PREPARING = 'Preparing form, please wait....';

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function typeText(el, text, totalMs) {
    if (reduceMotion) {
      el.textContent = text;
      return Promise.resolve();
    }
    var delay = Math.max(14, totalMs / text.length);
    el.textContent = '';
    var i = 0;
    return new Promise(function (resolve) {
      (function step() {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          setTimeout(step, delay);
        } else {
          resolve();
        }
      })();
    });
  }

  function eraseText(el, totalMs) {
    if (reduceMotion) {
      el.textContent = '';
      return Promise.resolve();
    }
    var text = el.textContent;
    var len = text.length;
    if (len === 0) return Promise.resolve();
    var delay = Math.max(10, totalMs / len);
    return new Promise(function (resolve) {
      (function step() {
        if (text.length > 0) {
          text = text.slice(0, -1);
          el.textContent = text;
          setTimeout(step, delay);
        } else {
          resolve();
        }
      })();
    });
  }

  function goToLanding() {
    loaderEl.classList.add('is-leaving');
    setTimeout(function () {
      window.location.href = 'landing.html';
    }, 320);
  }

  async function run() {
    // Progress bar fills over the full 7s window.
    requestAnimationFrame(function () {
      barFill.style.width = '100%';
    });

    try {
      // Phase 1: greeting
      await typeText(textEl, GREETING, 900);
      await wait(480);
      await eraseText(textEl, 280);

      // Phase 2: loading
      await typeText(textEl, LOADING, 520);
      await wait(380);
      await eraseText(textEl, 240);

      // Phase 3: greeting again
      await typeText(textEl, GREETING, 900);
      await wait(380);
      await eraseText(textEl, 280);

      // Phase 4: preparing form
      await typeText(textEl, PREPARING, 900);
      await wait(560);
    } catch (e) {
      // Fail safe — proceed regardless of animation errors.
    }

    goToLanding();
  }

  // Hard safety net: never let the loader trap the visitor
  // longer than ~7.6s even if something above stalls.
  var safety = setTimeout(goToLanding, 7600);

  run().then(function () {
    clearTimeout(safety);
  });
})();
