/* ================================================================
   cursor.js — a single black dot that IS the cursor (pointer devices
   only): it sits exactly on the pointer, grows on hover, shrinks on
   press. Over an element with [data-cursor-label], the dot morphs
   from a circle into an oval pill carrying that label's text (e.g.
   "eye" / "hand").

   Tracking is 1:1 with no easing or trailing. The position is read
   from the browser's fastest pointer event (pointerrawupdate where it
   exists, pointermove otherwise) and written once per frame, so the
   dot never lags behind the real pointer. It exists under reduced
   motion too (following the pointer isn't decorative motion), so the
   system arrow never has to stand in for it.
   ================================================================ */
(function () {
  'use strict';
  const CFG = (window.SITE_CONFIG && window.SITE_CONFIG.cursor) || {};
  const IS_FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!IS_FINE_POINTER) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');

  const inner = document.createElement('div');
  inner.className = 'cursor-dot-inner';
  dot.appendChild(inner);

  const pill = document.createElement('div');
  pill.className = 'cursor-dot-pill';
  const pillText = document.createElement('span');
  pill.appendChild(pillText);
  dot.appendChild(pill);

  document.body.appendChild(dot);

  let x = -200, y = -200;
  let dirty = false;

  function place() {
    dirty = false;
    // translate(-50%,-50%) centers on (x,y) whatever the dot's current
    // size, so the pill's variable text width never needs measuring.
    dot.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) translate(-50%, -50%)';
  }
  function onMove(e) {
    x = e.clientX;
    y = e.clientY;
    if (!dirty) { dirty = true; requestAnimationFrame(place); }
    dot.classList.remove('is-away');
  }
  const moveEvent = 'onpointerrawupdate' in window ? 'pointerrawupdate' : 'pointermove';
  document.addEventListener(moveEvent, onMove, { passive: true });
  // pointermove still fires during drags/scroll in some browsers where
  // the raw event pauses, so keep it as a backup either way.
  if (moveEvent !== 'pointermove') document.addEventListener('pointermove', onMove, { passive: true });

  // Hide the dot while the pointer is outside the page, instead of
  // leaving it parked at the last edge it touched.
  document.documentElement.addEventListener('pointerleave', () => dot.classList.add('is-away'));
  window.addEventListener('blur', () => dot.classList.add('is-away'));

  document.addEventListener('pointerdown', () => dot.classList.add('is-pressed'));
  document.addEventListener('pointerup', () => dot.classList.remove('is-pressed'));

  const hoverSelector = CFG.hoverSelector || 'a, button';
  const labelSelector = '[data-cursor-label]';
  document.addEventListener('pointerover', (e) => {
    if (!e.target.closest) return;
    const labelTarget = e.target.closest(labelSelector);
    if (labelTarget) {
      pillText.textContent = labelTarget.getAttribute('data-cursor-label');
      dot.classList.add('is-labeled');
    } else if (e.target.closest(hoverSelector)) {
      dot.classList.add('is-hovering');
    }
  });
  document.addEventListener('pointerout', (e) => {
    if (!e.target.closest) return;
    if (e.target.closest(labelSelector)) dot.classList.remove('is-labeled');
    if (e.target.closest(hoverSelector)) dot.classList.remove('is-hovering');
  });
})();
