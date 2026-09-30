/* ================================================================
   nav.js — shared navigation behavior for every page:
     - marks the active nav link with aria-current="page"
     - toggles translucent+blur nav background once scrolled
     - short crossfade page transitions via the View Transitions API
       where supported, instant fallback otherwise
   ================================================================ */
(function () {
  'use strict';

  const nav = document.querySelector('.nav');
  const page = document.body.dataset.page;

  if (page) {
    document.querySelectorAll('.nav-link').forEach((link) => {
      if (link.dataset.page === page) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── Page transitions — a short crossfade between pages. This site
  // is plain multi-page HTML (no client router), so the real API here
  // is the CROSS-DOCUMENT View Transitions opt-in — the CSS
  // `@view-transition { navigation: auto; }` rule in base.css —
  // which browsers that support it (e.g. current Chrome) honor
  // automatically on same-origin navigations with zero JS. Browsers
  // without support just navigate instantly, which is the required
  // fallback. `document.startViewTransition` is the SAME-document
  // (SPA) API and doesn't apply here, so it's deliberately not used.
  // The nav is given a stable view-transition-name so it reads as
  // continuous across the swap rather than crossfading with the rest
  // of the page.
  if (nav) nav.style.viewTransitionName = 'site-nav';
})();
