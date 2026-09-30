/* ================================================================
   work-render.js — case-study overlay engine for work.html. The card
   grid this file used to render has been replaced by the horizontal
   calendar timeline (see js/work-timeline.js + css/work-timeline.css);
   the timeline's own cards are intentionally inert for now (case
   studies "open later" per the current build). This file now only
   keeps the overlay itself alive, because index.html's home-page
   preview cards (js/home-preview.js) still link out to
   `work.html#<project-id>` and expect that hash to open the matching
   case study on load — removing this would silently break those
   links.
   ================================================================ */
(function () {
  'use strict';

  const overlay  = document.getElementById('case-overlay');
  const labelEl  = document.getElementById('case-hero-label');
  const titleEl  = document.getElementById('case-hero-title');
  const metaEl   = document.getElementById('case-hero-meta');
  const bodyEl   = document.getElementById('case-body');
  const backBtn  = document.getElementById('case-back');
  const closeBtn = document.getElementById('case-close');

  if (!overlay || typeof PROJECTS === 'undefined') return;

  // Exposed so work-timeline.js's card click handler can open a case
  // study directly with the project object it already has, instead of
  // duplicating this overlay's populate/open logic there.
  window.openCaseStudy = open;

  function open(p) {
    labelEl.textContent = p.context;
    titleEl.textContent = p.title;
    metaEl.textContent = p.tags.join(' · ');
    bodyEl.innerHTML = p.body;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    overlay.scrollTop = 0;
    backBtn.focus();
    history.replaceState(null, '', '#' + p.id);
  }

  const close = () => {
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    history.replaceState(null, '', window.location.pathname);
  };

  if (backBtn) backBtn.addEventListener('click', close);
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  const initial = PROJECTS.find((p) => window.location.hash === '#' + p.id);
  if (initial) open(initial);
})();
