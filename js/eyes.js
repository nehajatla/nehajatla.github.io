/* ================================================================
   eyes.js — eye pupil-tracking module. Left and right eyes are two
   genuinely different drawn shapes (not a mirrored copy of one), each
   with its own crop, pupil position, and box aspect ratio — see
   CONFIG.assets.eye.left/right. Closed at rest; opens on hover-zone
   enter (wrap box + hoverPadding); pupils track the cursor as a
   single shared gaze vector (see updatePupilTargets) so they move in
   parallel instead of converging; eases back to center + closes on
   leave; reverses from the current frame if interrupted mid-
   animation. Tap-to-open + auto-close on touch.
   ================================================================ */
(function () {
  'use strict';
  const CONFIG = (window.SITE_CONFIG && window.SITE_CONFIG.hero) || {};
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  const wrap = document.getElementById('eye-wrap');
  const imgs = wrap ? Array.from(wrap.querySelectorAll('.eye-img')) : [];
  const eyeBoxes = wrap ? Array.from(wrap.querySelectorAll('.eye')) : [];
  const pupilsCanvas = document.getElementById('eye-pupils');
  if (!wrap || !imgs.length) return;
  const cfg = CONFIG.eye;
  const ctx = pupilsCanvas.getContext('2d');

  function cfg_eye(imgEl) { return CONFIG.assets.eye[imgEl.dataset.eye]; }

  let openness = 0;
  let openAnimStart = 0, openAnimFrom = 0, openAnimTo = 0, openAnimDur = cfg.openDuration;
  let animating = false;

  let pupilCur = imgs.map(() => ({ x: 0, y: 0 }));
  let pupilTarget = imgs.map(() => ({ x: 0, y: 0 }));
  let hovering = false;
  let rafId = null;
  let touchTimer = null;

  // Both eyes get the SAME WIDTH (not the same height) — see the long
  // comment on heightAspect in config.js for why: with genuinely
  // different drawn shapes, matching outer-box height (or even outer
  // box area) still let object-fit:contain fit one eye's art tighter
  // than the other's, so the DRAWN eyes ended up visibly different
  // sizes despite equal boxes. Matching width, with each eye's own
  // height derived from width/heightAspect (its own smaller aspect,
  // so contain is always width-constrained in both states), keeps the
  // actual drawn eye — not just its box — the same size on both sides.
  function sizeEyeBoxes() {
    wrap.style.width = '';
    const widthPx = Math.round(wrap.getBoundingClientRect().width || parseFloat(getComputedStyle(wrap).width));
    const gapPx = Math.round(parseFloat(getComputedStyle(wrap).columnGap || getComputedStyle(wrap).gap || '0'));
    const perEyeW = Math.round((widthPx - gapPx * (eyeBoxes.length - 1)) / eyeBoxes.length);

    let maxH = 0;
    eyeBoxes.forEach((el, i) => {
      const aspect = CONFIG.assets.eye[imgs[i].dataset.eye].heightAspect;
      const h = Math.round(perEyeW / aspect);
      el.style.flex = '0 0 ' + perEyeW + 'px';
      el.style.width = perEyeW + 'px';
      el.style.height = h + 'px';
      maxH = Math.max(maxH, h);
    });
    wrap.style.width = (perEyeW * eyeBoxes.length + gapPx * (eyeBoxes.length - 1)) + 'px';
    wrap.style.height = maxH + 'px';
  }

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
    return { left: Math.round(x), top: Math.round(y), width: Math.round(w), height: Math.round(h) };
  }

  function sizePupilCanvas() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = wrap.getBoundingClientRect();
    pupilsCanvas.width = Math.ceil(rect.width * dpr);
    pupilsCanvas.height = Math.ceil(rect.height * dpr);
    pupilsCanvas.style.width = rect.width + 'px';
    pupilsCanvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Each eye's own pupil-center fraction marks the true visual center
  // of that eye's own drawn shape (they differ between left and right).
  function pupilCenterOf(imgEl) {
    const painted = getContainedRect(imgEl);
    const frac = cfg_eye(imgEl).pupilCenterFrac;
    return {
      x: painted.left + painted.width * frac.x,
      y: painted.top + painted.height * frac.y
    };
  }

  function setFrame(openness01) {
    const isOpen = openness01 > 0.5;
    imgs.forEach((imgEl) => {
      imgEl.src = isOpen ? cfg_eye(imgEl).openEmpty : cfg_eye(imgEl).closed;
      imgEl.style.opacity = '1';
    });
  }

  function drawPupils() {
    const wrapBox = wrap.getBoundingClientRect();
    ctx.clearRect(0, 0, wrapBox.width, wrapBox.height);
    if (openness < 0.5) return;
    imgs.forEach((imgEl, i) => {
      const painted = getContainedRect(imgEl);
      const center = pupilCenterOf(imgEl);
      const cx = center.x - wrapBox.left, cy = center.y - wrapBox.top;
      const r = painted.width * cfg_eye(imgEl).pupilRadiusFrac;
      ctx.beginPath();
      ctx.arc(cx + pupilCur[i].x, cy + pupilCur[i].y, r, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.assets.eye.pupilColor;
      ctx.fill();
    });
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    if (animating) {
      const t = clamp((now - openAnimStart) / openAnimDur, 0, 1);
      openness = lerp(openAnimFrom, openAnimTo, t);
      setFrame(openness);
      if (t >= 1) animating = false;
    }
    // Same ease for every pupil, applied to the same shared target, so
    // they can never drift out of sync with each other.
    pupilCur.forEach((p, i) => {
      p.x += (pupilTarget[i].x - p.x) * cfg.pupilEase;
      p.y += (pupilTarget[i].y - p.y) * cfg.pupilEase;
    });
    drawPupils();
  }

  function startOpenAnim(to) {
    openAnimFrom = openness;
    openAnimTo = to;
    // Reverse from wherever we currently are, not from the extreme.
    const remaining = Math.abs(to - openness);
    openAnimDur = cfg.openDuration * remaining;
    openAnimStart = performance.now();
    animating = true;
  }

  // Single shared gaze model: compute ONE direction from the midpoint
  // between the two eyes to the cursor, scale it by distance up to the
  // max pupil radius, and apply that identical offset to every pupil —
  // like real eyes converging on a point far enough away that both
  // eyes' sightlines are effectively parallel. This is what keeps the
  // eyes from going cross-eyed when the cursor sits between/near them.
  function updatePupilTargets(clientX, clientY) {
    const wrapBox = wrap.getBoundingClientRect();
    const midX = wrapBox.left + wrapBox.width / 2;
    const midY = wrapBox.top + wrapBox.height / 2;
    const dx = clientX - midX, dy = clientY - midY;
    const dist = Math.hypot(dx, dy);
    const maxR = cfg.pupilMaxRadius;
    const offset = (dist <= maxR || dist === 0)
      ? { x: dx, y: dy }
      : { x: (dx / dist) * maxR, y: (dy / dist) * maxR };
    pupilTarget = imgs.map(() => offset);
  }

  if (REDUCED_MOTION) {
    imgs.forEach((imgEl) => { imgEl.src = cfg_eye(imgEl).openEmpty; });
    openness = 1;
    sizeEyeBoxes();
    sizePupilCanvas();
    drawPupils();
    return;
  }

  function onResize() { sizeEyeBoxes(); sizePupilCanvas(); }
  sizeEyeBoxes();
  sizePupilCanvas();
  window.addEventListener('resize', onResize);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(onResize);
  }

  if (!IS_TOUCH) {
    document.addEventListener('pointermove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const pad = cfg.hoverPadding;
      const within = e.clientX >= rect.left - pad && e.clientX <= rect.right + pad &&
                      e.clientY >= rect.top - pad && e.clientY <= rect.bottom + pad;
      if (within && !hovering) {
        hovering = true;
        startOpenAnim(1);
      } else if (!within && hovering) {
        hovering = false;
        startOpenAnim(0);
        pupilTarget = imgs.map(() => ({ x: 0, y: 0 }));
      }
      if (hovering) updatePupilTargets(e.clientX, e.clientY);
    }, { passive: true });
  } else {
    wrap.addEventListener('touchstart', () => {
      clearTimeout(touchTimer);
      hovering = true;
      pupilTarget = imgs.map(() => ({ x: 0, y: 0 }));
      startOpenAnim(1);
      touchTimer = setTimeout(() => {
        hovering = false;
        startOpenAnim(0);
      }, cfg.touchOpenHold);
    }, { passive: true });
  }

  rafId = requestAnimationFrame(frame);
})();
