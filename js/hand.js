/* ================================================================
   hand.js — hand wave module. Rotates the single hand-rest.png image
   smoothly (eased tween through config angle waypoints, NOT stepped
   frame-swapping) around a wrist pivot taken from config, so the palm
   swings naturally from the wrist. Plays only while hovered, finishes
   its current cycle then eases back to rest on leave (never stops
   mid-swing). Tap-to-play N cycles on touch.

   Limitation: the source asset is a single merged arm+palm crop (no
   separate layers), so the whole image rotates together — the visible
   forearm segment sits very close to the pivot, so its swing is small,
   but it isn't perfectly static. Flagged as a known asset limitation.
   ================================================================ */
(function () {
  'use strict';
  const CONFIG = (window.SITE_CONFIG && window.SITE_CONFIG.hero) || {};
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;

  const wrap = document.getElementById('hand-wrap');
  const img = document.getElementById('hand-img');
  if (!wrap || !img) return;
  const cfg = CONFIG.hand;

  img.src = CONFIG.assets.hand.rest;
  wrap.style.overflow = 'visible';
  // Size/position tuning from config.js — arm and palm scale together
  // (the whole box grows uniformly), so proportions and the wrist
  // pivot (computed below from the box's actual rendered size) stay
  // correct at any scale.
  document.documentElement.style.setProperty('--hand-scale', cfg.scale != null ? cfg.scale : 1);
  document.documentElement.style.setProperty('--hand-offset-y', (cfg.offsetY || 0) + 'px');

  function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function setPivot() {
    const box = img.getBoundingClientRect();
    const nw = img.naturalWidth, nh = img.naturalHeight;
    if (!nw || !nh || !box.width || !box.height) return;
    const boxRatio = box.width / box.height, imgRatio = nw / nh;
    let w, h, x, y;
    if (imgRatio > boxRatio) {
      w = box.width; h = w / imgRatio; x = 0; y = (box.height - h) / 2;
    } else {
      h = box.height; w = h * imgRatio; y = 0; x = (box.width - w) / 2;
    }
    const px = x + w * cfg.pivotFrac.x;
    const py = y + h * cfg.pivotFrac.y;
    img.style.transformOrigin = px + 'px ' + py + 'px';
  }

  if (REDUCED_MOTION) {
    setPivot();
    img.style.transform = 'rotate(' + (cfg.angles[1] || 0) + 'deg)'; // one static wave pose
    return;
  }

  setPivot();
  window.addEventListener('resize', setPivot);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setPivot);

  let phase = 'idle'; // idle | cycle | pausing | returning
  let segIndex = 0, segFrom = 0, segTo = 0, segStart = 0, segDur = 0;
  let pauseStart = 0;
  let currentAngle = 0;
  let stopRequested = false;
  let cyclesRemaining = 0;
  let rafId = null;

  const angles = cfg.angles;
  const segCount = angles.length - 1;
  const perSegDur = cfg.cycleDuration / segCount;

  function applyRotation(deg) {
    currentAngle = deg;
    img.style.transform = 'rotate(' + deg.toFixed(2) + 'deg)';
  }

  function enterReturning(now) {
    phase = 'returning';
    segFrom = currentAngle;
    segStart = now;
  }

  function beginCycle(now, fromAngle) {
    phase = 'cycle';
    segIndex = 0;
    segFrom = fromAngle;
    segTo = angles[1];
    segStart = now;
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);

    if (phase === 'cycle') {
      const t = clamp((now - segStart) / perSegDur, 0, 1);
      applyRotation(lerp(segFrom, segTo, easeInOutSine(t)));
      if (t >= 1) {
        segIndex++;
        if (segIndex >= segCount) {
          if (cyclesRemaining > 0) cyclesRemaining--;
          if (stopRequested && cyclesRemaining <= 0) { enterReturning(now); return; }
          phase = 'pausing';
          pauseStart = now;
        } else {
          segFrom = angles[segIndex];
          segTo = angles[segIndex + 1];
          segStart = now;
        }
      }
    } else if (phase === 'pausing') {
      if (now - pauseStart >= cfg.pauseDuration) {
        if (stopRequested && cyclesRemaining <= 0) { enterReturning(now); return; }
        beginCycle(now, 0);
      }
    } else if (phase === 'returning') {
      const t = clamp((now - segStart) / cfg.returnDuration, 0, 1);
      applyRotation(lerp(segFrom, 0, easeInOutSine(t)));
      if (t >= 1) { phase = 'idle'; }
    }
  }

  function startWave() {
    stopRequested = false;
    if (phase === 'cycle' || phase === 'pausing') return;
    beginCycle(performance.now(), currentAngle);
  }
  function finishThenRest() {
    stopRequested = true;
  }

  if (!IS_TOUCH) {
    wrap.addEventListener('mouseenter', startWave);
    wrap.addEventListener('mouseleave', finishThenRest);
    wrap.addEventListener('focus', startWave);
    wrap.addEventListener('blur', finishThenRest);
  } else {
    wrap.addEventListener('touchstart', () => {
      cyclesRemaining = cfg.touchCycles; // NOT cfg.touchCycles - 1
      stopRequested = true; // finishes after touchCycles loops, then eases to rest
      startWave();
    }, { passive: true });
  }

  rafId = requestAnimationFrame(frame);
})();
