// Penthouse Games — Interaktion & Motion Layer
// Ersetzt das Onepage-Runtime: Accordion, Reveals, Parallax, Countdown, Button-FX.
(function () {
  'use strict';

  // ==== Konfiguration ====
  var EVENT_DATE = new Date('2026-08-29T17:00:00+02:00'); // 29.08.2026, 17 Uhr München
  var SEATS_TOTAL = 100;
  var SEATS_LEFT = null; // Zahl eintragen (z.B. 34) => "Noch 34 von 100 Plätzen"
  var TICKET_URL = 'https://pay.dscvrymedia.com/';

  document.documentElement.classList.add('pg-js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==== Preloader ====
  var preloader = document.getElementById('pg-preloader');
  if (preloader) {
    var hide = function () {
      preloader.classList.add('pg-done');
      setTimeout(function () { preloader.remove(); }, 900);
    };
    // Mindestens die Write-on-Animation zeigen, maximal 2.2s warten
    var minShown = reduceMotion ? 0 : 1500;
    var t0 = performance.now();
    var onReady = function () {
      var rest = Math.max(0, minShown - (performance.now() - t0));
      setTimeout(hide, rest);
    };
    if (document.readyState === 'complete') onReady();
    else window.addEventListener('load', onReady);
    setTimeout(hide, 2600); // Fail-safe
  }

  // ==== FAQ / Listen-Accordions ====
  document.querySelectorAll('.con-kit-component-list-item-accordion').forEach(function (item) {
    var head = item.querySelector('.con-kit-component-list-item-accordion__head') || item;
    var body = item.querySelector('.con-kit-component-list-item-accordion__body');
    if (!body) return;
    body.style.height = '0px';
    head.addEventListener('click', function () {
      var open = item.classList.toggle('con-kit-component-list-item-accordion--open');
      body.style.height = open ? body.scrollHeight + 'px' : '0px';
    });
  });

  // ==== Sanftes Anker-Scrolling ====
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  });

  // ==== Fold-Info + Countdown ins Deckblatt ====
  var deckImage = document.querySelector('.deckblatt [data-atom="image"]');
  if (deckImage) {
    var fold = document.createElement('div');
    fold.className = 'pg-fold';
    fold.setAttribute('data-pg-reveal', '');
    var seatsText = SEATS_LEFT != null
      ? 'Noch ' + SEATS_LEFT + ' von ' + SEATS_TOTAL + ' Plätzen'
      : 'Limitiert auf ' + SEATS_TOTAL + ' Plätze';
    fold.innerHTML =
      '<div class="pg-fold__meta">' +
        '<span>29/08/26</span><span class="pg-dot"></span>' +
        '<span>München</span><span class="pg-dot"></span>' +
        '<span>17:00 – 03:00</span>' +
      '</div>' +
      '<div class="pg-fold__seats">' + seatsText + '</div>' +
      '<div class="pg-countdown" id="pg-countdown"></div>' +
      '<a class="pg-fold__cta" href="' + TICKET_URL + '" target="_blank" rel="noopener">Jetzt Ticket sichern</a>';
    deckImage.parentNode.insertBefore(fold, deckImage.nextSibling);
  }

  var cdEl = document.getElementById('pg-countdown');
  if (cdEl) {
    var UNITS = [['Tage', 86400000], ['Std', 3600000], ['Min', 60000], ['Sek', 1000]];
    var render = function () {
      var diff = Math.max(0, EVENT_DATE - Date.now());
      var html = '';
      UNITS.forEach(function (u) {
        var v = Math.floor(diff / u[1]);
        diff -= v * u[1];
        html += '<div class="pg-countdown__unit"><span class="pg-countdown__num">' +
          String(v).padStart(2, '0') + '</span><span class="pg-countdown__label">' + u[0] + '</span></div>';
      });
      cdEl.innerHTML = html;
    };
    render();
    setInterval(render, 1000);
  }

  // ==== Serif-Akzente auf Eyebrow-Zeilen (explizite Whitelist) ====
  var SERIF_LINES = ['Was dich erwartet', 'Mood', 'Exklusiv für MMS® Kunden:'];
  document.querySelectorAll('.con-kit-atom-plain-text .con-kit-quark').forEach(function (el) {
    var t = (el.textContent || '').trim();
    if (SERIF_LINES.indexOf(t) !== -1) el.classList.add('pg-serif');
  });

  // ==== Scroll-Reveals (gestaffelt, scroll-basiert — robust ohne IO) ====
  document.querySelectorAll('.con-kit-animation__atom, .con-kit-component-list-item-accordion').forEach(function (el) {
    el.setAttribute('data-pg-reveal', '');
  });
  // Stagger: Delay nach Position innerhalb der gemeinsamen Row
  document.querySelectorAll('.con-kit-row').forEach(function (row) {
    row.querySelectorAll('[data-pg-reveal]').forEach(function (el, i) {
      el.style.setProperty('--pg-delay', Math.min(i * 90, 540) + 'ms');
    });
  });
  var pending = Array.prototype.slice.call(document.querySelectorAll('[data-pg-reveal]'));
  var checkReveals = function () {
    if (!pending.length) return;
    var limit = window.innerHeight * 0.92;
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top < limit) {
        el.classList.add('pg-in');
        return false;
      }
      return true;
    });
  };

  // ==== Parallax auf Organism-Backgrounds ====
  var pxLayers = [];
  document.querySelectorAll('.parallax-banner-layer-0').forEach(function (layer) {
    // Nur Ebenen mit echtem Bild/Video bewegen — verschobene Farbflächen
    // würden den (hellen) Seitenhintergrund freilegen.
    if (!layer.querySelector('img, video')) return;
    var section = layer.closest('section');
    if (section) pxLayers.push({ layer: layer, section: section });
  });
  var ticking = false;
  var onScroll = function () {
    checkReveals();
    if (ticking || reduceMotion) return;
    ticking = true;
    requestAnimationFrame(function () {
      var vh = window.innerHeight;
      pxLayers.forEach(function (p) {
        var r = p.section.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var progress = (vh - r.top) / (vh + r.height); // 0..1
        var shift = (progress - 0.5) * 0.35 * r.height; // max ±17.5%
        p.layer.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
      });
      // Timeline-Progress
      if (tlContainer) {
        var tr = tlContainer.getBoundingClientRect();
        var tp = Math.min(1, Math.max(0, (vh * 0.7 - tr.top) / tr.height));
        tlContainer.style.setProperty('--pg-progress', tp.toFixed(3));
      }
      ticking = false;
    });
  };

  // ==== Timeline Progress-Linie ====
  var tlContainer = document.querySelector('.con-kit-component-grid-timeline__container');
  if (tlContainer) {
    var line = document.createElement('div');
    line.className = 'pg-timeline-line';
    tlContainer.style.setProperty('--pg-progress', '0');
    tlContainer.appendChild(line);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
  // Initiale Reveals absichern (auch wenn rAF/Scroll noch nicht gefeuert haben)
  setTimeout(checkReveals, 150);
  setTimeout(checkReveals, 600);
  window.addEventListener('load', checkReveals);

  // ==== Hintergrund-Video sicher starten ====
  var bgVideo = document.querySelector('.pg-bg-video');
  if (bgVideo) {
    var tryPlay = function () {
      if (bgVideo.paused) bgVideo.play().catch(function () {});
    };
    tryPlay();
    window.addEventListener('load', tryPlay);
    ['scroll', 'click', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, tryPlay, { once: true, passive: true });
    });
  }

  // ==== Magnetic Buttons ====
  if (!reduceMotion && matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.con-kit-component-button, .pg-fold__cta').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / r.width;
        var dy = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = 'translate(' + (dx * 6).toFixed(1) + 'px,' + (dy * 4).toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }
})();
