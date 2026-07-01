/* ============================================================
   Parti Wawasan Negara — Landing Page Script
   Mobile nav toggle + close-on-link-click
   ============================================================ */

(function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  if (!toggle || !nav) return;

  function closeNav() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Buka menu');
  }

  function openNav() {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Tutup menu');
  }

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.contains('is-open');
    if (isOpen) { closeNav(); } else { openNav(); }
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  // Sticky header shadow on scroll
  var header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 8) {
        header.style.boxShadow = '0 6px 18px -12px rgba(10,42,94,0.35)';
      } else {
        header.style.boxShadow = 'none';
      }
    }, { passive: true });
  }

  /* ---------- Form popup modal ---------- */
  var modal = document.getElementById('formModal');
  var backdrop = document.getElementById('formModalBackdrop');
  var closeBtn = document.getElementById('formModalClose');
  var joinTriggers = document.querySelectorAll('a[href="form.html"]');
  var lastFocused = null;

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  // Any on-page link that points to form.html opens the popup
  // instead of navigating away.
  joinTriggers.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // The embedded form.html (?modal=1) posts this message when the
  // visitor finishes or cancels — hands control back to landing page.
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'wawasan:closeForm') {
      closeModal();
    }
  });

  // Form appears automatically when the landing page first loads.
  openModal();
})();
