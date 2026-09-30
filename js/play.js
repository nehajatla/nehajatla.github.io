/* ================================================================
   play.js — infinite pannable art-museum canvas. Ported forward
   from the previous site's playground.html, with the page's own
   nav/cursor/grain code removed (now shared — see nav.js, cursor.js,
   bg-grain-flow.js) and the cursor-position postMessage relay from
   embedded iframes dropped along with it, since the new shared
   cursor no longer exposes a single trackable element the way the
   old #cursor did (see REBUILD_NOTES.md).
   ================================================================ */
(function () {
  'use strict';

  /* ── ARTWORK — 15 fixed slots, unchanged from the previous site. ── */
  const ARTWORK_DATA = [
    { video: "assets/video/circle-animation.mp4", title: "Circle Animation", caption: "Work in progress. Prototyped in Figma", ratio: "portrait" },
    { imagePath: "assets/art/7-redhouse.jpg", title: "Lone Red Cottage", caption: "Picture I took in Iceland", ratio: "landscape" },
    { video: "assets/video/avatar-rhydhun-logo.mp4", title: "Avatar Logo Reveal for Rhydhun (Competitive Dance)", caption: "Hover to play! Created with Adobe After Effects + Blender", ratio: "video" },
    { video: "assets/video/storm-strings.mp4?v=2", title: "Storm Strings", caption: "Hover to play! Adapted from Liam Egan.", ratio: "landscape", sizeScale: 1.4 },
    { imagePath: "assets/art/10-holocaust.jpg", title: "Sifting Through Silence", caption: "Sand holds horrors endured; aged hands remember so it never repeats", ratio: "landscape" },
    { imagePath: "assets/art/1-watercolor-girl.jpg", title: "Watercolor Ink Portrait", caption: "2020", ratio: "portrait" },
    { imagePath: "assets/art/2-fish.jpg", title: "Acrylic Fish Leap", caption: "2020", ratio: "portrait" },
    { imagePath: "assets/art/3-oilpastel-girl.png", title: "Oil Pastel Portrait", caption: "2021", ratio: "portrait" },
    { imagePath: "assets/art/4-lily-pads.jpg", title: "Gouache Lilly pads", caption: "2022", ratio: "portrait" },
    { imagePath: "assets/art/5-purple-woman.jpg", title: "Purple Shawl", caption: "2020", ratio: "portrait" },
    { imagePath: "assets/art/6-BW-woman.jpg", title: "Pencil Sketch Black and White", caption: "2021", ratio: "portrait" },
    { imagePath: "assets/art/8-brúarfoss.jpg", title: "Brúarfoss", caption: "Taken on my Iphone 16", ratio: "portrait" },
    { imagePath: "assets/art/9-wat-arun.jpg", title: "Wat Arun", caption: "I <3 architecture", ratio: "portrait" }
  ];

  const CONFIG = {
    cellWidth: 640,
    cellHeight: 700,
    frameBaseSize: 300,
    jitterScale: 0.2,
    bufferCells: 1,
    captionHeight: 46,
    safeMargin: 26,
    clusterChance: 0.5,
    clusterBias: 0.55,
    skipChance: 0.22,
    friction: 0.945,
    minVelocity: 0.03,
    scrollSensitivity: 1,
    proximityRadius: 420,
    maxScale: 1.16,
    minScale: 0.95,
    smoothing: 0.08,
    maxShift: 70,
    shiftSmoothing: 0.06
  };

  function seededRandom(x, y, salt) {
    const s = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453;
    return s - Math.floor(s);
  }

  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  const embedVisibilityObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const win = entry.target.contentWindow;
          if (!win) return;
          win.postMessage({ type: entry.isIntersecting ? 'embed-resume' : 'embed-pause' }, '*');
        });
      }, { root: null, rootMargin: '0px', threshold: 0 })
    : null;

  let originX = 0, originY = 0;
  let velX = 0, velY = 0;
  let isDragging = false;
  let lastX = 0, lastY = 0;
  let lastMoveTime = 0;
  let inertiaActive = false;
  let lastWheelTime = -1000;

  let parallaxX = 0, parallaxY = 0;
  let targetParallaxX = 0, targetParallaxY = 0;

  let cursorScreenX = window.innerWidth / 2;
  let cursorScreenY = window.innerHeight / 2;

  const renderedCells = new Map();

  function getFrameDims(ratio, scaleVariance) {
    const base = CONFIG.frameBaseSize * (1 + scaleVariance);
    switch (ratio) {
      case 'portrait':  return { w: base * 0.86, h: base * 1.1467 };
      case 'landscape': return { w: base * 1.28, h: base * 0.84 };
      case 'video':     return { w: base * 1.6,  h: base * 0.9 };
      case 'square':
      default:          return { w: base, h: base };
    }
  }

  function createFrame(cellX, cellY) {
    const dataLen = ARTWORK_DATA.length;
    const hash = Math.abs((cellX * 928371 + cellY * 73291) % dataLen);
    const art = ARTWORK_DATA[hash];

    const rx = seededRandom(cellX, cellY, 1);
    const ry = seededRandom(cellX, cellY, 2);
    const rs = seededRandom(cellX, cellY, 3);
    const rc = seededRandom(cellX, cellY, 4);

    const scaleVariance = art.fixedFrame ? 0 : (rs - 0.5) * 2 * CONFIG.jitterScale;
    const budgetScale = art.fixedFrame ? 1 : CONFIG.maxScale;

    let { w: imgW, h: imgH } = getFrameDims(art.ratio, scaleVariance);
    if (art.sizeScale) { imgW *= art.sizeScale; imgH *= art.sizeScale; }
    const totalH = imgH + CONFIG.captionHeight;

    const scaledW = imgW * budgetScale;
    const scaledH = totalH * budgetScale;
    const maxJitterX = Math.max(0, (CONFIG.cellWidth  - scaledW - CONFIG.safeMargin) / 2);
    const maxJitterY = Math.max(0, (CONFIG.cellHeight - scaledH - CONFIG.safeMargin) / 2);

    let jitterFracX = (rx - 0.5) * 2;
    let jitterFracY = (ry - 0.5) * 2;

    if (rc < CONFIG.clusterChance) {
      const leanRoll = seededRandom(cellX, cellY, 5);
      const leanX = leanRoll < 0.5 ? -1 : 1;
      const leanY = seededRandom(cellX, cellY, 6) < 0.5 ? -1 : 1;
      jitterFracX = Math.max(-1, Math.min(1, jitterFracX + leanX * CONFIG.clusterBias));
      jitterFracY = Math.max(-1, Math.min(1, jitterFracY + leanY * CONFIG.clusterBias));
    }

    const jitterX = jitterFracX * maxJitterX;
    const jitterY = jitterFracY * maxJitterY;

    const baseX = cellX * CONFIG.cellWidth + jitterX;
    const baseY = cellY * CONFIG.cellHeight + jitterY;

    const el = document.createElement('div');
    el.className = 'frame';
    el.style.width = imgW + 'px';
    el.style.height = totalH + 'px';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'frame-img-wrap';
    imgWrap.style.height = imgH + 'px';

    let embedEl = null;

    if (art.video) {
      const video = document.createElement('video');
      video.className = 'frame-video';
      video.src = art.video;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.draggable = false;
      imgWrap.addEventListener('mouseenter', () => { video.play().catch(() => {}); });
      imgWrap.addEventListener('mouseleave', () => { video.pause(); });
      imgWrap.appendChild(video);
    } else if (art.embed) {
      const iframe = document.createElement('iframe');
      iframe.className = 'frame-embed';
      iframe.title = art.title;
      if (art.allowFullscreen) iframe.allowFullscreen = true;

      if (art.hoverToLoad) {
        imgWrap.addEventListener('mouseenter', () => { iframe.src = art.embed; });
        imgWrap.addEventListener('mouseleave', () => { iframe.src = 'about:blank'; });
      } else {
        iframe.src = art.embed;
        iframe.loading = 'lazy';
        if (embedVisibilityObserver) embedVisibilityObserver.observe(iframe);
      }

      imgWrap.appendChild(iframe);
      embedEl = iframe;
    } else {
      const img = document.createElement('img');
      img.className = 'frame-img';
      img.draggable = false;
      img.loading = 'lazy';
      img.alt = art.title;
      if (art.imagePath) {
        img.src = art.imagePath;
        img.onerror = () => { img.style.opacity = '0'; };
      }
      imgWrap.appendChild(img);
    }

    const caption = document.createElement('div');
    caption.className = 'frame-caption';
    caption.innerHTML =
      '<div class="frame-title">' + art.title + '</div>' +
      '<div class="frame-sub">' + art.caption + '</div>';

    el.appendChild(imgWrap);
    el.appendChild(caption);

    const frame = { el, cx: baseX, cy: baseY, w: imgW, h: totalH, scale: CONFIG.minScale, isNear: false, embedEl, fixedFrame: !!art.fixedFrame };
    writeFrameTransform(frame);
    return frame;
  }

  function writeFrameTransform(frame) {
    const tx = frame.cx - frame.w / 2;
    const ty = frame.cy - frame.h / 2;
    frame.el.style.transform =
      'translate3d(' + tx.toFixed(1) + 'px, ' + ty.toFixed(1) + 'px, 0) scale(' + frame.scale.toFixed(4) + ')';
  }

  function renderVisibleCells() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const totalX = originX + parallaxX;
    const totalY = originY + parallaxY;

    const left   = -totalX;
    const top    = -totalY;
    const right  = left + vw;
    const bottom = top + vh;

    const minCellX = Math.floor(left   / CONFIG.cellWidth)  - CONFIG.bufferCells;
    const maxCellX = Math.ceil (right  / CONFIG.cellWidth)  + CONFIG.bufferCells;
    const minCellY = Math.floor(top    / CONFIG.cellHeight) - CONFIG.bufferCells;
    const maxCellY = Math.ceil (bottom / CONFIG.cellHeight) + CONFIG.bufferCells;

    const neededKeys = new Set();

    for (let cy = minCellY; cy <= maxCellY; cy++) {
      for (let cx = minCellX; cx <= maxCellX; cx++) {
        const key = cx + ',' + cy;
        const skipRoll = seededRandom(cx, cy, 9);
        if (skipRoll < CONFIG.skipChance) continue;

        neededKeys.add(key);
        if (!renderedCells.has(key)) {
          const frame = createFrame(cx, cy);
          canvas.appendChild(frame.el);
          renderedCells.set(key, frame);
        }
      }
    }

    for (const [key, frame] of renderedCells) {
      if (!neededKeys.has(key)) {
        if (frame.embedEl && embedVisibilityObserver) embedVisibilityObserver.unobserve(frame.embedEl);
        frame.el.remove();
        renderedCells.delete(key);
      }
    }
  }

  function applyCanvasTransform() {
    const totalX = originX + parallaxX;
    const totalY = originY + parallaxY;
    canvas.style.transform = 'translate3d(' + totalX.toFixed(1) + 'px, ' + totalY.toFixed(1) + 'px, 0)';
  }

  function updateParallaxTarget() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const nx = (cursorScreenX / vw) * 2 - 1;
    const ny = (cursorScreenY / vh) * 2 - 1;
    targetParallaxX = nx * CONFIG.maxShift;
    targetParallaxY = ny * CONFIG.maxShift;
  }

  function easeParallax() {
    parallaxX += (targetParallaxX - parallaxX) * CONFIG.shiftSmoothing;
    parallaxY += (targetParallaxY - parallaxY) * CONFIG.shiftSmoothing;
  }

  function updateProximityScaling() {
    const totalX = originX + parallaxX;
    const totalY = originY + parallaxY;

    for (const frame of renderedCells.values()) {
      if (frame.fixedFrame) {
        frame.scale = 1;
        writeFrameTransform(frame);
        continue;
      }

      const screenX = frame.cx + totalX;
      const screenY = frame.cy + totalY;

      const dx = screenX - cursorScreenX;
      const dy = screenY - cursorScreenY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const t = Math.min(dist / CONFIG.proximityRadius, 1);
      const targetScale = CONFIG.maxScale + (CONFIG.minScale - CONFIG.maxScale) * t;

      frame.scale += (targetScale - frame.scale) * CONFIG.smoothing;

      const shouldBeNear = t < 0.85;
      if (shouldBeNear !== frame.isNear) {
        frame.isNear = shouldBeNear;
        frame.el.classList.toggle('near-cursor', shouldBeNear);
      }

      writeFrameTransform(frame);
    }
  }

  window.addEventListener('message', (e) => {
    if (!e.data || e.data.type !== 'embed-pointer') return;
    for (const frame of renderedCells.values()) {
      if (frame.embedEl && frame.embedEl.contentWindow === e.source) {
        const rect = frame.embedEl.getBoundingClientRect();
        cursorScreenX = rect.left + e.data.x;
        cursorScreenY = rect.top + e.data.y;
        updateParallaxTarget();
        break;
      }
    }
  });

  function mainLoop() {
    easeParallax();

    if (inertiaActive) {
      originX += velX;
      originY += velY;
      velX *= CONFIG.friction;
      velY *= CONFIG.friction;
      if (Math.abs(velX) < CONFIG.minVelocity && Math.abs(velY) < CONFIG.minVelocity) {
        inertiaActive = false;
      }
    }

    applyCanvasTransform();

    if (!isDragging && performance.now() - lastWheelTime > 150) {
      updateProximityScaling();
    }

    renderVisibleCells();
    requestAnimationFrame(mainLoop);
  }

  function onPointerDown(e) {
    isDragging = true;
    inertiaActive = false;
    lastX = e.clientX;
    lastY = e.clientY;
    lastMoveTime = performance.now();
    velX = 0; velY = 0;
  }

  function onPointerMove(e) {
    cursorScreenX = e.clientX;
    cursorScreenY = e.clientY;
    updateParallaxTarget();

    if (!isDragging) return;

    const now = performance.now();
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dt = Math.max(now - lastMoveTime, 1);

    originX += dx;
    originY += dy;

    velX = (dx / dt) * 16;
    velY = (dy / dt) * 16;

    lastX = e.clientX;
    lastY = e.clientY;
    lastMoveTime = now;
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    if (Math.abs(velX) > CONFIG.minVelocity || Math.abs(velY) > CONFIG.minVelocity) {
      inertiaActive = true;
    }
  }

  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  window.addEventListener('pointercancel', onPointerUp, { passive: true });
  window.addEventListener('pointerleave', onPointerUp, { passive: true });
  window.addEventListener('dragstart', (e) => e.preventDefault());

  function onWheel(e) {
    e.preventDefault();
    inertiaActive = false;
    velX = 0; velY = 0;
    lastWheelTime = performance.now();
    originX -= e.deltaX * CONFIG.scrollSensitivity;
    originY -= e.deltaY * CONFIG.scrollSensitivity;
  }
  window.addEventListener('wheel', onWheel, { passive: false });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(renderVisibleCells, 120);
  }, { passive: true });

  function init() {
    originX = -CONFIG.cellWidth * 1.2;
    originY = -CONFIG.cellHeight * 1.2;
    renderVisibleCells();
    mainLoop();
  }

  init();
})();
