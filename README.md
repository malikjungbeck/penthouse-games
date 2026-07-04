# Penthouse Games — Enhanced Edition

Nachbau von https://www.money-making-sprint.de/penthouse-games (Basis: 04.07.2026),
komplett eigenständig — kein Onepage, keine externen Abhängigkeiten — plus Motion- und
Conversion-Layer obendrauf.

## Enhancements gegenüber dem Original
- **Preloader** mit Write-on-Animation des Script-Logos (wie eine Unterschrift)
- **Scroll-Reveals**: Elemente faden gestaffelt ein, Parallax auf Hintergrund-Bannern
- **Above the fold**: Datum / Ort / Uhrzeit, Platz-Zeile, **Live-Countdown**, Ticket-CTA direkt im Deckblatt
- **Film-Grain + Vignette** über der ganzen Seite (Samt-Feeling statt Flat-Black)
- **Serif-Akzente** (Cormorant Garamond italic) auf den Eyebrow-Zeilen
- **Button-FX**: Glint-Sweep + Magnetic-Hover auf allen CTAs
- **Timeline** mit scroll-gebundener Progress-Linie
- **Masonry-Hover** (Zoom + Brightness) und FAQ-Hover-Feinschliff
- **Deckblatt-GIF (14 MB) → MP4 (183 KB)**, Lazy-Loading für alle Bilder unter dem Fold
- **og:image + Descriptions** für WhatsApp/Social-Sharing (`assets/og-image.jpg`)
- `prefers-reduced-motion` wird respektiert

## Konfiguration (js/app.js, oben)
- `SEATS_LEFT = null` → zeigt "Limitiert auf 100 Plätze".
  Zahl eintragen (z.B. `34`) → zeigt "Noch 34 von 100 Plätzen".
- `EVENT_DATE` (Countdown-Ziel) und `TICKET_URL` ebenfalls dort.

## Struktur
- `index.html` — komplette Seite (Original-Markup + alle Styles inline)
- `assets/` — alle Bilder lokal + `deckblatt-bg.mp4` + `og-image.jpg`
- `fonts/` — Inter + Cormorant Garamond lokal
- `css/custom.css` — Enhancement-Layer (Grain, Reveals, Countdown, Button-FX)
- `js/app.js` — Accordion, Reveals, Parallax, Countdown, Video-Start, Magnetic Buttons

## Deployen
Beliebiger Static Host (Vercel, Netlify, Cloudflare Pages, S3, …):
Kompletten Ordner hochladen, `index.html` ist der Einstieg.

## Vor dem Launch anpassen
- `<meta name="robots" content="noindex">` entfernen, falls die Seite indexiert werden soll.
- Canonical-Tag auf die Ziel-Domain umbiegen.
- `og:image` braucht nach dem Deploy eine **absolute** URL (Domain + `/assets/og-image.jpg`).
- Impressum/Datenschutz/Teilnahmebedingungen verlinken auf money-making-sprint.de.
- Optional: Tracking-Pixel + Cookie-Banner, falls Ads geschaltet werden.

## Lokal testen
```
python3 -m http.server 4324
# → http://localhost:4324
```
