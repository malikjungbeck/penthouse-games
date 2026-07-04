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

  // ==== Preloader mit Übergabe ins Hero-Logo ====
  var preloader = document.getElementById('pg-preloader');
  if (preloader) {
    var pImg = preloader.querySelector('img');
    var handoverDone = false;
    var release = function () {
      // Hero-Logo freigeben (ohne erneutes Write-on) und Preloader entfernen
      document.documentElement.classList.add('pg-handover-done');
    };
    var hide = function () {
      if (handoverDone) return;
      handoverDone = true;
      release();
      preloader.classList.add('pg-done');
      setTimeout(function () { preloader.remove(); }, 900);
    };
    var handover = function () {
      if (handoverDone) return;
      var heroImg = document.querySelector('.deckblatt [data-atom="image"] img');
      if (reduceMotion || !pImg || !heroImg || scrollY > 40) { hide(); return; }
      var to = heroImg.getBoundingClientRect();
      var from = pImg.getBoundingClientRect();
      // Nur übergeben, wenn das Hero-Logo im ersten Viewport messbar ist
      if (to.width < 10 || to.top < 0 || to.bottom > innerHeight) { hide(); return; }
      handoverDone = true;
      preloader.classList.add('pg-handover');
      pImg.style.transformOrigin = 'top left';
      pImg.style.transform = 'translate(' + (to.left - from.left) + 'px,' +
        (to.top - from.top) + 'px) scale(' + (to.width / from.width) + ')';
      setTimeout(function () {
        release();
        preloader.remove();
      }, 980);
    };
    // Warten bis Write-on fertig ist (150ms Delay + 1300ms) und die Seite geladen hat
    var minShown = reduceMotion ? 0 : 1500;
    var t0 = performance.now();
    var onReady = function () {
      var rest = Math.max(0, minShown - (performance.now() - t0));
      setTimeout(handover, rest);
    };
    if (document.readyState === 'complete') onReady();
    else window.addEventListener('load', onReady);
    setTimeout(hide, 3200); // Fail-safe: nie länger blockieren
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

  // ==== Hero: Script-Logo exakt in die Bildschirmmitte setzen ====
  var heroFrame = document.querySelector('section.deckblatt .con-kit-frame');
  var centerHeroLogo = function () {
    if (!heroFrame) return;
    var img = document.querySelector('.deckblatt [data-atom="image"]');
    if (!img) return;
    // Iterativ vom aktuellen Padding aus korrigieren — selbstheilend,
    // auch wenn sich das Layout nach dem ersten Durchlauf noch setzt.
    for (var i = 0; i < 3; i++) {
      var r = img.getBoundingClientRect();
      var delta = Math.round(window.innerHeight / 2 - (r.top + window.scrollY + r.height / 2));
      if (Math.abs(delta) < 2) break;
      var current = parseFloat(heroFrame.style.getPropertyValue('--pg-hero-pad')) || 12;
      heroFrame.style.setProperty('--pg-hero-pad', Math.max(12, current + delta) + 'px');
    }
  };
  centerHeroLogo();
  window.addEventListener('load', centerHeroLogo);
  window.addEventListener('load', function () { setTimeout(centerHeroLogo, 600); });
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(centerHeroLogo, 150);
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
      '<div class="pg-countdown" id="pg-countdown"></div>' +
      '<a class="pg-fold__cta" href="' + TICKET_URL + '" target="_blank" rel="noopener">Jetzt Ticket sichern</a>' +
      '<div class="pg-fold__seats">' + seatsText + '</div>';
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

  // ==== Mood: Checkliste + CTA in die linke Spalte unter den Text ====
  // (Galerien bleiben rechts; nur Linien, Checklist-Zeilen und Button ziehen um)
  // Spalten über Inhalt finden — es gibt eine leere Spalte, die --first UND --last ist
  var moodCols = Array.prototype.slice.call(document.querySelectorAll('section.mood .con-kit-col'));
  var moodLeftCol = moodCols.find(function (c) { return c.textContent.indexOf('Chic, but') !== -1; });
  var moodRight = moodCols.find(function (c) { return c.textContent.indexOf('Connecte dich') !== -1; });
  var moodLeft = moodLeftCol && moodLeftCol.querySelector('.con-kit-component-atom-list');
  if (moodLeft && moodRight) {
    ['b27ba295', 'af4b4149', '79dd9320', '5133c8f8', '4676d0d3', 'c27f5290'].forEach(function (prefix) {
      var atom = moodRight.querySelector('.con-kit-animation__atom[data-id^="' + prefix + '"]');
      if (atom) moodLeft.appendChild(atom);
    });
  }

  // ==== Inhalts-Patches (Änderungspaket 04.07.2026) ====
  // Texte, die im HTML durch Formatierungs-Spans zerstückelt sind — per DOM ersetzen.
  var TEXT_PATCHES = [
    ['No fucks given',
     'Willkommen im MMS® Club: Penthouse Games. Zieh dir was Schickes an, aber komm nicht mit Stock im Arsch. Rock einfach einen coolen Fit — bitte kein Dreiteiler, aber auch nicht im Wife-Beater. Chic, aber casual. Black and/or white.'],
    ['Nach dem Kauf kommt dein personalisierter',
     'Nach dem Kauf kommt dein personalisierter Invite mit allen wichtigen Infos per Post. Außerdem erhältst du deine MMS® Club Card. Sie ist dein Einlass zum Event und mit ihr sammelst du Punkte, um dir die MMS® Club Preise zu erspielen.'],
    ['tryzuharden',
     'Black and/or white, chic aber casual. Kein Dreiteiler, kein Wife-Beater, kein Stock im Arsch. Orientier dich am Moodboard — Sport-Club Mood, aber in einem Penthouse.']
  ];
  document.querySelectorAll('.con-kit-quark').forEach(function (q) {
    TEXT_PATCHES.forEach(function (p) {
      if (q.textContent.indexOf(p[0]) !== -1) q.textContent = p[1];
    });
  });

  // A3: Untere Kachel-Reihe wird [Food & Drinks | MMS® Club Preise | Dummgehen].
  // Jede Spalte ist eine Atom-Liste [oben-Titel, oben-Text, unten-Titel, unten-Text] —
  // die unteren Kachel-Atome rotieren eine Spalte weiter.
  (function () {
    var ids = { dummgehen: '2bdd698b', fd: '51dc1656', preise: 'e2443c07' };
    var atom = function (p) { return document.querySelector('section.hero .con-kit-animation__atom[data-id^="' + p + '"]'); };
    var d = atom(ids.dummgehen), f = atom(ids.fd), p = atom(ids.preise);
    if (!d || !f || !p) return;
    var listOf = function (a) { return a.parentElement; };
    var col1 = listOf(d), col2 = listOf(f), col3 = listOf(p);
    var moveTile = function (headerAtom, targetList) {
      var textAtom = headerAtom.nextElementSibling;
      targetList.appendChild(headerAtom);
      if (textAtom) targetList.appendChild(textAtom);
    };
    moveTile(f, col1); // Food & Drinks nach Spalte 1 unten
    moveTile(p, col2); // Preise nach Spalte 2 unten
    moveTile(d, col3); // Dummgehen nach Spalte 3 unten (Abschluss)
    // Tausch: Awardzeremonie nach unten (letzter Punkt), Preise nach oben.
    // Spalte 2 ist [Award, Award-Text, Link, Preise, Preise-Text] — Award-Trio ans Ende.
    var award = document.querySelector('section.hero .con-kit-animation__atom[data-id^="9971eeae"]');
    var awardLink = document.querySelector('section.hero .con-kit-animation__atom[data-id^="8e6b1eeb"]');
    if (award && awardLink) {
      var awardText = award.nextElementSibling;
      col2.appendChild(award);
      if (awardText) col2.appendChild(awardText);
      col2.appendChild(awardLink);
    }
    // Untere Kachel-Köpfe auf eine Linie bringen (Top-Kacheln sind
    // unterschiedlich hoch, sonst verrutscht die zweite Reihe)
    var alignBottomRow = function () {
      // untere Reihe nach dem Tausch: Food & Drinks | Awardzeremonie | Dummgehen
      var heads = [d, f, award].filter(Boolean);
      if (window.innerWidth <= 640) {
        heads.forEach(function (h) { h.style.marginTop = ''; });
        return;
      }
      heads.forEach(function (h) { h.style.marginTop = '0px'; });
      var maxY = Math.max.apply(null, heads.map(function (h) { return h.getBoundingClientRect().top; }));
      heads.forEach(function (h) {
        var delta = Math.round(maxY - h.getBoundingClientRect().top);
        if (delta > 1) h.style.marginTop = delta + 'px';
      });
    };
    alignBottomRow();
    window.addEventListener('load', alignBottomRow);
    window.addEventListener('resize', function () { setTimeout(alignBottomRow, 200); });
  })();

  // A4: Award-Button wird dezenter Textlink
  document.querySelectorAll('.con-kit-component-button').forEach(function (b) {
    if (b.textContent.indexOf('Award jetzt beantragen') === -1) return;
    var label = b.querySelector('.con-kit-component-button__label');
    if (label) label.textContent = 'Award beantragen';
    (b.closest('a') || b).classList.add('pg-award-textlink');
    b.classList.add('pg-award-textlink');
  });

  // A6b: Location-Hint als dritte Checklisten-Zeile (nach dem Mood-Umzug oben)
  var inviteRow = document.querySelector('section.mood [data-id^="5133c8f8"]');
  var lastChkLine = document.querySelector('section.mood [data-id^="4676d0d3"]');
  if (inviteRow && lastChkLine && lastChkLine.parentElement) {
    var locLine = lastChkLine.cloneNode(true);
    locLine.removeAttribute('data-id');
    var locRow = inviteRow.cloneNode(true);
    locRow.removeAttribute('data-id');
    var locQuark = locRow.querySelector('.con-kit-quark');
    if (locQuark) locQuark.textContent = 'Location? Wird im Invite revealed. Hint: Das Event heißt Penthouse Games.';
    lastChkLine.parentElement.insertBefore(locLine, lastChkLine);
    lastChkLine.parentElement.insertBefore(locRow, lastChkLine);
  }

  // B: Neue FAQ-Einträge (geklont vom ersten Accordion-Item)
  // Geklont wird der grid-list-item-WRAPPER (eine Zeile), nicht das Accordion selbst
  var faqFirstAcc = document.querySelector('section.faq .con-kit-component-list-item-accordion');
  var faqTemplate = faqFirstAcc && faqFirstAcc.closest('.con-kit-component-grid-list-item');
  if (faqTemplate) {
    var faqParent = faqTemplate.parentElement;
    var NEW_FAQS = [
      { q: 'Was sind die Penthouse Games genau?',
        a: 'Die Penthouse Games sind unser Tournament über den gesamten Abend. Du sammelst Punkte, verbindest dich nebenbei mit anderen Kunden und erspielst dir MMS® Club Preise. Kein Leistungsdruck — die Games sind dafür da, dass man leicht in den Abend reinkommt.',
        first: true },
      { q: 'Was ist die MMS® Club Card?',
        a: 'Dein personalisiertes Invite, das per Post zu dir nach Hause kommt. Die physische MMS® Club Card ist dein Einlass zum Event — und damit sammelst du bei den Penthouse Games deine Punkte.' },
      { q: 'Wie läuft Anreise und Übernachtung?',
        a: 'Um Anreise und Hotel kümmerst du dich selbst. Das Event geht bis ca. 3 Uhr nachts — eine Übernachtung in München lohnt sich also. Los geht\'s pünktlich um 17 Uhr, danach geht\'s in die Nacht: Jeder bleibt so lange, wie er will.' },
      { q: 'Was, wenn ich doch nicht kann?',
        a: 'Das Ticket ist nicht übertragbar und wird nicht erstattet — die Teilnahmegebühr ist ja gespendet. Gib uns trotzdem kurz Bescheid, damit wir planen können.' },
      { q: 'Wird gefilmt?',
        a: 'Ja. Wir produzieren ein Aftermovie, das rund drei Wochen nach dem Event erscheint. Wer nicht da war, sieht dort, was er verpasst hat.' }
    ];
    NEW_FAQS.forEach(function (f) {
      var wrapper = faqTemplate.cloneNode(true);
      wrapper.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); });
      var acc = wrapper.querySelector('.con-kit-component-list-item-accordion');
      if (acc) {
        acc.classList.remove('con-kit-component-list-item-accordion--open');
        acc.removeAttribute('data-list-item-index');
      }
      var headQ = wrapper.querySelector('.con-kit-component-list-item-accordion__head .con-kit-quark');
      if (headQ) headQ.textContent = f.q;
      var bodyQs = wrapper.querySelectorAll('.con-kit-component-list-item-accordion__body .con-kit-quark');
      bodyQs.forEach(function (bq, i) {
        if (i === 0) bq.textContent = f.a;
        else bq.remove();
      });
      if (f.first) faqParent.insertBefore(wrapper, faqTemplate);
      else faqParent.appendChild(wrapper);
    });
  }

  // ==== "MMS® always wins.": mobil Founders-Foto oben statt Rooftop ====
  var roofAtom = document.querySelector('[data-id^="612a43b4"]');
  var foundersImg = document.querySelector('[data-id^="ca294597"]');
  if (roofAtom) roofAtom.classList.add('pg-hide-mobile');
  if (foundersImg) {
    var foundersCol = foundersImg.closest('.con-kit-col');
    if (foundersCol) foundersCol.classList.add('pg-first-mobile');
  }

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
    // Linke Einträge rechtsbündig an die Linie rücken
    var tlLineX = line.getBoundingClientRect().left;
    document.querySelectorAll('section.timeline .con-kit-molecule-textBlock').forEach(function (m) {
      var r = m.getBoundingClientRect();
      if (r.width > 0 && r.right < tlLineX + 10) m.classList.add('pg-tl-left');
    });
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
