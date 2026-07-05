/* ============================================================
   Parti Wawasan Negara — Form Page Script
   - Header image carousel (supports 4-6 images)
   - Testimoni (AJK & members) carousel
   - Works standalone (full page) AND embedded as a popup
     inside landing.html via <iframe src="form.html?modal=1">
   ============================================================ */

(function () {
  /* ---------- Header carousel images (edit this array: 4-6 entries) ---------- */
  // Swap the `image` paths for real campaign photos any time —
  // just drop files into assets/images/carousel/ and update the path.
  var CAROUSEL_SLIDES = [
    {
      image:
        "assets/images/carousel/ChatGPT Image Jun 30, 2026, 03_03_25 PM (1).png",
      title: "SERTAI PERJUANGAN KAMI",
      text: "Jadi sebahagian daripada suara rakyat Sabak Bernam",
    },
    {
      image:
        "assets/images/carousel/ChatGPT Image Jun 30, 2026, 03_03_33 PM.png",
      title: "BERSAMA MEMBINA SABAK BERNAM",
      text: "Pembangunan yang saksama untuk semua mukim",
    },
    {
      image: "assets/images/carousel/carousel-3.jpg",
      title: "SUARA RAKYAT, PILIHAN RAKYAT",
      text: "Daftar hari ini dan sertai gerakan perubahan",
    },
    {
      image: "assets/images/carousel/carousel-4.jpg",
      title: "BELIA UNTUK PERUBAHAN",
      text: "Peluang dan latihan kemahiran untuk generasi muda",
    },
    // Add up to 2 more objects here for a 5th / 6th image.
  ];

  /* ---------- Testimoni (AJK & members) — edit freely ----------
     `avatar` is a placeholder cartoon avatar for now. Swap each
     `avatar` path for a real profile photo later — same field,
     just point it at the new image. */
  var TESTIMONI = [
    {
      avatar: "assets/images/testimoni/avatar2.png",
      name: "Ahmad Zulkifli",
      role: "AJK Cawangan",
      quote:
        "Wawasan Negara bawa perubahan sebenar untuk peniaga kecil macam saya. Bantuan bukan sekadar janji.",
    },
    {
      avatar: "assets/images/testimoni/avatar1.png",
      name: "Siti Nur Aisyah",
      role: "Ahli",
      quote:
        "Saya rasa didengari. AJK sentiasa turun padang dan dengar masalah kampung kami satu persatu.",
    },
    {
      avatar: "assets/images/testimoni/avatar5.png",
      name: "Ravi a/l Muthu",
      role: "Penyokong",
      quote:
        "Program belia mereka bagi anak saya peluang belajar kemahiran baru dan harapan untuk masa depan.",
    },
    {
      avatar: "assets/images/testimoni/avatar3.png",
      name: "Fatimah Zahra",
      role: "Ahli",
      quote:
        "Perjuangan mereka jelas — bukan janji kosong, tapi kerja betul-betul untuk rakyat Sabak Bernam.",
    },
    {
      avatar: "assets/images/testimoni/avatar4.png",
      name: "Kamarul Hisyam",
      role: "AJK Cawangan",
      quote:
        "Bersama Wawasan Negara, saya nampak harapan baru dan hala tuju yang jelas untuk kampung kita.",
    },
  ];

  /* ---------- Detect modal (popup) mode ---------- */
  var params = new URLSearchParams(window.location.search);
  var isModal = params.get("modal") === "1";
  if (isModal) {
    document.body.classList.add("is-modal-embed");
  }

  function notifyParentClose() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "wawasan:closeForm" }, "*");
    } else {
      window.location.href = "landing.html";
    }
  }

  ["miniBrand", "miniBack"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", function (e) {
      if (isModal) {
        e.preventDefault();
        notifyParentClose();
      }
      // else: normal navigation to landing.html (standalone page use)
    });
  });

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Reusable carousel engine ----------
     Handles slide building, dot nav, prev/next, and autoplay
     for any track/dots/prev/next set passed in. */
  function initCarousel(opts) {
    var track = opts.track;
    var dotsWrap = opts.dots;
    var prevBtn = opts.prevBtn;
    var nextBtn = opts.nextBtn;
    var autoMs = opts.autoMs || 4200;

    if (!track) return;

    opts.items.forEach(function (item) {
      track.appendChild(opts.renderSlide(item));
    });

    var slides = track.children;
    var count = slides.length;
    var index = 0;
    var autoTimer = null;

    if (dotsWrap) {
      for (var i = 0; i < count; i++) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute(
          "aria-label",
          (opts.dotLabel || "Slaid") + " " + (i + 1),
        );
        if (i === 0) dot.classList.add("is-active");
        (function (idx) {
          dot.addEventListener("click", function () {
            goTo(idx);
            restartAuto();
          });
        })(i);
        dotsWrap.appendChild(dot);
      }
    }

    function render() {
      track.style.transform = "translateX(-" + index * 100 + "%)";
      if (dotsWrap) {
        var dots = dotsWrap.children;
        for (var d = 0; d < dots.length; d++) {
          dots[d].classList.toggle("is-active", d === index);
        }
      }
    }

    function goTo(newIndex) {
      index = (newIndex + count) % count;
      render();
    }

    function next() {
      goTo(index + 1);
    }
    function prev() {
      goTo(index - 1);
    }

    function startAuto() {
      if (count > 1 && !reduceMotion) autoTimer = setInterval(next, autoMs);
    }
    function restartAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    if (nextBtn)
      nextBtn.addEventListener("click", function () {
        next();
        restartAuto();
      });
    if (prevBtn)
      prevBtn.addEventListener("click", function () {
        prev();
        restartAuto();
      });

    render();
    startAuto();
  }

  /* ---------- Header carousel ---------- */
  initCarousel({
    track: document.getElementById("carouselTrack"),
    dots: document.getElementById("carouselDots"),
    prevBtn: document.getElementById("carouselPrev"),
    nextBtn: document.getElementById("carouselNext"),
    autoMs: 4200,
    dotLabel: "Slaid",
    items: CAROUSEL_SLIDES,
    renderSlide: function (slide) {
      var li = document.createElement("li");
      li.className = "carousel__slide";
      li.style.backgroundImage =
        'linear-gradient(180deg, rgba(7,27,61,0.15) 0%, rgba(7,27,61,0.65) 100%), url("' +
        slide.image +
        '")';

      var textWrap = document.createElement("div");
      textWrap.className = "carousel__text";

      var span = document.createElement("span");
      span.textContent = slide.title;

      var p = document.createElement("p");
      p.textContent = slide.text;

      textWrap.appendChild(span);
      textWrap.appendChild(p);
      li.appendChild(textWrap);
      return li;
    },
  });

  /* ---------- Testimoni carousel ---------- */
  initCarousel({
    track: document.getElementById("testimoniTrack"),
    dots: document.getElementById("testimoniDots"),
    prevBtn: document.getElementById("testimoniPrev"),
    nextBtn: document.getElementById("testimoniNext"),
    autoMs: 5200,
    dotLabel: "Testimoni",
    items: TESTIMONI,
    renderSlide: function (person) {
      var li = document.createElement("li");
      li.className = "testimoni-card";

      var img = document.createElement("img");
      img.className = "testimoni-card__avatar";
      img.src = person.avatar;
      img.alt = "Gambar profil " + person.name;
      img.loading = "lazy";

      var quote = document.createElement("p");
      quote.className = "testimoni-card__quote";
      quote.textContent = person.quote;

      var name = document.createElement("p");
      name.className = "testimoni-card__name";
      name.textContent = person.name;

      var role = document.createElement("p");
      role.className = "testimoni-card__role";
      role.textContent = person.role;

      li.appendChild(img);
      li.appendChild(quote);
      li.appendChild(name);
      li.appendChild(role);
      return li;
    },
  });

  /* ---------- Form submission ----------
     Handled entirely by assets/js/form-submit.js (the real Firebase
     save + membership-ID flow + processing popup). This file used to
     have its own placeholder submit handler here, left over from
     before Firebase was wired in — it called form.reset() on every
     submit, which wiped the fields before form-submit.js's handler
     could read them, so every real submission silently failed
     validation and never reached Firestore. Removed for good. */
})();
