/* ================================================================
   cursor.js — a single black dot that follows the pointer with lerp
   easing (pointer devices only), grows on hover, shrinks on press.
   Over an element with [data-cursor-label], the dot itself morphs
   from a circle into an oval pill carrying that label's text (e.g.
   "eye" / "hand") instead of just growing. Transform-only
   (translate3d + a constant translate(-50%,-50%) for centering, so
   the pill's variable width never needs JS to know its own size).
   ================================================================ */
(function () {
  'use strict';
  const CFG = (window.SITE_CONFIG && window.SITE_CONFIG.cursor) || {};
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (REDUCED_MOTION || !IS_FINE_POINTER) return;

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

  const ease = CFG.ease || 0.25;
  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let targetX = x, targetY = y;
  let started = false;

  document.addEventListener('pointermove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!started) { started = true; x = targetX; y = targetY; }
  }, { passive: true });

  document.addEventListener('pointerdown', () => dot.classList.add('is-pressed'));
  document.addEventListener('pointerup', () => dot.classList.remove('is-pressed'));

  const hoverSelector = CFG.hoverSelector || 'a, button';
  const labelSelector = '[data-cursor-label]';
  document.addEventListener('pointerover', (e) => {
    if (!(e.target.closest && e.target.closest)) return;
    const labelTarget = e.target.closest(labelSelector);
    if (labelTarget) {
      pillText.textContent = labelTarget.getAttribute('data-cursor-label');
      dot.classList.add('is-labeled');
    } else if (e.target.closest(hoverSelector)) {
      dot.classList.add('is-hovering');
    }
  });
  document.addEventListener('pointerout', (e) => {
    if (!(e.target.closest && e.target.closest)) return;
    if (e.target.closest(labelSelector)) dot.classList.remove('is-labeled');
    if (e.target.closest(hoverSelector)) dot.classList.remove('is-hovering');
  });

  // Frame-rate-independent smoothing: a plain `x += (target-x)*ease` looks
  // jerky whenever the frame interval varies (e.g. the WebGL background
  // on this page occasionally pushes a frame long), because the same
  // per-frame factor then represents a different amount of real time.
  // Scaling the factor by the actual elapsed time keeps the motion at
  // the same visual speed regardless of frame pacing.
  let lastTime = null;
  function frame(now) {
    if (lastTime === null) lastTime = now;
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const factor = 1 - Math.pow(1 - ease, dt * 60);

    x += (targetX - x) * factor;
    y += (targetY - y) * factor;
    // Snap once close enough to kill residual sub-pixel drift/jitter.
    if (Math.abs(targetX - x) < 0.05) x = targetX;
    if (Math.abs(targetY - y) < 0.05) y = targetY;

    // translate(-50%,-50%) centers on (x,y) regardless of the dot's own
    // current box size, so the pill's variable text width never has to
    // be measured/subtracted here the way a fixed circle radius was.
    dot.style.transform = 'translate3d(' + (Math.round(x * 100) / 100) + 'px, ' + (Math.round(y * 100) / 100) + 'px, 0) translate(-50%, -50%)';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
