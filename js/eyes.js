/* ================================================================
   eyes.js — 3-phase blink + cursor-tracking pupil.

   The eye is three traced raster frames (assets/hero/eye-phase{1,2,3})
   stacked in #eye-stage, all sharing identical pixel dimensions so a
   frame swap never shifts or resizes anything — only one carries
   .is-visible at a time, swapped with no transition (setFrame). Rests
   on phase 1 (open); every ~3-5s (randomized) it blinks through
   1->2->3->2->1, holding each of 2/3 for ~70ms.

   The pupil is a separate circle (#eye-pupil) that tracks the cursor
   while the eye is open (phase 1) and freezes in place for the length
   of a blink, easing to wherever the cursor is once the eye reopens.
   Its travel is clamped to an ellipse measured off phase 1's art so
   the WHOLE circle always stays inside the eye outline, never cut off
   by it. During a blink it sits in a masked layer (#eye-pupil-clip)
   whose mask-image follows the current frame, so the closing lid
   covers it, and it's hidden outright on phase 3 (eyes fully shut).
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
  // The pupil as drawn (radius 0.1763 of the width) is as tall as the
  // eye opening, which leaves it no room to move without crossing the
  // lids, so it's drawn at 70% of that. TRAVEL is the largest ellipse
  // of pupil-center positions where that circle, plus a few pixels of
  // margin for the outline's soft edge, sits entirely inside the white
  // of phase 1's eye (cx/rx are fractions of the art's width, cy/ry of
  // its height); its center doubles as the resting, look-ahead spot.
  const PUPIL_RADIUS_FRAC = 0.1234;
  const TRAVEL_FRAC = { cx: 0.5128, cy: 0.6012, rx: 0.1080, ry: 0.0563 };
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
    ellipse = {
      cx: originX + painted.width * TRAVEL_FRAC.cx,
      cy: originY + painted.height * TRAVEL_FRAC.cy,
      rx: painted.width * TRAVEL_FRAC.rx,
      ry: painted.height * TRAVEL_FRAC.ry
    };
    restX = ellipse.cx;
    restY = ellipse.cy;
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
    if (phase !== 1) return; // mid-blink: hold still until the eye reopens
    const factor = 1 - Math.pow(1 - EASE, dt * 60);
    curX += (targetX - curX) * factor;
    curY += (targetY - curY) * factor;
    pupil.style.left = curX + 'px';
    pupil.style.top = curY + 'px';
  }
  requestAnimationFrame(frame);
})();
