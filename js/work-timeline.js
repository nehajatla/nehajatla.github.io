/* ================================================================
   work-timeline.js — horizontal scrolling strip of real project
   thumbnails for work.html (2023–2027). Reads PROJECTS from
   work-data.js. Each card shows the thumbnail, then the real
   title + role underneath — no placeholder copy, no calendar grid.

   Layout pattern: a tall spacer section with a `position: sticky`
   inner viewport (see css/work-timeline.css). As the page scrolls
   vertically through the spacer's extra height, this script translates
   `.timeline-track` horizontally by the same progress — a normal mouse
   wheel "just works" via native sticky behavior, and once scrolled
   past the spacer's height the section releases into normal vertical
   scroll. Trackpad horizontal scroll, click-drag, touch swipe, and
   arrow keys all funnel into the SAME window scroll position (via
   window.scrollBy), so the whole thing stays driven by real scroll
   position rather than a parallel piece of state. Card width/gap are
   sized so the next card always peeks in at the right edge.
   ================================================================ */
(function () {
  'use strict';

  /* ── CONFIG — every tunable value lives here. Card width/gap live as
     CSS custom properties on .work-timeline-section (single source of
     truth for layout geometry — see css/work-timeline.css). ────── */
  const CONFIG = {
    reelDuration: 820,                // ms — slot-machine year-digit spin
    reelEase: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    reelFastJumpYears: 2,             // jump straight to the target instead of spinning if the year would jump this many+ at once

    idleSpinDelayMs: 450,             // delay before the summer-2027 card's unprompted idle spin fires once in view
    idleSpinDurationMs: 900,

    readingLineFraction: 0.28         // which card is "active" — fraction of viewport width from the left edge
  };

  /* Real project order + year — single source of truth lives in
     work-data.js (PROJECT_TIMELINE_ORDER), shared with the home
     page's preview so both always show the same real order. */
  const PROJECT_ORDER = (typeof PROJECT_TIMELINE_ORDER !== 'undefined') ? PROJECT_TIMELINE_ORDER : [];

  const LOOKAHEAD_CARDS = [
    {
      id: 'next-stop',
      year: 2027,
      heading: 'next stop: singapore',
      body: 'studying abroad at Singapore Management University, spring 2027.'
    },
    {
      id: 'summer-2027',
      year: 2027,
      heading: "summer 2027: the reel's still spinning",
      body: "open to summer 2027 opportunities — let's talk.",
      link: 'mailto:neha.jatla@duke.edu'
    }
  ];

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── DOM refs ──────────────────────────────────────────────── */
  const section  = document.getElementById('work-timeline-section');
  const viewport = document.getElementById('timelineViewport');
  const track    = document.getElementById('timelineTrack');
  const yearReel = document.getElementById('timelineYearReel');
  const yearIdleWrap = document.getElementById('timelineYearIdleWrap');
  const yearWindow = document.getElementById('timelineYearWindow');

  if (!section || !track || typeof PROJECTS === 'undefined') return;

  /* ── Build cards ──────────────────────────────────────────── */
  const cardDefs = [];

  PROJECT_ORDER.forEach(({ id, year }) => {
    const project = PROJECTS.find((p) => p.id === id);
    if (!project) return;
    cardDefs.push({ kind: 'project', id, year, project });
  });
  LOOKAHEAD_CARDS.forEach((c) => cardDefs.push({ kind: 'lookahead', id: c.id, year: c.year, def: c }));

  cardDefs.forEach((c, i) => {
    const el = document.createElement(c.kind === 'lookahead' && !c.def.link ? 'div' : 'a');
    el.className = 'timeline-card ' + (c.kind === 'project' ? 'timeline-card--project' : 'timeline-card--lookahead');
    el.style.setProperty('--i', i);

    if (c.kind === 'project') {
      const p = c.project;
      if (el.tagName === 'A') el.href = '#' + p.id;
      el.setAttribute('aria-label', 'Open: ' + p.title);
      el.dataset.projectId = p.id;

      const thumb = document.createElement('div');
      thumb.className = 'tl-card-thumb' + (p.logo ? ' tl-card-thumb--logo' : '');
      thumb.style.background = p.color;

      if (p.video) {
        // Autoplaying (not hover-gated) — browsers allow this as long as
        // the video is muted, inline, and autoplay is set before/with
        // the source, so .play() doesn't depend on a user gesture.
        const video = document.createElement('video');
        video.className = 'tl-card-thumb-video';
        video.src = p.video;
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = 'auto';
        thumb.appendChild(video);
        if (!REDUCED_MOTION) video.play().catch(() => {});
      } else if (p.image) {
        // If a hoverImage (gif) exists, show it directly so it's always
        // animating rather than swapping in only on hover — a gif's own
        // frames autoplay as soon as it's loaded.
        const img = document.createElement('img');
        img.src = (p.hoverImage && !REDUCED_MOTION) ? p.hoverImage : p.image;
        img.alt = p.title;
        img.loading = 'lazy';
        thumb.appendChild(img);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'tl-card-thumb-placeholder';
        thumb.appendChild(placeholder);
      }

      const caption = document.createElement('div');
      caption.className = 'tl-card-caption';
      caption.innerHTML = `
        <h3 class="tl-card-title">${p.title}</h3>
        <p class="tl-card-role">${p.role || ''}</p>
      `;

      el.appendChild(thumb);
      el.appendChild(caption);

      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.openCaseStudy) window.openCaseStudy(p);
      });
    } else {
      const c2 = c.def;
      if (el.tagName === 'A') { el.href = c2.link; el.target = '_blank'; el.rel = 'noopener'; }
      el.setAttribute('aria-label', c2.heading);
      // Same two-part shape as a project card — a boxed area sized to
      // exactly match the thumbnail height (--card-h), then unboxed
      // caption text below — so the VISIBLE box is the same size as
      // every other card's thumbnail, not the whole (taller) card.
      el.innerHTML = `
        <div class="tl-look-box">
          <p class="tl-look-icon" aria-hidden="true">${c.id === 'next-stop' ? '&#9992;' : '&#9679;'}</p>
        </div>
        <div class="tl-card-caption tl-look-caption">
          <h3 class="tl-look-heading">${c2.heading}</h3>
          <p class="tl-look-body">${c2.body}</p>
        </div>
      `;
      if (c.id === 'next-stop') el.classList.add('tl-look--next-stop');
      if (c.id === 'summer-2027') el.classList.add('tl-look--summer');
    }

    track.appendChild(el);
    c.el = el;
  });

  const summerCard = cardDefs.find((c) => c.id === 'summer-2027');

  /* ── Scroll-distance math ─────────────────────────────────── */
  let cardStepPx = 0;     // width of one card + gap, read from CSS
  let trackWidthPx = 0;
  let viewportWidthPx = 0;
  let scrollDistance = 0;
  let sectionTop = 0;

  // NOTE: getComputedStyle(...).getPropertyValue('--card-w') would return
  // the raw unresolved token text (e.g. "min(46vw, 620px)"), not a pixel
  // number — parseFloat on that is NaN. Measure the actual rendered
  // elements instead, which always gives real resolved pixels regardless
  // of how the CSS width/gap expression is written.
  function measure() {
    const cards = cardDefs.map((c) => c.el);
    const first = cards[0].getBoundingClientRect();
    cardStepPx = cards.length > 1
      ? cards[1].getBoundingClientRect().left - first.left
      : first.width;
    trackWidthPx = track.scrollWidth;
    viewportWidthPx = viewport.getBoundingClientRect().width;
    scrollDistance = Math.max(0, trackWidthPx - viewportWidthPx);
    section.style.height = (window.innerHeight + scrollDistance) + 'px';
    sectionTop = section.offsetTop;
  }

  /* ── Year digit reel ──────────────────────────────────────── */
  let committedYear = cardDefs[0].year;
  let spinTimer = null;
  let summerIdleFired = false;
  let idleTimer = null;

  const YEAR_DIGITS = ['5', '6', '7']; // 2025–2027
  yearReel.innerHTML = YEAR_DIGITS.map((d) => `<span class="ty-digit">${d}</span>`).join('');
  function digitIdx(year) { return YEAR_DIGITS.indexOf(String(year).slice(-1)); }

  // CSS `%` in `transform` is relative to the element's OWN size, and
  // the reel is one tall strip of all YEAR_DIGITS stacked, so one
  // digit-step is (100 / count)%, not 100%.
  const REEL_STEP_PCT = 100 / YEAR_DIGITS.length;
  setReel(digitIdx(committedYear), false);

  function setReel(idx, animate) {
    const target = `translateY(${-idx * REEL_STEP_PCT}%)`;
    if (!animate || REDUCED_MOTION) {
      yearReel.style.transition = 'none';
      yearReel.style.transform = target;
      void yearReel.offsetHeight; // force reflow so later animated changes don't inherit "none"
      yearReel.style.transition = '';
      if (REDUCED_MOTION && animate) {
        yearWindow.classList.add('is-crossfade');
        requestAnimationFrame(() => yearWindow.classList.remove('is-crossfade'));
      }
      return;
    }
    yearReel.style.transition = `transform ${CONFIG.reelDuration}ms ${CONFIG.reelEase}`;
    yearReel.style.transform = target;
    yearWindow.classList.add('is-spinning');
    clearTimeout(spinTimer);
    spinTimer = setTimeout(() => yearWindow.classList.remove('is-spinning'), CONFIG.reelDuration);
  }

  function updateYear(candidateYear) {
    if (candidateYear === committedYear) return;
    const instant = Math.abs(candidateYear - committedYear) >= CONFIG.reelFastJumpYears;
    committedYear = candidateYear;
    setReel(digitIdx(committedYear), !instant);
  }

  /* ── Per-frame scroll handler ─────────────────────────────── */
  let ticking = false;
  let lastActiveEl = null;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { render(); ticking = false; });
  }

  function render() {
    const y = window.scrollY - sectionTop;
    const progress = scrollDistance > 0 ? Math.min(1, Math.max(0, y / scrollDistance)) : 0;
    const offset = progress * scrollDistance;
    track.style.transform = `translateX(${-offset}px)`;

    const inView = y > -window.innerHeight && y < scrollDistance + window.innerHeight;
    if (!inView) return;

    // Nearest card to the reading line becomes "active" (drives the
    // pinned year label + a highlight class for styling).
    const readingX = offset + CONFIG.readingLineFraction * viewportWidthPx;
    let idx = Math.floor(readingX / cardStepPx);
    idx = Math.min(cardDefs.length - 1, Math.max(0, idx));
    const active = cardDefs[idx];

    if (active.el !== lastActiveEl) {
      if (lastActiveEl) lastActiveEl.classList.remove('is-active');
      active.el.classList.add('is-active');
      lastActiveEl = active.el;
    }
    updateYear(active.year);

    // Summer-2027 idle spin — fires once, unprompted, when that card
    // nears the reading line.
    if (!summerIdleFired && summerCard && idx >= cardDefs.indexOf(summerCard) - 1) {
      summerIdleFired = true;
      if (!REDUCED_MOTION) {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(fireIdleSpin, CONFIG.idleSpinDelayMs);
      }
    }
  }

  function fireIdleSpin() {
    yearIdleWrap.style.animation = 'none';
    void yearIdleWrap.offsetHeight;
    yearIdleWrap.style.animation = `tlIdleSpin ${CONFIG.idleSpinDurationMs}ms ease-in-out`;
    yearWindow.classList.add('is-spinning');
    setTimeout(() => yearWindow.classList.remove('is-spinning'), CONFIG.idleSpinDurationMs);
  }

  /* ── Input handling: wheel(deltaX), drag, touch, arrow keys ─
     All of it funnels into window.scrollBy so the track's position
     stays a pure function of real page scroll. ────────────────── */
  viewport.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      window.scrollBy({ top: e.deltaX });
      e.preventDefault();
    }
  }, { passive: false });

  // setPointerCapture below redirects pointerup's target to the
  // viewport itself (standard pointer-capture behavior), which
  // suppresses the browser's native 'click' synthesis on whichever
  // card was actually under the pointer — so a real drag can coexist
  // with a real click, total movement is tracked here and a "click"
  // under CLICK_THRESHOLD px is dispatched manually against the
  // pointerdown target instead of relying on the (suppressed) native
  // click event for pointer-driven interactions.
  const CLICK_THRESHOLD = 6;
  let dragging = false, lastPointerX = 0, downX = 0, downY = 0, downTarget = null, moved = 0;
  viewport.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastPointerX = e.clientX;
    downX = e.clientX; downY = e.clientY;
    downTarget = e.target;
    moved = 0;
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastPointerX;
    lastPointerX = e.clientX;
    moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
    window.scrollBy({ top: -dx });
  });
  function endDrag(e) {
    dragging = false;
    viewport.classList.remove('is-dragging');
    if (moved < CLICK_THRESHOLD && downTarget) {
      const card = downTarget.closest ? downTarget.closest('.timeline-card--project') : null;
      if (card) {
        const project = PROJECTS.find((proj) => proj.id === card.dataset.projectId);
        if (project && window.openCaseStudy) window.openCaseStudy(project);
      }
    }
    downTarget = null;
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { window.scrollBy({ top: cardStepPx, behavior: REDUCED_MOTION ? 'auto' : 'smooth' }); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { window.scrollBy({ top: -cardStepPx, behavior: REDUCED_MOTION ? 'auto' : 'smooth' }); e.preventDefault(); }
  });

  /* ── Init / listeners ─────────────────────────────────────── */
  measure();
  render();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); render(); });
  if (window.ResizeObserver) {
    new ResizeObserver(() => { measure(); render(); }).observe(viewport);
  }
})();
