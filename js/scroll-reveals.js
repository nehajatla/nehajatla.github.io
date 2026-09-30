/* ================================================================
   scroll-reveals.js — fade/slide-up reveals via IntersectionObserver,
   staggered ~80ms apart within each container. Consistent motion
   across every page. Reduced-motion visitors get plain, already-
   visible content (see .reveal in base.css — opacity:1 there).
   ================================================================ */
(function () {
  'use strict';
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Stagger by DOM order within each shared parent.
  const staggerIndex = new Map();
  items.forEach((el) => {
    const parent = el.parentElement;
    const n = staggerIndex.get(parent) || 0;
    el.style.transitionDelay = (n * 80) + 'ms';
    staggerIndex.set(parent, n + 1);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  items.forEach((el) => io.observe(el));
})();
