/* ================================================================
   about.js — Instagram Stories style photo viewer for about.html.

   Each group (Professional / Dance / Casual) is a run of photos; a
   bar per photo fills over PHOTO_MS, then it advances, rolling into
   the next group at the end of one. Tap the left third to go back,
   the rest to go forward; press and hold (or Space) pauses; ← / →
   step when the viewer has focus. It also pauses while scrolled out
   of view or the tab is hidden. Under reduced motion nothing
   advances on its own; tapping still steps through.
   ================================================================ */
(function () {
  'use strict';
  const root = document.getElementById('stories');
  if (!root) return;

  const GROUPS = [
    { name: 'Professional', photos: [
      { src: 'assets/about/face-1.jpg', alt: 'Neha in a black blazer under the stone arches at Duke', caption: 'Duke' },
      { src: 'work/metlife/neha-metlife.jpg', alt: 'Neha in front of a large MetLife sign', caption: 'MetLife, summer 2026', contain: true },
      { src: 'work/duke-cs-plus/cs-plus-team.jpg', alt: 'Neha and Amanda Guo beside their CS+ research poster', caption: 'Duke CS+ research poster, 2025', contain: true }
    ] },
    { name: 'Dance', photos: [
      { src: 'assets/about/face-4.jpg', alt: 'Neha performing Bharatanatyam on stage', caption: 'Bharatanatyam' },
      { src: 'assets/about/face-2.jpg', alt: 'Neha mid-jump on stage in an orange costume', caption: 'On stage' }
    ] },
    { name: 'Casual', photos: [
      { src: 'assets/about/face-3.jpg', alt: 'Neha smiling in a cafe', caption: 'Cafe hopping' }
    ] }
  ];
  const PHOTO_MS = 5000;
  const HOLD_MS = 220; // a press longer than this is a hold (pause), not a tap
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const viewer = root.querySelector('.stories-viewer');
  const barsEl = root.querySelector('.stories-bars');
  const frame = root.querySelector('.stories-frame');
  const captionEl = root.querySelector('.stories-caption');
  const groupsEl = root.querySelector('.stories-groups');

  // Build every slide up front (all images load once, so stepping
  // never flickers); group buttons below the viewer.
  const slides = GROUPS.map((g) => g.photos.map((ph) => {
    const slide = document.createElement('div');
    slide.className = 'stories-slide' + (ph.contain ? ' is-contain' : '');
    if (ph.contain) {
      const bg = document.createElement('img');
      bg.className = 'stories-bg'; bg.src = ph.src; bg.alt = ''; bg.setAttribute('aria-hidden', 'true');
      slide.appendChild(bg);
    }
    const img = document.createElement('img');
    img.className = 'stories-fg'; img.src = ph.src; img.alt = ph.alt;
    slide.appendChild(img);
    frame.appendChild(slide);
    return slide;
  }));
  const groupButtons = GROUPS.map((g, gi) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'stories-group'; b.textContent = g.name;
    b.addEventListener('click', () => go(gi, 0));
    groupsEl.appendChild(b);
    return b;
  });

  let group = 0, photo = 0, elapsed = 0;
  let held = false, offscreen = false, last = null;
  let bars = [];

  function renderBars() {
    barsEl.innerHTML = '';
    bars = GROUPS[group].photos.map((_, i) => {
      const bar = document.createElement('div');
      bar.className = 'stories-bar' + (i < photo ? ' is-done' : '');
      bar.appendChild(document.createElement('i'));
      barsEl.appendChild(bar);
      return bar;
    });
  }

  function go(g, p) {
    group = (g + GROUPS.length) % GROUPS.length;
    photo = p;
    elapsed = 0;
    slides.flat().forEach((s) => s.classList.remove('is-active'));
    slides[group][photo].classList.add('is-active');
    captionEl.textContent = GROUPS[group].photos[photo].caption;
    groupButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === group)));
    renderBars();
  }

  function next() {
    if (photo < GROUPS[group].photos.length - 1) go(group, photo + 1);
    else go(group + 1, 0);
  }
  function prev() {
    if (photo > 0) go(group, photo - 1);
    else { const g = (group - 1 + GROUPS.length) % GROUPS.length; go(g, GROUPS[g].photos.length - 1); }
  }

  function tick(now) {
    requestAnimationFrame(tick);
    const dt = last === null ? 0 : Math.min(now - last, 100);
    last = now;
    if (REDUCED_MOTION || held || offscreen || document.hidden) return;
    elapsed += dt;
    const bar = bars[photo];
    if (bar) bar.firstChild.style.width = Math.min(100, (elapsed / PHOTO_MS) * 100) + '%';
    if (elapsed >= PHOTO_MS) next();
  }

  // Tap vs hold on the two invisible halves.
  let pressTimer = null, wasHold = false;
  function bindTap(btn, action) {
    btn.addEventListener('pointerdown', () => {
      wasHold = false;
      pressTimer = setTimeout(() => { wasHold = true; held = true; }, HOLD_MS);
    });
    const release = () => { clearTimeout(pressTimer); held = false; };
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('click', () => { if (!wasHold) action(); wasHold = false; });
  }
  bindTap(root.querySelector('.stories-tap--prev'), prev);
  bindTap(root.querySelector('.stories-tap--next'), next);

  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
    else if (e.key === ' ') { held = !held; e.preventDefault(); }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => { offscreen = !entries[0].isIntersecting; }).observe(viewer);
  }

  go(0, 0);
  requestAnimationFrame(tick);
})();
