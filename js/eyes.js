/* ================================================================
   eyes.js — pupil-tracking for the static inline eye SVG (index.html
   #eye-svg). The eye itself (outline + lashes) never changes; this
   only moves the #eye-pupil circle toward the cursor, clamped to an
   ellipse inscribed in the eye's own outline (via getScreenCTM, so it
   works in the SVG's own coordinate space regardless of how large the
   SVG is actually rendered on the page) so it can never visually cross
   the drawn outline — the outline's clip-path is a second safety net
   on top of that. Tracks the cursor anywhere on the page (not just
   near the eye) and eases back to its resting position when the
   cursor leaves the window. Not gated on hovering the eye: the eye is
   always "open" now, there is no blink state.
   ================================================================ */
(function () {
  'use strict';
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;

  const svg = document.getElementById('eye-svg');
  const pupil = document.getElementById('eye-pupil');
  const eyeContent = document.getElementById('eye-content');
  if (!svg || !pupil) return;

  // Auto-blink: a quick flat-scale-and-back on #eye-content, at a
  // randomized 5-6s interval (fixed timing reads as mechanical; a
  // little jitter reads as a natural blink). Web Animations API rather
  // than the rAF tween pattern used elsewhere here, since it's a
  // one-shot effect with no per-frame state to track.
  if (eyeContent && eyeContent.animate && !REDUCED_MOTION) {
    function scheduleBlink() {
      const delay = 5000 + Math.random() * 1000;
      setTimeout(() => {
        eyeContent.animate(
          [
            { transform: 'scaleY(1)' },
            { transform: 'scaleY(0.05)', offset: 0.45 },
            { transform: 'scaleY(1)' }
          ],
          { duration: 220, easing: 'ease-in-out' }
        );
        scheduleBlink();
      }, delay);
    }
    scheduleBlink();
  }

  // Resting position — exactly the source vector's own pupil cx/cy.
  const REST_X = parseFloat(pupil.getAttribute('cx'));
  const REST_Y = parseFloat(pupil.getAttribute('cy'));
  const PUPIL_R = parseFloat(pupil.getAttribute('r'));

  // Ellipse inscribed in the pod outline's own bounding box (measured
  // from the source vector: x 421.164-765.269, y 176.247-335.189),
  // shrunk by the pupil's own radius + a small pad so its EDGE stays
  // inside the outline, not just its center.
  const POD = { x0: 421.164, y0: 176.247, x1: 765.269, y1: 335.189 };
  const PAD = 2;
  const ELLIPSE = {
    cx: (POD.x0 + POD.x1) / 2,
    cy: (POD.y0 + POD.y1) / 2,
    rx: Math.max(0, (POD.x1 - POD.x0) / 2 - PUPIL_R - PAD),
    ry: Math.max(0, (POD.y1 - POD.y0) / 2 - PUPIL_R - PAD)
  };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // Clamps a desired absolute (x,y) to ELLIPSE by scaling back radially
  // along its own direction from the ellipse center — reads as a
  // smooth oval boundary rather than clamping each axis independently.
  function clampToEllipse(x, y) {
    if (ELLIPSE.rx <= 0 || ELLIPSE.ry <= 0) return { x: ELLIPSE.cx, y: ELLIPSE.cy };
    const relX = x - ELLIPSE.cx, relY = y - ELLIPSE.cy;
    const norm = (relX * relX) / (ELLIPSE.rx * ELLIPSE.rx) + (relY * relY) / (ELLIPSE.ry * ELLIPSE.ry);
    if (norm <= 1) return { x, y };
    const scale = 1 / Math.sqrt(norm);
    return { x: ELLIPSE.cx + relX * scale, y: ELLIPSE.cy + relY * scale };
  }

  function toSvgPoint(clientX, clientY) {
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: REST_X, y: REST_Y };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }

  let curX = REST_X, curY = REST_Y;
  let targetX = REST_X, targetY = REST_Y;
  const EASE = 0.28;

  if (REDUCED_MOTION) {
    pupil.setAttribute('cx', REST_X);
    pupil.setAttribute('cy', REST_Y);
    return;
  }

  function onMove(clientX, clientY) {
    const p = toSvgPoint(clientX, clientY);
    const clamped = clampToEllipse(p.x, p.y);
    targetX = clamped.x;
    targetY = clamped.y;
  }

  function reset() {
    targetX = REST_X;
    targetY = REST_Y;
  }

  if (!IS_TOUCH) {
    document.addEventListener('pointermove', (e) => onMove(e.clientX, e.clientY), { passive: true });
    // Fires when the pointer leaves the viewport entirely (relatedTarget
    // is null/undefined only in that case, not for ordinary moves
    // between elements inside the page).
    document.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget) reset();
    });
  }

  // Frame-rate-independent easing — see cursor.js's own frame loop for
  // why a plain per-frame multiplier looks jerky when frame timing
  // varies; this scales the lerp factor by elapsed time instead.
  let lastTime = null;
  function frame(now) {
    requestAnimationFrame(frame);
    if (lastTime === null) lastTime = now;
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const factor = 1 - Math.pow(1 - EASE, dt * 60);
    curX += (targetX - curX) * factor;
    curY += (targetY - curY) * factor;
    pupil.setAttribute('cx', curX.toFixed(2));
    pupil.setAttribute('cy', curY.toFixed(2));
  }
  requestAnimationFrame(frame);
})();
