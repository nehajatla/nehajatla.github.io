/* ================================================================
   eyes.js — 3-phase blink + cursor-tracking pupil.

   The eye is three traced raster frames (assets/hero/eye-phase{1,2,3})
   stacked in #eye-stage, all sharing identical pixel dimensions so a
   frame swap never shifts or resizes anything — only one carries
   .is-visible at a time, swapped with no transition (setFrame). Rests
   on phase 1 (open); every ~3-5s (randomized) it blinks through
   1->2->3->2->1, holding each of 2/3 for ~70ms.

   The pupil is a separate circle (#eye-pupil) that keeps tracking the
   cursor regardless of blink phase — it's inside a masked layer
   (#eye-pupil-clip) whose mask-image is swapped to match whichever
   frame's own outline is currently showing (phase 1's mask while
   resting/phase 1, phase 2's while mid-blink on phase 2), and hidden
   outright on phase 3 (eyes fully shut). Travel is additionally
   clamped to an ellipse inscribed in phase 1's outline (a soft, natural
   range — the mask is what actually guarantees no visual overflow).
   ================================================================ */
(function () {
  'use strict';
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;

  const stage = document.getElementById('eye-stage');
  const frames = [
    document.getElementById('eye-frame-1'),
    document.getElementById('eye-frame-2'),
    document.getElementById('eye-frame-3')
  ];
  const pupilClip = document.getElementById('eye-pupil-clip');
  const pupil = document.getElementById('eye-pupil');
  if (!stage || !pupilClip || !pupil || frames.some((f) => !f)) return;

  // Geometry measured directly off the traced source art (all three
  // frames share this canvas, see the asset header in that extraction
  // — phase 1's own painted rect is the reference for all of it).
  const PUPIL_CENTER_FRAC = { x: 0.6034, y: 0.5725 };
  const PUPIL_RADIUS_FRAC = 0.1763;
  const POD_BOUNDS_FRAC = { left: 0.0804, top: 0.2727, right: 0.9397, bottom: 0.9264 };
  const MASKS = {
    1: 'assets/hero/eye-phase1-mask.png',
    2: 'assets/hero/eye-phase2-mask.png'
  };
  // Masks are only ever referenced via CSS url(), never as an <img>,
  // so nothing else would trigger fetching them — without this, the
  // first blink's mask-image swap could paint before the PNG finished
  // loading, briefly showing the pupil full-circle/unclipped.
  Object.values(MASKS).forEach((src) => { new Image().src = src; });

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // object-fit:contain places the image's actual drawn content off-
  // center within its box whenever the box's aspect ratio doesn't
  // exactly match the image's own — this is that placement, in page
  // pixels, so pupil math can be relative to the ART, not the box.
  function getContainedRect(imgEl) {
    const box = imgEl.getBoundingClientRect();
    const nw = imgEl.naturalWidth, nh = imgEl.naturalHeight;
    if (!nw || !nh) return box;
    const boxRatio = box.width / box.height, imgRatio = nw / nh;
    let w, h, x, y;
    if (imgRatio > boxRatio) {
      w = box.width; h = w / imgRatio;
      x = box.left; y = box.top + (box.height - h) / 2;
    } else {
      h = box.height; w = h * imgRatio;
      y = box.top; x = box.left + (box.width - w) / 2;
    }
    return { left: x, top: y, width: w, height: h };
  }

  // All three frames share identical intrinsic dimensions, so any of
  // them gives the same painted rect — frame 1 is always in the DOM.
  function paintedRect() { return getContainedRect(frames[0]); }

  // Everything here is kept in STAGE-relative coordinates (matching
  // what onMove below computes from clientX/Y), not page coordinates —
  // painted.left/top are page-relative (from getBoundingClientRect),
  // so the stage's own offset is subtracted out up front.
  let ellipse = null;
  function recomputeEllipse() {
    const painted = paintedRect();
    const stageBox = stage.getBoundingClientRect();
    const originX = painted.left - stageBox.left, originY = painted.top - stageBox.top;
    const r = painted.width * PUPIL_RADIUS_FRAC;
    const pad = 1.5;
    const podLeft = originX + painted.width * POD_BOUNDS_FRAC.left;
    const podRight = originX + painted.width * POD_BOUNDS_FRAC.right;
    const podTop = originY + painted.height * POD_BOUNDS_FRAC.top;
    const podBottom = originY + painted.height * POD_BOUNDS_FRAC.bottom;
    ellipse = {
      cx: (podLeft + podRight) / 2,
      cy: (podTop + podBottom) / 2,
      rx: Math.max(0, (podRight - podLeft) / 2 - r - pad),
      ry: Math.max(0, (podBottom - podTop) / 2 - r - pad)
    };
    restX = originX + painted.width * PUPIL_CENTER_FRAC.x;
    restY = originY + painted.height * PUPIL_CENTER_FRAC.y;
    pupilDiameter = painted.width * PUPIL_RADIUS_FRAC * 2;
    pupil.style.width = pupilDiameter + 'px';
    pupil.style.height = pupilDiameter + 'px';
  }

  function clampToEllipse(x, y) {
    if (!ellipse || ellipse.rx <= 0 || ellipse.ry <= 0) return { x: ellipse ? ellipse.cx : x, y: ellipse ? ellipse.cy : y };
    const relX = x - ellipse.cx, relY = y - ellipse.cy;
    const norm = (relX * relX) / (ellipse.rx * ellipse.rx) + (relY * relY) / (ellipse.ry * ellipse.ry);
    if (norm <= 1) return { x, y };
    const scale = 1 / Math.sqrt(norm);
    return { x: ellipse.cx + relX * scale, y: ellipse.cy + relY * scale };
  }

  let restX = 0, restY = 0, pupilDiameter = 0;
  let curX = 0, curY = 0, targetX = 0, targetY = 0;
  let started = false;

  function onResize() {
    recomputeEllipse();
    if (!started) { curX = targetX = restX; curY = targetY = restY; started = true; }
  }
  recomputeEllipse();
  curX = targetX = restX;
  curY = targetY = restY;
  window.addEventListener('resize', onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

  // ---- blink state machine ------------------------------------------
  let phase = 1;
  function setFrame(n) {
    phase = n;
    frames.forEach((f, i) => f.classList.toggle('is-visible', i === n - 1));
    if (n === 3) {
      pupilClip.style.opacity = '0';
    } else {
      pupilClip.style.opacity = '1';
      pupilClip.style.maskImage = 'url(' + MASKS[n] + ')';
      pupilClip.style.webkitMaskImage = 'url(' + MASKS[n] + ')';
    }
  }
  setFrame(1);

  if (!REDUCED_MOTION) {
    const HOLD = 70; // ms per mid-blink frame
    function doBlink() {
      setFrame(2);
      setTimeout(() => {
        setFrame(3);
        setTimeout(() => {
          setFrame(2);
          setTimeout(() => setFrame(1), HOLD);
        }, HOLD);
      }, HOLD);
    }
    function scheduleBlink() {
      const delay = 3000 + Math.random() * 2000;
      setTimeout(() => { doBlink(); scheduleBlink(); }, delay);
    }
    scheduleBlink();
  }

  // ---- pupil tracking -------------------------------------------------
  if (REDUCED_MOTION) return;

  function onMove(clientX, clientY) {
    const stageBox = stage.getBoundingClientRect();
    const clamped = clampToEllipse(clientX - stageBox.left, clientY - stageBox.top);
    targetX = clamped.x;
    targetY = clamped.y;
  }
  function reset() { targetX = restX; targetY = restY; }

  if (!IS_TOUCH) {
    document.addEventListener('pointermove', (e) => onMove(e.clientX, e.clientY), { passive: true });
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) reset(); });
  }

  const EASE = 0.28;
  let lastTime = null;
  function frame(now) {
    requestAnimationFrame(frame);
    if (lastTime === null) lastTime = now;
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const factor = 1 - Math.pow(1 - EASE, dt * 60);
    curX += (targetX - curX) * factor;
    curY += (targetY - curY) * factor;
    pupil.style.left = curX + 'px';
    pupil.style.top = curY + 'px';
  }
  requestAnimationFrame(frame);
})();
