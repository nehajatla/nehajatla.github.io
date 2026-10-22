/* ================================================================
   play.js — play.html museum room (from play-museum.html).

   1. WORKS — the two videos hang on the back wall, the paintings
      are scattered across the left wall and the photographs across
      the right ("SCATTER" below), each sized to its own proportions
      so nothing is cropped.
   2. Camera — the cursor (or a finger drag) turns the view; scrolling
      steps closer. Eased every frame; gentler under reduced motion.
   3. Hover effect — the same as the sliding gallery: a grainy aura
      blooms behind the hovered piece and loose grains drift out from
      it in the homepage palette. Off under reduced motion.
   ================================================================ */
(function () {
  'use strict';
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. WORKS. ratio = width / height. ─────────────────────────── */
  const VIDEOS = [
    { video: 'assets/video/avatar-rhydhun-logo.mp4', poster: 'assets/video/avatar-rhydhun-logo-poster.jpg',
      title: 'Avatar Logo Reveal for Rhydhun', meta: 'Motion · After Effects + Blender',
      box: { left: 6, top: 9, width: 25 * 16 / 9, height: 25, z: 0 } },       // sized to the video's 16:9
    { video: 'assets/video/storm-strings.mp4?v=2', poster: 'assets/video/storm-strings-poster.jpg',
      title: 'Storm Strings', meta: 'Interactive · WebGL',
      box: { left: 94 - 24 * 1.6, top: 30, width: 24 * 1.6, height: 24, z: 30 } }  // 1.6:1, staggered lower right
  ];
  const ART = {
    sifting:    { src: 'assets/art/10-holocaust.jpg', ratio: 1.334, title: 'Sifting Through Silence', meta: 'Painting' },
    watercolor: { src: 'assets/art/1-watercolor-girl.jpg', ratio: 0.75, title: 'Watercolor Ink Portrait', meta: '2020 · Watercolor and ink' },
    fish:       { src: 'assets/art/2-fish.jpg', ratio: 0.811, title: 'Acrylic Fish Leap', meta: '2020 · Acrylic' },
    oilpastel:  { src: 'assets/art/3-oilpastel-girl.png', ratio: 0.868, title: 'Oil Pastel Portrait', meta: '2021 · Oil pastel' },
    lily:       { src: 'assets/art/4-lily-pads.jpg', ratio: 0.686, title: 'Gouache Lily Pads', meta: '2022 · Gouache' },
    purple:     { src: 'assets/art/5-purple-woman.jpg', ratio: 0.685, title: 'Purple Shawl', meta: '2020 · Painting' },
    pencil:     { src: 'assets/art/6-BW-woman.jpg', ratio: 0.734, title: 'Pencil Sketch, Black and White', meta: '2021 · Pencil' },
    cottage:    { src: 'assets/art/7-redhouse.jpg', ratio: 1.499, title: 'Lone Red Cottage', meta: 'Photography · Iceland' },
    bruarfoss:  { src: 'assets/art/8-brúarfoss.jpg', ratio: 0.75, title: 'Brúarfoss', meta: 'Photography · Iceland' },
    watarun:    { src: 'assets/art/9-wat-arun.jpg', ratio: 0.75, title: 'Wat Arun', meta: 'Photography · Bangkok' }
  };
  // Where each piece hangs (wall em units): x, y = top-left corner,
  // h = height (width follows the piece's own ratio, so nothing is
  // cropped). Loosely scattered, not in rows; z lifts some pieces off
  // the wall a little for depth. The left wall's x runs toward the back
  // corner, the right wall's x runs away from it.
  const SCATTER = [
    { wall: 'wall-left', id: 'lily',       x: 6, y: 9, h: 13, z: 40 },
    { wall: 'wall-left', id: 'sifting',    x: 18, y: 6, h: 10, z: 20 },
    { wall: 'wall-left', id: 'purple',     x: 35, y: 10, h: 12, z: 30 },
    { wall: 'wall-left', id: 'watercolor', x: 10, y: 29, h: 12, z: 50 },
    { wall: 'wall-left', id: 'oilpastel',  x: 39, y: 28, h: 11, z: 25 },
    { wall: 'wall-left', id: 'fish',       x: 45, y: 5, h: 11.5, z: 35 },
    { wall: 'wall-left', id: 'pencil',     x: 25, y: 25, h: 11, z: 45 },
    { wall: 'wall-right', id: 'cottage',   x: 2, y: 9, h: 13, z: 30 },
    { wall: 'wall-right', id: 'bruarfoss', x: 26, y: 5, h: 16, z: 50 },
    { wall: 'wall-right', id: 'watarun',   x: 12, y: 28, h: 14.5, z: 40 }
  ];
  const MAT = 0;    // no frame: pieces show edge to edge

  function placard(w) {
    const p = document.createElement('figcaption');
    p.className = 'placard';
    p.innerHTML = '<b></b><span></span>';
    p.querySelector('b').textContent = w.title;
    p.querySelector('span').textContent = w.meta;
    return p;
  }
  function makePiece(w, box, isVideo) {
    const el = document.createElement('figure');
    el.className = 'piece' + (isVideo ? ' piece--video' : '');
    el.style.left = box.left + 'em';
    el.style.top = box.top + 'em';
    el.style.width = box.width + 'em';
    el.style.height = box.height + 'em';
    el.style.setProperty('--z', (box.z || 0) + 'px');
    el.style.setProperty('--mat', MAT + 'em');
    const frame = document.createElement('div');
    frame.className = 'frame';
    let media;
    if (isVideo) {
      media = document.createElement('video');
      media.muted = true; media.loop = true; media.playsInline = true;
      media.poster = w.poster;
      media.setAttribute('aria-label', w.title);
      if (REDUCED_MOTION) { media.preload = 'metadata'; media.controls = true; }
      else { media.autoplay = true; media.preload = 'auto'; }
      media.src = w.video;
    } else {
      media = document.createElement('img');
      media.src = w.src;
      media.alt = w.title;
      media.decoding = 'async';
      media.draggable = false;
    }
    frame.appendChild(media);
    el.append(frame, placard(w));
    return el;
  }

  VIDEOS.forEach((v) => document.getElementById('wall-back').appendChild(makePiece(v, v.box, true)));
  SCATTER.forEach((at) => {
    const w = ART[at.id];
    document.getElementById(at.wall).appendChild(
      makePiece(w, { left: at.x, top: at.y, width: at.h * w.ratio, height: at.h, z: at.z }, false));
  });

  /* ── 2. Camera ─────────────────────────────────────────────────── */
  const scene = document.getElementById('scene');
  const room = document.getElementById('room');
  const hint = document.querySelector('.museum-hint');
  if (hint && window.matchMedia('(hover: none), (pointer: coarse)').matches) hint.textContent = 'Drag to look around';
  let zMax = 400;
  function size() {
    const vw = innerWidth, vh = innerHeight;
    const W = Math.max(vw * 1.4, vh * 1.25, 760); // vh term keeps it big on tall phones
    const H = W * 0.56;
    const D = W * 0.55;
    const P = Math.max(vw, vh * 1.4) * 0.9;
    scene.style.setProperty('--W', W + 'px');
    scene.style.setProperty('--H', H + 'px');
    scene.style.setProperty('--D', D + 'px');
    scene.style.setProperty('--P', P + 'px');
    zMax = D * 0.5;
  }
  size();
  window.addEventListener('resize', size);

  let tx = 0, ty = 0, cx = 0, cy = 0, tz = 0, cz = 0;
  let hintTimer = null;
  function interacted() {
    if (!hint || hintTimer) return;
    hintTimer = setTimeout(() => hint.classList.add('is-hidden'), 2500);
  }
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
    interacted();
  }, { passive: true });
  window.addEventListener('wheel', (e) => {
    tz = Math.min(zMax, Math.max(0, tz - e.deltaY * 0.6));
    interacted();
  }, { passive: true });

  const TURN = REDUCED_MOTION ? 8 : 55; // left/right, degrees: at the screen edge a side wall swings fully into view
  const TILT = REDUCED_MOTION ? 2 : 7;  // up/down, degrees

  /* ── 3. Hover effect (same as the sliding gallery) ──────────────
     A grainy aura (the homepage's grain-flow shader as a soft circle)
     blooms behind the hovered piece, and loose single grains drift out
     from its edges on a slow current, in the lotus palette. */
  const museum = document.querySelector('.museum');
  const SPEW = { grainsPerSecond: 380, speed: [30, 230], drag: 0.9, flow: 38, flowScale: 0.004,
                 lift: 4, life: [3, 7], dotSize: 1.5, twinkle: 0.18, maxGrains: 6000 };
  const AURA = { size: 1.25, fadeIn: 0.4, fadeOut: 0.9 };
  const COLORS = ['#F7D35A', '#D395E1', '#4B8AFF', '#B9A3FF']; // yellow, pink, blue, lavender

  const canvas = document.getElementById('grain');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  function resizeGrain() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = museum.clientWidth; H = museum.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeGrain();
  window.addEventListener('resize', resizeGrain);

  const perm = new Uint8Array(512);
  { const p = [...Array(256).keys()].sort(() => Math.random() - 0.5); for (let i = 0; i < 512; i++) perm[i] = p[i & 255]; }
  const fade = (t) => t * t * (3 - 2 * t);
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const h = (a, b) => perm[(perm[a & 255] + b) & 255] / 255;
    const u = fade(xf), v = fade(yf);
    const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function colorAt(x, y, t) {
    let best = 0, bestV = -1;
    for (let k = 0; k < 3; k++) {
      const v = vnoise(x * 0.006 + k * 13.1 + t * 0.15, y * 0.006 - k * 7.7);
      if (v > bestV) { bestV = v; best = k; }
    }
    return Math.random() < 0.12 ? 3 : best;
  }

  const grains = [];
  let hovered = null, emitAcc = 0, clock = 0;
  let auraRect = null, auraAmt = 0, auraTime = 0;
  const rand = (a, b) => a + Math.random() * (b - a);

  function spawn(r) {
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const ang = Math.random() * Math.PI * 2;
    const ex = Math.cos(ang), ey = Math.sin(ang);
    const t = Math.min((r.w / 2) / Math.abs(ex || 1e-6), (r.h / 2) / Math.abs(ey || 1e-6));
    const x = cx + ex * t + rand(-4, 4), y = cy + ey * t + rand(-4, 4);
    const sp = SPEW.speed[0] + Math.pow(Math.random(), 1.8) * (SPEW.speed[1] - SPEW.speed[0]);
    const spread = ang + rand(-0.8, 0.8);
    if (grains.length >= SPEW.maxGrains) grains.shift();
    grains.push({ x, y, vx: Math.cos(spread) * sp, vy: Math.sin(spread) * sp, age: 0,
      life: rand(SPEW.life[0], SPEW.life[1]), s: Math.random() < 0.8 ? SPEW.dotSize : SPEW.dotSize * 1.6,
      c: colorAt(x, y, clock), a: rand(0.55, 1) });
  }

  if (!REDUCED_MOTION) {
    document.addEventListener('pointerover', (e) => {
      const p = e.target.closest && e.target.closest('.piece');
      if (p) hovered = p;
    });
    document.addEventListener('pointerout', (e) => {
      const p = e.target.closest && e.target.closest('.piece');
      if (p && !(e.relatedTarget && p.contains(e.relatedTarget))) hovered = null;
    });
  }

  function stepFx(dt) {
    clock += dt;
    if (hovered) {
      const sr = museum.getBoundingClientRect();
      const cr = hovered.querySelector('.frame').getBoundingClientRect();
      auraRect = { x: cr.left - sr.left, y: cr.top - sr.top, w: cr.width, h: cr.height };
      emitAcc += SPEW.grainsPerSecond * dt;
      while (emitAcc >= 1) { spawn(auraRect); emitAcc--; }
    } else emitAcc = 0;

    const k = Math.exp(-SPEW.drag * dt);
    for (let i = grains.length - 1; i >= 0; i--) {
      const g = grains[i];
      g.age += dt;
      if (g.age >= g.life) { grains.splice(i, 1); continue; }
      const n = vnoise(g.x * SPEW.flowScale, g.y * SPEW.flowScale + clock * 0.12);
      const fa = n * Math.PI * 4;
      g.vx = g.vx * k + Math.cos(fa) * SPEW.flow * dt;
      g.vy = g.vy * k + Math.sin(fa) * SPEW.flow * dt - SPEW.lift * dt;
      g.x += g.vx * dt; g.y += g.vy * dt;
    }
    ctx.clearRect(0, 0, W, H);
    for (let c = 0; c < COLORS.length; c++) {
      ctx.fillStyle = COLORS[c];
      for (const g of grains) {
        if (g.c !== c) continue;
        const t = g.age / g.life;
        const life = Math.min(1, g.age * 4) * (1 - t * t);
        const tw = Math.random() < SPEW.twinkle ? 0.15 : 1;
        ctx.globalAlpha = g.a * life * tw;
        ctx.fillRect(g.x, g.y, g.s, g.s);
      }
    }
    ctx.globalAlpha = 1;
    drawAura(dt);
  }

  // Aura: the grain-flow shader as a soft grainy circle (plain WebGL).
  const auraCanvas = document.getElementById('aura');
  const gl = auraCanvas.getContext('webgl', { premultipliedAlpha: false, antialias: false });
  let uTime, uRes, uCenter, uRadius, uAmount;
  if (gl) {
    const vs = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';
    const fs = `
    precision highp float;
    uniform float uTime, uRadius, uAmount;
    uniform vec2 uRes, uCenter;
    float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
    float fbm(vec2 p){ float v = 0.0, a = 0.5; mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
      for (int i = 0; i < 4; i++){ v += a*noise(p); p = r*p*2.02; a *= 0.5; } return v; }
    void main(){
      vec2 fc = gl_FragCoord.xy;
      vec2 p = fc / uRes.y;
      vec2 c = uCenter / uRes.y;
      float t = uTime * 0.16;
      c += 0.012 * vec2(sin(t * 1.3), cos(t * 1.1));
      float radius = uRadius * (1.0 + 0.05 * sin(t * 1.7));
      radius *= mix(0.55, 1.0, uAmount);
      float d = length(p - c) / radius;
      d += (fbm(p * 2.0 / radius * 0.62 + t) - 0.5) * 0.12;
      float density = (1.0 - smoothstep(0.15, 1.0, d)) * uAmount;
      float frame = floor(uTime * 30.0);
      float dots = step(hash(fc + vec2(frame * 37.0, frame * 17.0)), density * 0.9) * step(0.002, density);
      float amt = mix(density * 0.3, dots, 0.8);
      vec3 cYellow = vec3(1.000, 0.914, 0.608);
      vec3 cPink   = vec3(0.827, 0.584, 0.882);
      vec3 cBlue   = vec3(0.294, 0.541, 1.000);
      vec2 rp = (p - c) * (0.62 / radius);
      vec2 w = vec2(fbm(rp * 1.2 + vec2(t * 0.9, 0.0)), fbm(rp * 1.2 + vec2(4.7, -t * 0.8)));
      vec2 fp = rp * 1.6 + (w - 0.5) * 1.1;
      float fY = fbm(fp + vec2( 1.7,  9.2) + vec2( t * 0.7,  t * 0.2));
      float fP = fbm(fp + vec2( 8.3,  2.8) + vec2(-t * 0.5,  t * 0.6));
      float fB = fbm(fp + vec2(-4.1,  6.5) + vec2( t * 0.3, -t * 0.7));
      float fW = fbm(fp + vec2( 5.9, -3.3) + vec2(-t * 0.6, -t * 0.3));
      float m = max(max(fY, fP), max(fB, fW)) + 1e-4;
      float wY = pow(fY / m, 7.0) * 1.4;
      float wP = pow(fP / m, 7.0) * 1.5;
      float wB = pow(fB / m, 7.0) * 0.6;
      float wW = pow(fW / m, 7.0) * 0.9;
      vec3 tint = (cYellow * wY + cPink * wP + cBlue * wB + vec3(1.0) * wW) / (wY + wP + wB + wW);
      tint = mix(tint, vec3(1.0), 0.25);
      gl_FragColor = vec4(tint, clamp(amt * 0.9, 0.0, 1.0));
    }`;
    const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); return x; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    [uTime, uRes, uCenter, uRadius, uAmount] = ['uTime', 'uRes', 'uCenter', 'uRadius', 'uAmount'].map((n) => gl.getUniformLocation(prog, n));
  }
  let ADPR = 1, auraVisible = false;
  function resizeAura() {
    ADPR = Math.min(devicePixelRatio || 1, 2);
    auraCanvas.width = Math.round(museum.clientWidth * ADPR);
    auraCanvas.height = Math.round(museum.clientHeight * ADPR);
    if (gl) gl.viewport(0, 0, auraCanvas.width, auraCanvas.height);
  }
  resizeAura();
  window.addEventListener('resize', resizeAura);

  function drawAura(dt) {
    if (!gl || !auraRect) return;
    const on = !!hovered;
    auraAmt += Math.sign((on ? 1 : 0) - auraAmt) * Math.min(Math.abs((on ? 1 : 0) - auraAmt), dt / (on ? AURA.fadeIn : AURA.fadeOut));
    if (auraAmt <= 0.001) {
      if (auraVisible) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); auraVisible = false; }
      return;
    }
    auraVisible = true;
    auraTime += dt;
    const eased = auraAmt * auraAmt * (3 - 2 * auraAmt);
    const AH = auraCanvas.height;
    gl.uniform1f(uTime, auraTime);
    gl.uniform2f(uRes, auraCanvas.width, AH);
    gl.uniform2f(uCenter, (auraRect.x + auraRect.w / 2) * ADPR, AH - (auraRect.y + auraRect.h / 2) * ADPR);
    gl.uniform1f(uRadius, (Math.hypot(auraRect.w, auraRect.h) / 2 * ADPR * AURA.size) / AH);
    gl.uniform1f(uAmount, eased);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /* ── frame loop ─────────────────────────────────────────────────── */
  let last = performance.now();
  (function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const f = 1 - Math.pow(1 - 0.12, dt * 60);
    const fz = 1 - Math.pow(1 - 0.15, dt * 60);
    cx += (tx - cx) * f; cy += (ty - cy) * f; cz += (tz - cz) * fz;
    room.style.transform = `translateZ(${cz.toFixed(2)}px) rotateX(${(cy * TILT).toFixed(3)}deg) rotateY(${(cx * TURN).toFixed(3)}deg)`;
    if (!REDUCED_MOTION) stepFx(dt);
    requestAnimationFrame(tick);
  })(last);
})();
