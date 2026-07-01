/* ============================================================
   Parti Wawasan Negara — Landing Page Script
   - Mobile nav overlay: proper iOS-safe scroll lock, focus trap,
     Escape-to-close, focus restore on close.
   - Form popup modal: same shared scroll-lock utility.
   ============================================================ */

(function () {

  /* ---------- Shared iOS-safe body scroll lock ----------
     Plain `overflow:hidden` on body does not reliably block
     touch scrolling on iOS Safari. The documented, reliable fix
     is to pin the body with position:fixed and a negative top
     offset equal to the current scroll position, then restore it
     on unlock. A counter supports the (rare) case where the nav
     overlay and the form modal are both open at once. */
  var lockCount = 0;
  var savedScrollY = 0;

  function lockBodyScroll() {
    if (lockCount === 0) {
      savedScrollY = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = (-savedScrollY) + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    }
    lockCount++;
  }

  function unlockBodyScroll() {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      window.scrollTo(0, savedScrollY);
    }
  }

  /* ---------- Focus trap helper ----------
     Keeps Tab / Shift+Tab cycling within the given container
     while it is the active overlay. */
  function getFocusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll('a[href], button:not([disabled])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  function trapFocus(container, evt) {
    if (evt.key !== 'Tab') return;
    var focusable = getFocusable(container);
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (evt.shiftKey && document.activeElement === first) {
      evt.preventDefault();
      last.focus();
    } else if (!evt.shiftKey && document.activeElement === last) {
      evt.preventDefault();
      first.focus();
    }
  }

  /* ---------- Mobile nav overlay ---------- */
  var toggle = document.getElementById('navToggle');
  var navOverlay = document.getElementById('primaryNav');

  if (toggle && navOverlay) {
    var navLastFocused = null;

    function navKeydown(e) {
      if (e.key === 'Escape') {
        closeNav();
      } else {
        trapFocus(navOverlay, e);
      }
    }

    function openNav() {
      navLastFocused = document.activeElement;
      navOverlay.classList.add('is-open');
      navOverlay.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Tutup menu');
      lockBodyScroll();
      document.addEventListener('keydown', navKeydown);

      // Move focus into the overlay, per standard dialog pattern.
      var focusable = getFocusable(navOverlay);
      if (focusable.length) focusable[0].focus();
    }

    function closeNav() {
      navOverlay.classList.remove('is-open');
      navOverlay.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Buka menu');
      unlockBodyScroll();
      document.removeEventListener('keydown', navKeydown);

      if (navLastFocused && navLastFocused.focus) {
        navLastFocused.focus();
      } else {
        toggle.focus();
      }
    }

    toggle.addEventListener('click', function () {
      if (navOverlay.classList.contains('is-open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    var closeBtn = document.getElementById('navOverlayClose');
    if (closeBtn) closeBtn.addEventListener('click', closeNav);

    // Any link tapped inside the overlay closes it. The "Sertai
    // Kami" link is also intercepted separately below to open the
    // form popup instead of navigating.
    navOverlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    // Safety net: if the viewport is resized past the mobile
    // breakpoint while the overlay is open (e.g. rotating a
    // tablet), release the scroll lock so desktop browsing isn't
    // left stuck.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 720 && navOverlay.classList.contains('is-open')) {
        closeNav();
      }
    });
  }

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
  var modalBackdrop = document.getElementById('formModalBackdrop');
  var modalCloseBtn = document.getElementById('formModalClose');
  var joinTriggers = document.querySelectorAll('a[href="form.html"]');
  var modalLastFocused = null;

  function modalKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
    } else {
      trapFocus(modal, e);
    }
  }

  function openModal() {
    if (!modal) return;
    modalLastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lockBodyScroll();
    document.addEventListener('keydown', modalKeydown);
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    unlockBodyScroll();
    document.removeEventListener('keydown', modalKeydown);
    if (modalLastFocused && modalLastFocused.focus) modalLastFocused.focus();
  }

  // Any on-page link that points to form.html opens the popup
  // instead of navigating away.
  joinTriggers.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

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
