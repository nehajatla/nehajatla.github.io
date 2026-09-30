/* ================================================================
   home-preview.js — renders the home page's "Selected Work" teaser:
   the first 3 real projects from PROJECT_TIMELINE_ORDER (the SAME
   chronological order used by the real work.html timeline — see
   work-data.js), each linking through to its case study on work.html.
   Full listing lives on work.html itself (see work-timeline.js) —
   this is a lighter preview of the same real data, not a separate
   set of cards.
   ================================================================ */
(function () {
  'use strict';
  const grid = document.getElementById('home-preview-grid');
  if (!grid || typeof PROJECTS === 'undefined' || typeof PROJECT_TIMELINE_ORDER === 'undefined') return;

  const PREVIEW_COUNT = 3;
  PROJECT_TIMELINE_ORDER.slice(0, PREVIEW_COUNT).forEach(({ id }) => {
    const p = PROJECTS.find((proj) => proj.id === id);
    if (!p) return;

    const a = document.createElement('a');
    a.className = 'preview-card reveal';
    a.href = 'work.html#' + p.id;
    a.setAttribute('aria-label', 'Open: ' + p.title);

    const thumb = document.createElement('div');
    thumb.className = 'preview-card-thumb' + (p.logo ? ' preview-card-thumb--logo' : '');
    thumb.style.background = p.logo ? '#fff' : p.color;

    if (p.video) {
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.src = p.video;
      thumb.appendChild(video);
      video.play().catch(() => {});
    } else if (p.image) {
      const img = document.createElement('img');
      // Same as the work-timeline strip: show the animated hoverImage
      // (gif) directly rather than gating it behind hover, so it's
      // always in motion here too.
      img.src = p.hoverImage || p.image;
      img.alt = p.title;
      img.loading = 'lazy';
      thumb.appendChild(img);
    }

    a.appendChild(thumb);
    a.insertAdjacentHTML('beforeend', `
      <p class="preview-card-title">${p.title}</p>
      <p class="preview-card-role">${p.role || ''}</p>
    `);
    grid.appendChild(a);
  });
})();
