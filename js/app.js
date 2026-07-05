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

  // ==== Inhalts-Patches (Änderungspaket 04.07.2026) ====
  // Texte, die im HTML durch Formatierungs-Spans zerstückelt sind — per DOM ersetzen.
  var TEXT_PATCHES = [
    ['No fucks given',
     'Zieh dir was Schickes an, aber lass den Dreiteiler zu Hause. Ziel sollte es sein, dass du mit einem coolen Fit kommst: schick, aber casual.\n\nDer Abend wird gefilmt — und das Aftermovie schaut man sich auch in ein paar Jahren noch an. Also zieh dich so an, dass du dich darauf gerne wiedersiehst. Die Fotos zeigen den Vibe, die Punkte darunter geben dir konkrete Ideen.'],
    ['Nach dem Kauf kommt dein personalisierter',
     'Nach dem Kauf kommt dein personalisiertes Ticket mit allen wichtigen Infos per Post. Außerdem erhältst du deine MMS® Club Card. Sie ist dein Einlass zum Event und mit ihr sammelst du Punkte, um dir die MMS® Club Preise zu erspielen.'],
    ['tryzuharden',
     'Kein Dreiteiler, kein Wife-Beater — du musst auch nicht im Jackett kommen. Zieh dir aber was Schickes an und orientier dich gern am Moodboard: Sport-Club Mood, aber in einem Penthouse. Die meisten von uns kommen mit Hemd oder T-Shirt und Anzughose — dazu Sneaker oder Loafer.'],
    ['verrückte MMS® Club Merch',
     'Endlich ist es soweit: Das erste MMS® Club Event. Die Community wächst wie verrückt und wir sind täglich online im Austausch über Socials, Chats und Calls. Jetzt ist es an der Zeit, endlich uns alle in Person an einem Ort zusammenzubringen.\n\nMach dich bereit für einen geilen Abend, um dich mit Menschen wie dir zu connecten, das MMS® Team in Person kennenzulernen, eine gute Zeit zu haben und gemeinsam dumm zu gehen.'],
    ['Chats gewachsen. Zeit, sie endlich',
     'An alle, die innerhalb der MMS®-Betreuung erstmals 10.000, 100.000 oder 1.000.000 € erreicht haben: Bei diesem Fest übergeben wir die ersten MMS® Awards jemals.']
  ];
  document.querySelectorAll('.con-kit-quark').forEach(function (q) {
    TEXT_PATCHES.some(function (p) {
      if (q.textContent.indexOf(p[0]) === -1) return false;
      // Farb-Span erhalten (traegt --alpha-text 0.5) — sonst wird der Text vollweiss
      var setText = function (ziel, text) {
        ziel.textContent = '';
        text.split('\n\n').forEach(function (teil, ti) {
          if (ti > 0) {
            ziel.appendChild(document.createElement('br'));
            ziel.appendChild(document.createElement('br'));
          }
          ziel.appendChild(document.createTextNode(teil));
        });
      };
      var colorSpan = q.querySelector('span.con-kit-quark-color');
      if (colorSpan) {
        setText(colorSpan, p[1]);
        q.innerHTML = '';
        q.appendChild(colorSpan);
      } else {
        setText(q, p[1]);
      }
      return true;
    });
  });

  // Timeline "Ticket sichern": Du-Form statt Plural (Konsistenz mit dem Rest der Seite)
  var ticketQ = Array.prototype.find.call(document.querySelectorAll('.con-kit-quark'), function (q) {
    return q.textContent.indexOf('Sichert euch über den Button eure Tickets') !== -1;
  });
  if (ticketQ) {
    var ticketZiel = ticketQ.querySelector('span.con-kit-quark-color') || ticketQ;
    ticketZiel.textContent = ticketZiel.textContent
      .replace('Sichert euch über den Button eure Tickets', 'Sicher dir über den Button dein Ticket');
  }

  // Award-FAQ: "Sommerfest"-Relikt fixen + Formular-Link anhängen
  var awardFaqQ = Array.prototype.find.call(document.querySelectorAll('.con-kit-quark'), function (q) {
    return q.textContent.indexOf('Vorlaufzeit von mindestens 4 Wochen') !== -1;
  });
  if (awardFaqQ) {
    var awardZiel = awardFaqQ.querySelector('span.con-kit-quark-color') || awardFaqQ;
    awardZiel.textContent = awardZiel.textContent.replace('zum Sommerfest', 'zu den Penthouse Games');
    var awardFormLink = document.createElement('a');
    awardFormLink.href = 'https://form.typeform.com/to/ozsTWiw9';
    awardFormLink.target = '_blank';
    awardFormLink.rel = 'noopener';
    awardFormLink.className = 'pg-faq-link';
    awardFormLink.textContent = 'Hier kannst du einen Award beantragen, falls du dich qualifizierst.';
    awardZiel.appendChild(document.createTextNode(' '));
    awardZiel.appendChild(awardFormLink);
  }

  // Vierte Fakt-Zeile: "Limitiert auf 100 Tickets."
  var exAtom = document.querySelector('.con-kit-animation__atom[data-id^="ab4cc4d8"]');
  var exLine = document.querySelector('.con-kit-animation__atom[data-id^="fb45a2da"]');
  if (exAtom && exLine && exLine.parentElement) {
    var fakt4 = exAtom.cloneNode(true);
    fakt4.removeAttribute('data-id');
    var fakt4Q = fakt4.querySelector('.con-kit-quark');
    if (fakt4Q) fakt4Q.textContent = 'Limitiert auf 100 Tickets';
    // Als Trenner eine NORMALE Zwischenlinie klonen (nicht die Abschluss-Linie),
    // und vor der Abschluss-Linie einfuegen — so bleiben alle Abstaende gleich.
    var zwischenLine = (exAtom.previousElementSibling || exLine).cloneNode(true);
    zwischenLine.removeAttribute('data-id');
    exLine.parentElement.insertBefore(zwischenLine, exLine);
    exLine.parentElement.insertBefore(fakt4, exLine);
  }

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
    if (locQuark) locQuark.textContent = 'Was wir nicht wollen: dreckige Jogginghosen — aber auch keine Dreiteiler';
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
        a: 'Die Penthouse Games sind unser Turnier über den gesamten Abend. Du sammelst Punkte, connectest dich nebenbei mit den anderen und erspielst dir MMS® Club Preise. Kein Leistungsdruck — alles easygoing: Die Games sind dafür da, gemeinsam was zu spielen und sich dabei kennenzulernen.',
        first: true },
      { q: 'Was ist die MMS® Club Card?',
        a: 'Dein personalisiertes Invite, das per Post zu dir nach Hause kommt. Die physische MMS® Club Card ist dein Einlass zum Event — und damit sammelst du bei den Penthouse Games deine Punkte.' },
      { q: 'Wie läuft Anreise und Übernachtung?',
        a: 'Um Anreise und Hotel kümmerst du dich selbst. Das Event geht bis ca. 3 Uhr nachts — eine Übernachtung in München lohnt sich also. Los geht\'s pünktlich um 17 Uhr, danach geht\'s in die Nacht: Jeder bleibt so lange, wie er will.' },
      { q: 'Was, wenn ich doch nicht kann?',
        a: 'Das Ticket ist nicht übertragbar und wird nicht erstattet — die Teilnahmegebühr ist ja gespendet. Gib uns trotzdem kurz Bescheid, damit wir planen können.' },
      { q: 'Wen darf ich als +1 mitbringen?',
        a: 'Wen du willst! Jeder Kunde hat die Möglichkeit, zusätzliche Tickets zu kaufen — seid ihr zu zweit, dürft ihr auch gerne zwei Leute mitbringen.' },
      { q: 'Bis wann kann ich Tickets kaufen?',
        a: 'Es gibt keine Deadline — first come, first serve. Wenn die 100 Tickets weg sind, sind sie weg.' },
      { q: 'Wird gefilmt?',
        a: 'Ja. Wir produzieren ein Aftermovie, das rund drei Wochen nach dem Event erscheint. Wer nicht da war, sieht dort genau, was er verpasst hat. Also: Komm auf jeden Fall!' }
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

  // ==== FAQ / Listen-Accordions (NACH dem Klonen initialisieren!) ====
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

  // Award-Spalte (Preise + Awardzeremonie + Link) mobil als letzter Block
  var preiseAtom = document.querySelector('section.hero .con-kit-animation__atom[data-id^="e2443c07"]');
  if (preiseAtom) {
    var awardMolecule = preiseAtom.closest('.con-kit-molecule-textBlock');
    if (awardMolecule) awardMolecule.classList.add('pg-award-mobile-last');
  }

  // Footer: "always wins" wird zum Mission-Statement
  var footerAlways = Array.prototype.find.call(
    document.querySelectorAll('section.fußzeile .con-kit-component-button__label, section.fußzeile .con-kit-quark'),
    function (el) { return el.textContent.trim() === 'always wins'; }
  );
  if (footerAlways) {
    footerAlways.textContent = 'MMS® always wins: Wir möchten unser Team gewinnen sehen. Dich. Uns. Alle Kunden. Unsere Mission ist es, die geilste Community in Deutschland aufzubauen.';
    footerAlways.classList.add('pg-footer-mission');
  }

  // ==== Logo-Marquee: nahtloser Loop ====
  // Die Runtime würde das __repeat-Element befüllen — ohne sie bleibt es leer
  // und es entsteht eine riesige Lücke. Wir klonen den Logosatz selbst, bis die
  // Laufbahn gefüllt ist, und verschieben pro Zyklus exakt eine Satzbreite.
  var mqTrack = document.querySelector('.con-kit-component-marquee__content');
  if (mqTrack) {
    var mqGallery = mqTrack.querySelector('.con-kit-component-marquee-gallery');
    var mqBand = mqTrack.closest('.con-kit-component-marquee');
    var setupMarquee = function () {
      if (!mqGallery || !mqBand) return;
      var setW = mqGallery.getBoundingClientRect().width;
      if (setW < 10) { setTimeout(setupMarquee, 400); return; }
      var kopien = Math.max(2, Math.ceil((mqBand.getBoundingClientRect().width * 2) / setW) + 1);
      for (var i = 0; i < kopien; i++) {
        var klon = mqGallery.cloneNode(true);
        klon.setAttribute('aria-hidden', 'true');
        mqTrack.appendChild(klon);
      }
      mqTrack.style.setProperty('--pg-mq-shift', -Math.round(setW) + 'px');
      mqTrack.style.setProperty('--pg-mq-dauer', Math.max(10, Math.round(setW / 45)) + 's');
      mqTrack.classList.add('pg-marquee-loop');
    };
    if (document.readyState === 'complete') setupMarquee();
    else window.addEventListener('load', setupMarquee);
  }

  // ==== "MMS® always wins.": mobil Founders-Foto oben statt Rooftop ====
  var foundersImg = document.querySelector('[data-id^="ca294597"]');
  if (foundersImg) {
    var foundersCol = foundersImg.closest('.con-kit-col');
    if (foundersCol) foundersCol.classList.add('pg-first-mobile');
  }

  // ==== Scroll-Reveals (IntersectionObserver, gestaffelt) ====
  document.querySelectorAll('.con-kit-animation__atom, .con-kit-component-list-item-accordion').forEach(function (el) {
    el.setAttribute('data-pg-reveal', '');
  });
  // Stagger: kurzer Versatz innerhalb der gemeinsamen Row — snappy, nicht träge
  document.querySelectorAll('.con-kit-row').forEach(function (row) {
    row.querySelectorAll('[data-pg-reveal]').forEach(function (el, i) {
      el.style.setProperty('--pg-delay', Math.min(i * 60, 240) + 'ms');
    });
  });
  var pending = Array.prototype.slice.call(document.querySelectorAll('[data-pg-reveal]'));
  var revealObserver = null;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('pg-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    pending.forEach(function (el) { revealObserver.observe(el); });
  }
  // Fallback/Absicherung (initialer Zustand, alte Browser)
  var checkReveals = function () {
    if (!pending.length) return;
    var limit = window.innerHeight * 0.94;
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top < limit) {
        el.classList.add('pg-in');
        if (revealObserver) revealObserver.unobserve(el);
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
        var tlLine = tlContainer.querySelector('.pg-timeline-line');
        if (tlLine && tlLineMaxPx) tlLine.style.height = Math.round(tp * tlLineMaxPx) + 'px';
      }
      ticking = false;
    });
  };

  // ==== Timeline: 4. Punkt "Aftermovie" (das fehlende ♣ — die vierte Kartenfarbe) ====
  var tlItems = document.querySelectorAll('.con-kit-component-grid-timeline__item');
  if (tlItems.length === 3) {
    var afterItem = tlItems[1].cloneNode(true); // linkes Item als Vorlage (Zickzack)
    afterItem.removeAttribute('data-id');
    afterItem.querySelectorAll('[data-id]').forEach(function (n) { n.removeAttribute('data-id'); });
    var afterKopf = afterItem.querySelector('.con-kit-component-header .con-kit-quark');
    if (afterKopf) afterKopf.textContent = 'Aftermovie';
    var afterAbsatz = null;
    afterItem.querySelectorAll('.con-kit-quark-paragraph').forEach(function (q) {
      if (q.textContent.length > 40) afterAbsatz = q;
    });
    if (afterAbsatz) {
      var afterSpan = afterAbsatz.querySelector('span.con-kit-quark-color');
      var afterZiel = afterSpan || afterAbsatz;
      afterZiel.textContent = 'Rund drei Wochen nach dem Event erscheint das Aftermovie. Wer da war, erlebt den Abend nochmal — wer nicht da war, sieht genau, was er verpasst hat.';
      if (afterSpan) { afterAbsatz.innerHTML = ''; afterAbsatz.appendChild(afterSpan); }
    }
    // Herz-Pfad durch Kreuz (♣) ersetzen — gleicher Stroke-Stil wie ♠ ♥ ♦
    var afterSvgPath = afterItem.querySelector('.con-kit-component-icon svg path');
    if (afterSvgPath) {
      afterSvgPath.setAttribute('d',
        'M10.5 4.7a2.5 2.5 0 1 0-5 0 2.5 2.5 0 1 0 5 0Z' +
        'M7.5 9.2a2.5 2.5 0 1 0-5 0 2.5 2.5 0 1 0 5 0Z' +
        'M13.5 9.2a2.5 2.5 0 1 0-5 0 2.5 2.5 0 1 0 5 0Z' +
        'M8 11.6V14.2M6.2 14.2h3.6');
    }
    // Der Klon entsteht nach der Reveal-Registrierung — direkt sichtbar schalten,
    // sonst bleibt er dauerhaft auf opacity 0
    afterItem.classList.add('pg-in');
    afterItem.querySelectorAll('[data-pg-reveal]').forEach(function (n) { n.classList.add('pg-in'); });
    afterItem.classList.add('pg-tl-last');
    // Vor der Progress-Linie einfuegen -> 4. Item, Zickzack bleibt (links)
    var tlLineEl = tlItems[2].parentElement.querySelector('.pg-timeline-line');
    tlItems[2].parentElement.insertBefore(afterItem, tlLineEl);
  }

  // ==== Timeline Progress-Linie ====
  // Läuft von der Mitte des ersten Icons bis zur Mitte des letzten — hinter den Icon-Boxen.
  var tlLineMaxPx = 0;
  var tlContainer = document.querySelector('.con-kit-component-grid-timeline__container');
  if (tlContainer) {
    var line = document.createElement('div');
    line.className = 'pg-timeline-line';
    tlContainer.style.setProperty('--pg-progress', '0');
    tlContainer.appendChild(line);
    var sizeTimelineLine = function () {
      var iconBoxes = tlContainer.querySelectorAll('.con-kit-component-icon');
      if (iconBoxes.length < 2) return;
      var cRect = tlContainer.getBoundingClientRect();
      var first = iconBoxes[0].getBoundingClientRect();
      var last = iconBoxes[iconBoxes.length - 1].getBoundingClientRect();
      line.style.top = Math.round(first.top + first.height / 2 - cRect.top) + 'px';
      tlLineMaxPx = Math.round((last.top + last.height / 2) - (first.top + first.height / 2));
      // Höhe sofort synchron setzen — unabhängig vom rAF-Scroll-Handler
      var tp0 = Math.min(1, Math.max(0, (window.innerHeight * 0.7 - cRect.top) / cRect.height));
      line.style.height = Math.round(tp0 * tlLineMaxPx) + 'px';
    };
    sizeTimelineLine();
    window.addEventListener('load', sizeTimelineLine);
    window.addEventListener('resize', function () { setTimeout(sizeTimelineLine, 200); });
  }

  // ==== Footer: Lila-Flacker-GIF als Hintergrund ====
  var footBg = document.querySelector('section.fußzeile .con-kit-organism-background');
  if (footBg) {
    var footGif = document.createElement('img');
    footGif.src = 'assets/deckblatt-bg-neu.gif';
    footGif.alt = '';
    footGif.setAttribute('aria-hidden', 'true');
    footGif.setAttribute('decoding', 'async');
    footGif.className = 'pg-footer-gif';
    footBg.appendChild(footGif);
    footBg.classList.add('pg-footer-bg');
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  document.addEventListener('visibilitychange', function () {
    ticking = false; // rAF friert in Hintergrund-Tabs ein — Flag loesen
    onScroll();
  });
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
