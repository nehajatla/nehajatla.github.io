/* ================================================================
   eyes.js — single-eye pupil-tracking module. Closed at rest; opens
   on hover-zone enter (wrap box + hoverPadding); pupil tracks the
   cursor (see updatePupilTargets), clamped to stay inside the drawn
   outline (see marginsFor); eases back to center + closes on leave;
   reverses from the current frame if interrupted mid-animation.
   Tap-to-open + auto-close on touch.

   Written generically over an array of eyes (imgs/eyeBoxes) rather
   than assuming exactly one — a second eye can be added back by
   adding a second .eye span in index.html and a matching key under
   CONFIG.assets.eye without touching this file.
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

  // Box height is derived from the wrap's own width via heightAspect
  // (the smaller of this eye's closed/open aspect ratios — see
  // config.js) so object-fit:contain is always width-constrained in
  // BOTH states, and the drawn eye never gets letterboxed shorter than
  // its full width in either one.
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

  // pupil-center fraction marks the true visual center of the eye's
  // own drawn shape (not necessarily the box's geometric center).
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

  // Safe pupil travel room, in px, before its drawn edge would cross
  // the eye outline — derived from the painted rect (open-state art)
  // and pupil geometry, not a fixed guess. This eye is short and wide,
  // so its vertical room is only a few px even though its horizontal
  // room is generous.
  function marginsFor(imgEl) {
    const painted = getContainedRect(imgEl);
    const center = pupilCenterOf(imgEl);
    const eyeCfg = cfg_eye(imgEl);
    const r = painted.width * eyeCfg.pupilRadiusFrac;
    const pad = 1.5;
    // Clamp to the POD OUTLINE's own bounds, not the full painted rect
    // — the crop includes lash strokes above/beside the pod, so the
    // image's own edges sit well outside the pod in several directions
    // and clamping to them would let the pupil visually cross the
    // drawn outline before reaching the image edge.
    const pb = eyeCfg.podBoundsFrac;
    const podLeft = painted.left + painted.width * pb.left;
    const podRight = painted.left + painted.width * pb.right;
    const podTop = painted.top + painted.height * pb.top;
    const podBottom = painted.top + painted.height * pb.bottom;
    const marginX = Math.max(0, Math.min(center.x - podLeft, podRight - center.x) - r - pad);
    const marginY = Math.max(0, Math.min(center.y - podTop, podBottom - center.y) - r - pad);
    return { marginX, marginY };
  }

  // Gaze DIRECTION from the eye's own center to the cursor, scaled by
  // distance up to a generous cap, then clamped to this eye's own safe
  // margins (above) so the pupil tracks the cursor without ever
  // visually crossing the drawn outline.
  function updatePupilTargets(clientX, clientY) {
    const wrapBox = wrap.getBoundingClientRect();
    const midX = wrapBox.left + wrapBox.width / 2;
    const midY = wrapBox.top + wrapBox.height / 2;
    const dx = clientX - midX, dy = clientY - midY;
    const dist = Math.hypot(dx, dy);
    const maxR = cfg.pupilMaxRadius;
    const travel = Math.min(dist, maxR);
    const dirX = dist === 0 ? 0 : dx / dist;
    const dirY = dist === 0 ? 0 : dy / dist;
    const rawX = dirX * travel, rawY = dirY * travel;
    pupilTarget = imgs.map((imgEl) => {
      const { marginX, marginY } = marginsFor(imgEl);
      return { x: clamp(rawX, -marginX, marginX), y: clamp(rawY, -marginY, marginY) };
    });
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
