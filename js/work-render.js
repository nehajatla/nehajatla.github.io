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
  const tocEl    = document.getElementById('case-toc');
  const backBtn  = document.getElementById('case-back');
  const closeBtn = document.getElementById('case-close');

  if (!overlay || typeof PROJECTS === 'undefined') return;

  // Exposed so work-timeline.js's card click handler can open a case
  // study directly with the project object it already has, instead of
  // duplicating this overlay's populate/open logic there.
  window.openCaseStudy = open;

  // Builds the sidebar from whichever h3s the current body actually
  // has — some projects are still just a "coming soon" paragraph with
  // none, in which case :empty in CSS hides the sidebar entirely
  // rather than showing an empty column.
  let tocLinks = [];
  let tocHeadings = [];
  function buildToc(projectId) {
    if (!tocEl) return;
    tocEl.innerHTML = '';
    // The meta row (role/timeline/team/skills) counts as "Overview";
    // each h3 carries a one-word data-toc label for the sidebar, while
    // its full sentence stays as the heading in the body.
    const meta = bodyEl.querySelector('.case-meta');
    if (meta) meta.dataset.toc = 'Overview';
    tocHeadings = Array.from(bodyEl.querySelectorAll('.case-meta, h3'));
    tocLinks = tocHeadings.map((h, i) => {
      const id = 'sec-' + i + '-' + h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '').slice(0, 40);
      h.id = id;
      const a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = h.dataset.toc || h.textContent;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        h.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + projectId);
      });
      tocEl.appendChild(a);
      return a;
    });
  }

  // Highlights whichever section is currently at/above the top of the
  // scrolled view, so the sidebar tracks reading position rather than
  // only reacting to clicks.
  function updateActiveToc() {
    if (!tocHeadings.length) return;
    const threshold = overlay.getBoundingClientRect().top + 170;
    let activeIdx = 0;
    for (let i = 0; i < tocHeadings.length; i++) {
      if (tocHeadings[i].getBoundingClientRect().top <= threshold) activeIdx = i;
    }
    tocLinks.forEach((a, i) => a.classList.toggle('is-active', i === activeIdx));
  }
  overlay.addEventListener('scroll', updateActiveToc, { passive: true });

  // Case-study videos are hosted on the site (not embedded from another
  // site) with these small custom controls: an embedded frame from
  // another origin can't be styled, so the system arrow would replace
  // the site's dot cursor over it.
  function initVideo(wrap) {
    const video = wrap.querySelector('video');
    const big = wrap.querySelector('.case-video-play');
    const toggle = wrap.querySelector('.case-video-toggle');
    const seek = wrap.querySelector('.case-video-seek');
    const time = wrap.querySelector('.case-video-time');
    const fmt = (t) => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
    const flip = () => (video.paused ? video.play() : video.pause());
    big.addEventListener('click', flip);
    toggle.addEventListener('click', flip);
    video.addEventListener('click', flip);
    video.addEventListener('play', () => { wrap.classList.add('is-playing'); toggle.textContent = 'Pause'; toggle.setAttribute('aria-label', 'Pause'); });
    video.addEventListener('pause', () => { wrap.classList.remove('is-playing'); toggle.textContent = 'Play'; toggle.setAttribute('aria-label', 'Play'); });
    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      seek.value = String(Math.round((video.currentTime / video.duration) * 1000));
      time.textContent = fmt(video.currentTime) + ' / ' + fmt(video.duration);
    });
    seek.addEventListener('input', () => {
      if (video.preload === 'none') video.preload = 'metadata';
      const go = () => { video.currentTime = (seek.value / 1000) * video.duration; };
      if (video.duration) go(); else video.addEventListener('loadedmetadata', go, { once: true });
    });
  }

  function open(p) {
    labelEl.textContent = p.context;
    titleEl.textContent = p.title;
    metaEl.textContent = p.tags.join(' · ');
    bodyEl.innerHTML = p.body;
    bodyEl.querySelectorAll('.case-video').forEach(initVideo);
    buildToc(p.id);
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    overlay.scrollTop = 0;
    updateActiveToc();
    backBtn.focus();
    history.replaceState(null, '', '#' + p.id);
  }

  const close = () => {
    bodyEl.querySelectorAll('video').forEach((v) => v.pause());
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
