/* ============================================================
   Parti Wawasan Negara — Form Page Script
   Auto-sliding carousel + template form submit handler
   ============================================================ */

(function () {
  /* ---------- Carousel ---------- */
  var track = document.getElementById('carouselTrack');
  var dotsWrap = document.getElementById('carouselDots');
  var prevBtn = document.getElementById('carouselPrev');
  var nextBtn = document.getElementById('carouselNext');

  if (track) {
    var slides = track.children;
    var count = slides.length;
    var index = 0;
    var autoTimer = null;
    var AUTO_MS = 4200;

    for (var i = 0; i < count; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Slaid ' + (i + 1));
      if (i === 0) dot.classList.add('is-active');
      (function (idx) {
        dot.addEventListener('click', function () { goTo(idx); restartAuto(); });
      })(i);
      dotsWrap.appendChild(dot);
    }

    function render() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      var dots = dotsWrap.children;
      for (var d = 0; d < dots.length; d++) {
        dots[d].classList.toggle('is-active', d === index);
      }
    }

    function goTo(newIndex) {
      index = (newIndex + count) % count;
      render();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function startAuto() {
      autoTimer = setInterval(next, AUTO_MS);
    }
    function restartAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    if (nextBtn) nextBtn.addEventListener('click', function () { next(); restartAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restartAuto(); });

    var reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    render();
    if (!reduceMotion) startAuto();
  }

  /* ---------- Form (template — no backend yet) ---------- */
  var form = document.getElementById('joinForm');
  var status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        status.textContent = 'Sila lengkapkan ruangan wajib sebelum menghantar.';
        status.className = 'form-status is-error';
        return;
      }

      // Placeholder only — replace with real submission logic later
      // (e.g. fetch() to a backend / form service).
      status.textContent = 'Terima kasih. Borang anda telah diterima (templat sementara).';
      status.className = 'form-status is-success';
      form.reset();
    });
  }
})();
