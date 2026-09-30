# Rebuild notes

Everything below is left as uncommitted working-tree changes, per the
brief — nothing was committed or pushed.

## What changed structurally

- New `/css` (tokens, base, nav, cursor, hero, home, work, play, about)
  and `/js` (config, cursor, nav, hero-effects, eyes, hand,
  scroll-reveals, bg-ambient, work-data, work-render, home-preview,
  about, play) — one file per concern, shared nav/cursor markup and
  styles identical on every page.
- `playground.html` → `play.html` (full functionality ported and
  re-skinned with the new nav/cursor). The old `playground.html` path
  now just redirects to `play.html` (meta-refresh + JS fallback) so any
  already-shared links keep working, instead of being deleted outright.
- Retired and deleted: `styles.css`, `script.js`, `paintstore.js`, and
  the old root `work.css` — all fully superseded by the new `/css` and
  `/js` files. The old single-image `#cursor` lotus cursor is gone
  everywhere, replaced by the three-circle cursor in `css/cursor.css` /
  `js/cursor.js`.
- `index.html` is now hero + a 3-card "Selected Work" preview
  (`js/home-preview.js`) linking to `work.html`; `work.html` carries the
  full listing + case-study overlay that used to live inline in
  `index.html` (`js/work-render.js`, same project data in
  `js/work-data.js`, ported verbatim from the old `paintstore.js`).

## Assumptions / places I extended the spec

1. **Exact hero composition/spacing** — I never had access to the two
   reference screenshots described in the brief (no image access in
   this session), so the hero's exact spacing, dot placement, and
   sizing are my own judgment call, built on top of the already-tuned
   `hero-prototype.html` layout. I added four small scattered accent
   dots (`.hero-dot`) near the hero text in the lotus colors, per "a
   few scattered accent dots" in the brief — their exact positions are
   arbitrary.
2. **Body font** — kept Cormorant Garamond for serif display text
   (headings inherit `--font-headline`/`--font-serif`) and switched the
   sans body copy to "Inter" as the primary with Poppins as a fallback
   in the stack (`--font-sans: "Inter", "Poppins", ...`), since Inter
   wasn't previously loaded via the Google Fonts `<link>`. I added
   Inter to the font `<link>` on every page. This is a stack fallback,
   not a hard swap — if Inter fails to load, Poppins (already loaded)
   or system-ui renders instead, so there's no added network
   dependency risk.
3. **60/30/10 color values** — `--color-60` is the existing warm cream
   `#FAF8F5`, `--color-10` is the existing yellow `#FFE99B`.
   `--color-30` I set to `#2F63D9` (the existing site's blue-ink accent
   family, already used for `--blue`/`--blue-ink` in the old work.css
   home palette) since the brief said "a value consistent with the
   current site's blue-ink accent" without pinning an exact hex.
4. **Lotus colors extracted from favicon.svg**: `--lotus-blue:
   #4B8AFF`, `--lotus-pink: #EFABFF`, `--lotus-yellow: #FFE99B` — read
   directly from the SVG's fill attributes (not guessed).
5. **Logo hover treatment** — went with "petals scale ~1.05" (I used
   1.08) via per-`<path>` CSS transforms (`transform-box: fill-box`)
   rather than spreading them apart, since scaling is the simpler,
   more robust option given the paths already overlap at the center.
6. **Nav "Playground" → "Play"** — the brief's page list names the page
   `play.html` with a "Play" nav label; the previous site had it as
   "Playground". I used "Play" throughout (nav label + `<title>`) to
   match the brief's naming, and added one intro line above the canvas
   ("An infinite wall — scroll, drag, or scatter around.") since the
   brief allowed it "if it reads better."
7. **Case-study deep links** — `work.html` now opens a case study
   directly if the URL has `#<project-id>` (e.g. `work.html#metlife`),
   and the home preview's 3 cards link to `work.html#<id>` so clicking
   one goes straight to that case study instead of just the listing
   top. This wasn't explicitly requested but felt like the obvious
   behavior for a preview card that says "open this."
8. **View Transitions** — implemented via the CSS cross-document
   `@view-transition { navigation: auto; }` opt-in (base.css) rather
   than JS `document.startViewTransition()`, since this is a
   multi-page site with real navigations, not an SPA — the JS API is
   for same-document transitions and doesn't apply here. The nav gets
   a stable `view-transition-name` so it doesn't crossfade with the
   rest of the page. Falls back to an instant navigation automatically
   on browsers without support (most non-Chromium browsers today).
9. **Playground's cross-iframe cursor tracking dropped** — the old
   playground had a `postMessage`-based relay so the single `#cursor`
   image could track the pointer position reported by embedded
   interactive iframes (e.g. the Storm Strings embed) even while the
   pointer was technically inside a different document. The new
   three-circle cursor doesn't expose a single trackable element the
   same way, so I left the `message` listener wired up in `play.js`
   (updates the parallax target correctly) but it no longer moves the
   cursor dots while hovering that one embed. Minor, and only affects
   one tile inside `play.html`.
10. **Selected Work preview count** — used exactly 3 cards (MetLife,
    Cognition, RTC) on the home page, the top 3 entries in
    `PROJECTS`, since the brief said "2–3 cards."
11. **Reduced-motion nav-hover/cursor** — under `prefers-reduced-motion:
    reduce` the custom cursor is hidden entirely and the native cursor
    is restored (rather than "circles stay clustered, static" as a
    still-custom cursor), because a static custom cursor still
    requires JS positioning that would either lag or need to be pinned
    to viewport center — hiding it and using the OS cursor reads as
    the more honest "no motion" state and matches how the old site
    already handled `prefers-reduced-motion` for its own cursor.

## Config values you'll most likely want to tweak

All in `js/config.js` (`window.SITE_CONFIG`):

- `hero.timing` — the 5-phase dissolve timeline (`dissolve` 150ms,
  `flash` 400ms, `shrink` 200ms, `ripple` 500ms, `resolve` 250ms).
- `hero.halftone` / `hero.ascii` — grid spacing, dot/char sizing,
  thresholds; carried over unchanged from `hero-prototype.html`.
- `hero.eye.hoverPadding` (24px), `pupilMaxRadius` (5px), `pupilEase`
  (0.18), `touchOpenHold` (2200ms).
- `hero.hand.fps` (10), `touchCycles` (2).
- `cursor.size` / `hoverSize` / `pressSize` and each ring's `ease`
  (0.35 / 0.25 / 0.18, per the brief) and `hoverSelector` (which
  elements trigger the grow-on-hover state).

## Testing performed

Playwright, against a local `python3 -m http.server`:
- All 4 pages (`index.html`, `work.html`, `play.html`, `about.html`)
  loaded with **zero console/page errors**, desktop (1400×900) and
  mobile (390×844) viewports, screenshotted at both sizes.
- Hovered `designer` (halftone dissolve), `engineer` (ASCII dissolve),
  the eye (opens, pupil renders and tracks), and the hand (wave frame
  advances) on the home hero — all fired correctly, screenshotted.
- Clicked through Work → Play → About → Home via the nav on live
  pages — no errors except one benign `pageerror: "Transition was
  skipped"`, which is the browser's own unhandled-rejection warning
  from the cross-document View Transition being interrupted by the
  test script's next rapid click (a transition getting superseded by
  another navigation before it finishes is expected/harmless
  behavior, not a bug).
