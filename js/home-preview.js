/* ================================================================
   home-preview.js — renders the home page's "Selected Work" teaser
   (top 3 projects from work-data.js), each linking through to its
   case study on work.html. Full listing lives on work.html itself
   (see work-render.js) — this is a lighter preview only.
   ================================================================ */
(function () {
  'use strict';
  const grid = document.getElementById('home-preview-grid');
  if (!grid || typeof PROJECTS === 'undefined') return;

  const PREVIEW_COUNT = 3;
  PROJECTS.slice(0, PREVIEW_COUNT).forEach((p) => {
    const a = document.createElement('a');
    a.className = 'preview-card reveal';
    a.href = 'work.html#' + p.id;
    a.setAttribute('aria-label', 'Open: ' + p.title);

    const thumb = document.createElement('div');
    thumb.className = 'preview-card-thumb';
    thumb.style.background = p.logo ? '#fff' : p.color;

    if (p.image) {
      const img = document.createElement('img');
      img.src = p.image;
      img.alt = p.title;
      img.loading = 'lazy';
      thumb.appendChild(img);
    }

    a.appendChild(thumb);
    a.insertAdjacentHTML('beforeend', `
      <p class="preview-card-context">${p.context}</p>
      <p class="preview-card-title">${p.title}</p>
    `);
    grid.appendChild(a);
  });
})();
