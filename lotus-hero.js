// Lotus ASCII hero — ported from the user's standalone reference file,
// then extended with: (1) interactive ASCII orbs that scatter/brighten
// near the periwinkle cursor, (2) per-character reactivity on the main
// photo-sampled flower (cells push away from and brighten near the
// cursor, not just the whole-group perspective tilt), and (3) a dithered
// ASCII gradient bridging the hero's near-black background into the
// cream Work section below instead of a hard color cut.

(function () {
  const IMAGE_SRC = 'assets/flower.jpg';
  const CONTAINER_SIZE = 240; // must match #flower-stage's rendered px size

  const PALETTE = ' .:-=+*#%@';
  const IMG_PALETTE = ' .,:;+=xX8S#@';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
  function hash(x, y) { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); }
  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function lerpColor(hexA, hexB, t) {
    const a = hexToRgb(hexA), b = hexToRgb(hexB);
    return `rgb(${Math.round(a.r + (b.r - a.r) * t)},${Math.round(a.g + (b.g - a.g) * t)},${Math.round(a.b + (b.b - a.b) * t)})`;
  }
  // Cycles smoothly through the aurora palette (teal -> periwinkle ->
  // orchid -> sky-blue -> back to teal) as t increases — used for both
  // the orbs and the "neha" glow, so the whole page's shifting color
  // language stays visually unified.
  const AURORA = ['#3FB8A8', '#8F94FB', '#D484DB', '#F5792C', '#5AB4E0'];
  function auroraColor(t) {
    t = t - Math.floor(t);
    const seg = t * AURORA.length;
    const i = Math.floor(seg) % AURORA.length;
    const j = (i + 1) % AURORA.length;
    return lerpColor(AURORA[i], AURORA[j], seg - Math.floor(seg));
  }

  function computeFlowerField(cols, rows, bloom, scrollT, mouseNx, mouseNy, mouseStrength, breathe, amp, outerK, innerK, rot) {
    const grid = [];
    const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
    rot = rot || 0;
    for (let row = 0; row < rows; row++) {
      let line = '';
      for (let col = 0; col < cols; col++) {
        const nx = (col - cx) / (cols / 2);
        const ny = (row - cy) / (rows / 2);
        const R = Math.sqrt(nx * nx + ny * ny);
        const theta = Math.atan2(ny, nx) - rot;
        const breatheScale = 1 + breathe * 0.02 * amp;
        const podRadius = 0.15 * bloom;
        const outerTheta = theta - scrollT * 0.9;
        const outerCos = Math.abs(Math.cos(outerK * outerTheta));
        const outerShape = Math.pow(outerCos, 1.7);
        let outerPetal = (podRadius * 1.1 + 0.7 * outerShape) * bloom * breatheScale;
        if (outerCos < 0.2) outerPetal = Math.min(outerPetal, podRadius * 1.15);
        const innerTheta = theta - Math.PI / innerK + scrollT * 0.5;
        const innerCos = Math.abs(Math.cos(innerK * 0.5 * innerTheta));
        const innerShape = Math.pow(innerCos, 1.7);
        let innerPetal = (podRadius * 0.95 + 0.42 * innerShape) * bloom * breatheScale;
        if (innerCos < 0.18) innerPetal = Math.min(innerPetal, podRadius * 1.02);
        const dxm = nx - mouseNx, dym = ny - mouseNy;
        const distM = Math.sqrt(dxm * dxm + dym * dym);
        const bump = mouseStrength * amp * 0.22 * Math.exp(-distM * distM / 0.12);
        outerPetal += bump; innerPetal += bump * 0.7;
        let val = 0;
        if (R < podRadius) { val = hash(col, row) < 0.35 ? 0.55 : 0.95; }
        else if (R < innerPetal) { val = 0.55 + 0.25 * (1 - (R - podRadius) / Math.max(0.001, innerPetal - podRadius)); }
        else if (R < outerPetal) { val = 0.3 + 0.4 * (1 - (R - innerPetal) / Math.max(0.001, outerPetal - innerPetal)); }
        else { const d = R - outerPetal; val = Math.max(0, 0.42 - d * 3.2); }
        val = clamp(val, 0, 1);
        const idx = val <= 0 ? 0 : Math.max(1, Math.round(val * (PALETTE.length - 1)));
        line += PALETTE[idx];
      }
      grid.push(line);
    }
    return grid.join('\n');
  }

  function buildLattice(cols, rows) {
    const lines = [];
    for (let row = 0; row < rows; row++) {
      let line = '';
      for (let col = 0; col < cols; col++) line += hash(col * 3.1, row * 7.7) < 0.05 ? '.' : ' ';
      lines.push(line);
    }
    return lines.join('\n');
  }

  function buildImageCells(data, iw, ih, cols, rows) {
    const cells = [];
    const cellW = CONTAINER_SIZE / cols, cellH = CONTAINER_SIZE / rows;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const sx = Math.floor((col + 0.5) / cols * iw);
        const sy = Math.floor((row + 0.5) / rows * ih);
        let rs = 0, gs = 0, bs = 0, n = 0;
        for (let ddy = -1; ddy <= 1; ddy++) {
          for (let ddx = -1; ddx <= 1; ddx++) {
            const px = clamp(sx + ddx, 0, iw - 1), py = clamp(sy + ddy, 0, ih - 1);
            const idx = (py * iw + px) * 4;
            rs += data[idx]; gs += data[idx + 1]; bs += data[idx + 2]; n++;
          }
        }
        const r = rs / n, g = gs / n, b = bs / n;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum < 20) continue;
        const h1 = hash(col * 3.7, row * 5.3);
        const h2 = hash(col * 9.1 + 1, row * 2.3 + 1);
        const pIdx = clamp(Math.round((lum / 255) * (IMG_PALETTE.length - 1)), 1, IMG_PALETTE.length - 1);
        const size = 6.5 + (lum / 255) * 6 + (h1 - 0.5) * 1.6;
        const left = (col + (h1 - 0.5) * 0.55) * cellW;
        const top = (row + (h2 - 0.5) * 0.55) * cellH;
        const rr = Math.min(255, r * 1.15), gg = Math.min(255, g * 1.15), bb = Math.min(255, b * 1.15);
        cells.push({
          left: Math.round(left), top: Math.round(top), size: +size.toFixed(1),
          color: `rgb(${Math.round(rr)},${Math.round(gg)},${Math.round(bb)})`,
          ch: IMG_PALETTE[pIdx]
        });
      }
    }
    return cells;
  }

  // ---- DOM refs ----
  const latticeEl = document.getElementById('lattice-bg');
  const satAEl = document.getElementById('sat-a');
  const satBEl = document.getElementById('sat-b');
  const cellsEl = document.getElementById('flower-cells');
  const flowerStageEl = document.getElementById('flower-stage');
  const cursorEl = document.getElementById('cursor');
  if (!latticeEl || !cellsEl) return;

  latticeEl.textContent = buildLattice(110, 46);

  // ---- "neha" — split into per-letter spans, each independently glowing
  // through the aurora color cycle. On hover, each letter's solid glyph
  // is replaced by a cluster of tiny characters sampled from that
  // letter's own shape (canvas getImageData, same technique as the photo
  // sampling above) — the letter "disintegrates" into the ASCII bits
  // that make it up, then reassembles on mouse-leave.
  const DISINTEGRATE_CHARS = ['.', ':', '+', 'x', '*', '#'];
  const nehaEl = document.querySelector('#hero h1 em');
  let nehaLetters = [];
  let nehaHovered = false;
  let nehaHoverT = 0;

  if (nehaEl) {
    const original = nehaEl.textContent;
    nehaEl.textContent = '';
    nehaLetters = original.split('').map((ch, i) => {
      // A wrapper per letter holding two SIBLINGS — the solid glyph and
      // its particle cluster — so fading one's opacity can never drag
      // the other down with it (which is what happened when the
      // particles were nested inside the fading span itself).
      const wrapper = document.createElement('span');
      wrapper.style.display = 'inline-block';
      wrapper.style.position = 'relative';

      const span = document.createElement('span');
      span.textContent = ch;
      span.style.display = 'inline-block';
      span.style.position = 'relative';
      wrapper.appendChild(span);
      nehaEl.appendChild(wrapper);
      return { wrapper, span, ch, phase: i * 0.22, particles: null, particlesEl: null };
    });

    nehaEl.addEventListener('pointerenter', () => { nehaHovered = true; });
    nehaEl.addEventListener('pointerleave', () => { nehaHovered = false; });
  }

  // Deferred until the real font has loaded — sampling glyph shape with
  // the fallback font would produce mismatched particle silhouettes.
  function initLetterParticles() {
    if (!nehaLetters.length) return;
    const style = getComputedStyle(nehaEl);
    const fontPx = parseFloat(style.fontSize) || 48;
    const sampleSize = Math.ceil(fontPx * 1.5);
    const cols = 11, rows = 15;
    const cellW = sampleSize / cols, cellH = sampleSize / rows;

    nehaLetters.forEach((l, li) => {
      const off = document.createElement('canvas');
      off.width = sampleSize; off.height = sampleSize;
      const octx = off.getContext('2d');
      octx.font = `${style.fontStyle} 400 ${fontPx}px ${style.fontFamily}`;
      octx.fillStyle = '#fff';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillText(l.ch, sampleSize / 2, sampleSize / 2);
      const data = octx.getImageData(0, 0, sampleSize, sampleSize).data;

      const particles = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sx = Math.floor((c + 0.5) * cellW), sy = Math.floor((r + 0.5) * cellH);
          if (data[(sy * sampleSize + sx) * 4 + 3] < 90) continue;
          particles.push({ baseX: sx - sampleSize / 2, baseY: sy - sampleSize / 2, phase: hash(li, particles.length) * 1000 });
        }
      }

      const container = document.createElement('div');
      container.className = 'neha-particles';
      container.style.width = sampleSize + 'px';
      container.style.height = sampleSize + 'px';
      container.style.marginLeft = (-sampleSize / 2) + 'px';
      container.style.marginTop = (-sampleSize / 2) + 'px';

      particles.forEach((p) => {
        const span = document.createElement('span');
        span.textContent = DISINTEGRATE_CHARS[Math.floor(hash(p.baseX, p.baseY) * DISINTEGRATE_CHARS.length)];
        span.style.position = 'absolute';
        span.style.left = (sampleSize / 2 + p.baseX) + 'px';
        span.style.top = (sampleSize / 2 + p.baseY) + 'px';
        span.style.fontSize = Math.max(4, fontPx * 0.1) + 'px';
        container.appendChild(span);
        p.span = span;
      });

      l.wrapper.appendChild(container);
      l.particles = particles;
      l.particlesEl = container;
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(initLetterParticles);
  else initLetterParticles();

  function updateNehaGlow(now) {
    if (!nehaLetters.length) return;
    nehaHoverT += ((nehaHovered ? 1 : 0) - nehaHoverT) * 0.15;

    nehaLetters.forEach((l) => {
      const color = nehaColor(now * 0.00012 + l.phase);
      l.span.style.color = color;
      l.span.style.textShadow = `0 0 16px ${color}`;
      l.span.style.opacity = (1 - nehaHoverT * 0.9).toFixed(2);

      if (!l.particlesEl) return;
      l.particlesEl.style.opacity = nehaHoverT.toFixed(2);
      if (nehaHoverT < 0.01) return;

      l.particles.forEach((p) => {
        const drift = nehaHoverT * 5;
        const dx = Math.sin(now * 0.0012 + p.phase) * drift;
        const dy = Math.cos(now * 0.0009 + p.phase * 1.3) * drift - nehaHoverT * 3;
        const pColor = nehaColor(now * 0.0002 + p.phase);
        p.span.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
        p.span.style.color = pColor;
        p.span.style.textShadow = `0 0 4px ${pColor}`;
      });
    });
  }

  // ---- Main flower: build actual span elements (not an innerHTML
  // string) and keep references + base positions, so per-frame proximity
  // interactivity can push/brighten individual characters near the
  // cursor instead of only tilting the whole group. ----
  let mainCells = [];
  function renderMainFlower(data, iw, ih) {
    const cells = buildImageCells(data, iw, ih, 46, 46);
    cellsEl.innerHTML = '';
    mainCells = cells.map((c) => {
      const span = document.createElement('span');
      span.textContent = c.ch;
      span.style.position = 'absolute';
      span.style.left = c.left + 'px';
      span.style.top = c.top + 'px';
      span.style.fontSize = c.size + 'px';
      span.style.color = c.color;
      span.style.textShadow = '0 0 5px ' + c.color;
      span.style.willChange = 'transform, opacity';
      cellsEl.appendChild(span);
      return { span, baseLeft: c.left, baseTop: c.top, energy: 0 };
    });
  }

  const img = new Image();
  // "neha" cycles through colors actually sampled from flower.jpg once it
  // loads (falls back to the synthetic AURORA palette until then) — ties
  // the name's glow directly to the real photo instead of a made-up set.
  let nehaPalette = null;
  function samplePaletteFromPhoto(data, iw, ih) {
    const colors = [];
    const GRID = 6;
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const sx = Math.floor((c + 0.5) / GRID * iw);
        const sy = Math.floor((r + 0.5) / GRID * ih);
        const idx = (sy * iw + sx) * 4;
        const R = data[idx], G = data[idx + 1], B = data[idx + 2];
        const lum = 0.299 * R + 0.587 * G + 0.114 * B;
        if (lum < 25 || lum > 245) continue; // skip background + blown highlights
        colors.push('#' + [R, G, B].map((v) => v.toString(16).padStart(2, '0')).join(''));
      }
    }
    return colors.length >= 2 ? colors : null;
  }
  function nehaColor(t) {
    const palette = nehaPalette || AURORA;
    t = t - Math.floor(t);
    const seg = t * palette.length;
    const i = Math.floor(seg) % palette.length;
    const j = (i + 1) % palette.length;
    return lerpColor(palette[i], palette[j], seg - Math.floor(seg));
  }

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    renderMainFlower(data, canvas.width, canvas.height);
    nehaPalette = samplePaletteFromPhoto(data, canvas.width, canvas.height);
  };
  img.onerror = () => console.warn('Could not load', IMAGE_SRC, '— check the path.');
  img.src = IMAGE_SRC;

  // ---- Interactive ASCII orbs — small clusters of characters that
  // scatter outward and brighten as the periwinkle cursor approaches. ----
  // Plain symbols only — no letters, so nothing here ever accidentally
  // spells a word.
  const ORB_CHARS = ['·', '∘', '+', 'x', '~', '*', '°', '¦'];
  const ORB_PARTICLES = 9;
  const ORB_TRIGGER_RADIUS = 130;

  // Three different local-motion styles cycled across the orbs, so they
  // don't all trace the same circular path — plus each orb roams the
  // hero on its own slow, irregular (non-circular) drift instead of
  // sitting fixed at its starting corner.
  const MOTION_STYLES = ['swirl', 'wave', 'random'];

  const orbs = Array.from(document.querySelectorAll('.ascii-orb')).map((el, oi) => {
    // Per-orb speed variance (Storm Strings' colSpeed trick) — each orb
    // drifts/cycles at its own rate instead of everything moving in
    // lockstep, so the cluster reads as organic, not mechanical.
    const flowSpeed = 0.6 + hash(oi, 99) * 1.3;
    const motionStyle = MOTION_STYLES[oi % MOTION_STYLES.length];

    // Roaming drift params — two incommensurate sine terms per axis
    // (different frequencies, no common period) so the path never
    // repeats in an obviously circular/looping way.
    const drift = {
      ax: 70 + hash(oi, 200) * 130,
      ay: 55 + hash(oi, 201) * 110,
      fx: 0.00012 + hash(oi, 202) * 0.00022,
      fy: 0.00013 + hash(oi, 203) * 0.00024,
      fx2: 0.00031 + hash(oi, 204) * 0.00027,
      fy2: 0.00027 + hash(oi, 205) * 0.00025,
      phx: hash(oi, 206) * Math.PI * 2,
      phy: hash(oi, 207) * Math.PI * 2
    };

    const particles = [];
    for (let i = 0; i < ORB_PARTICLES; i++) {
      const span = document.createElement('span');
      span.textContent = ORB_CHARS[Math.floor(hash(oi, i) * ORB_CHARS.length)];
      el.appendChild(span);
      particles.push({
        span,
        angle: (i / ORB_PARTICLES) * Math.PI * 2,
        restRadius: 10 + hash(oi, i + 20) * 8,
        phase: hash(oi, i + 30) * 1000,
        colorPhase: hash(oi, i + 40),
        freqA: 0.8 + hash(oi, i + 50) * 1.4,
        freqB: 0.5 + hash(oi, i + 60) * 1.1,
        rerollAt: 0
      });
    }
    return { el, particles, energy: 0, flowSpeed, motionStyle, drift };
  });

  // Smooth, purely color-based gradient (no ASCII characters) bridging
  // the hero into the cream Work section. Built with many closely-spaced
  // stops rather than a handful of hand-picked ones — a gradient with
  // only 4-5 stops has a visible change in slope at each one (an
  // "elbow"), which reads as harsh even when every individual segment
  // looks smooth on its own.
  function buildFadeGradient() {
    const el = document.getElementById('hero-fade');
    if (!el) return;
    const STEPS = 28;
    const stops = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      // Majority of the band stays black — the curve doesn't even start
      // reaching toward white until well past the midpoint, and finishes
      // at t=0.82 (a clean solid-white margin before the Work heading,
      // instead of still transitioning right up to that boundary).
      const colorT = Math.pow(t, 3); // majority stays black, eases into white by the very end
      const color = lerpColor('#030204', '#FAF8F5', colorT); // plain black -> cream, no tint
      stops.push(color + ' ' + (t * 100).toFixed(1) + '%');
    }
    // Belt-and-suspenders: force the final stop to be pixel-identical to
    // the Work section's background, so there is no seam no matter what.
    stops[stops.length - 1] = '#FAF8F5 100%';
    el.style.background = 'linear-gradient(to bottom, ' + stops.join(', ') + ')';
  }
  buildFadeGradient();

  // ---- interaction state ----
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startTime = performance.now();
  let mouseNx = 0, mouseNy = 0, mouseTargetNx = 0, mouseTargetNy = 0, lastMoveTime = 0, scrollT = 0;
  let rawMouseX = -9999, rawMouseY = -9999;

  window.addEventListener('pointermove', (e) => {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.5;
    mouseTargetNx = (e.clientX - window.innerWidth / 2) / size;
    mouseTargetNy = (e.clientY - window.innerHeight / 2) / size;
    lastMoveTime = performance.now();
    rawMouseX = e.clientX;
    rawMouseY = e.clientY;
    if (cursorEl) cursorEl.style.transform = 'translate3d(' + (e.clientX - 10) + 'px,' + (e.clientY - 10) + 'px,0)';
  }, { passive: true });

  window.addEventListener('scroll', () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollT = clamp(window.scrollY / max, 0, 1);
  }, { passive: true });

  function updateOrbs(now) {
    orbs.forEach((orb) => {
      // Roam the hero on an irregular (non-circular) path — two
      // incommensurate sine terms per axis so it never traces a clean
      // loop, unlike a single sin/cos pair would.
      const d = orb.drift;
      const driftX = Math.sin(now * d.fx + d.phx) * d.ax + Math.sin(now * d.fx2 + d.phx * 1.7) * d.ax * 0.4;
      const driftY = Math.cos(now * d.fy + d.phy) * d.ay + Math.cos(now * d.fy2 + d.phy * 1.3) * d.ay * 0.4;
      orb.el.style.transform = `translate(${driftX.toFixed(1)}px, ${driftY.toFixed(1)}px)`;

      const rect = orb.el.getBoundingClientRect();
      const ocx = rect.left + rect.width / 2, ocy = rect.top + rect.height / 2;
      const dist = Math.hypot(rawMouseX - ocx, rawMouseY - ocy);
      const target = dist < ORB_TRIGGER_RADIUS ? 1 - dist / ORB_TRIGGER_RADIUS : 0;
      orb.energy += (target - orb.energy) * 0.12;

      const flow = now * 0.0002 * orb.flowSpeed;

      orb.particles.forEach((p, pi) => {
        if (now > p.rerollAt) {
          if (Math.random() < 0.12 + orb.energy * 0.5) {
            p.span.textContent = ORB_CHARS[Math.floor(Math.random() * ORB_CHARS.length)];
          }
          p.rerollAt = now + 300 - orb.energy * 180;
        }

        // Ambient aurora drift — always running, not just on hover, like
        // Storm Strings' cloud billow. Each orb's motionStyle gives a
        // genuinely different local path, not just a phase-shifted copy
        // of the same circular motion.
        let x, y;
        const scatter = 1 + orb.energy * 2.2;
        if (orb.motionStyle === 'wave') {
          // Figure-8-ish Lissajous sway rather than a rotation.
          x = Math.sin(flow * 2.1 + p.phase) * p.restRadius * 1.6 * scatter;
          y = (Math.cos(flow * 1.3 + p.phase * 1.4) * 0.6 + Math.sin(flow * 0.7 + p.phase) * 0.3) * p.restRadius * scatter;
        } else if (orb.motionStyle === 'random') {
          // Two incommensurate frequencies per particle — wanders
          // irregularly instead of settling into a repeating loop.
          x = (Math.sin(flow * p.freqA + p.phase) + Math.sin(flow * p.freqB * 0.6 + p.phase * 2.1) * 0.6) * p.restRadius * 0.9 * scatter;
          y = (Math.cos(flow * p.freqB + p.phase * 1.7) + Math.cos(flow * p.freqA * 0.5 + p.phase) * 0.6) * p.restRadius * 0.9 * scatter;
        } else {
          // swirl — the original rotating-cluster motion.
          const wave = Math.sin(flow * 3 - pi * 0.7 + p.phase);
          const angle = p.angle + flow + wave * 0.4;
          const radius = p.restRadius * (1 + wave * 0.25) * scatter;
          x = Math.cos(angle) * radius;
          y = Math.sin(angle) * radius + wave * 5;
        }

        const color = auroraColor(flow * 0.4 + p.colorPhase);
        const opacity = 0.45 + orb.energy * 0.5 + Math.sin(flow * 3 + p.phase) * 0.15;

        p.span.style.color = color;
        p.span.style.textShadow = `0 0 6px ${color}`;
        p.span.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(1 + orb.energy * 0.7).toFixed(2)})`;
        p.span.style.opacity = clamp(opacity, 0.25, 1).toFixed(2);
        p.span.style.fontSize = (9 + orb.energy * 4).toFixed(1) + 'px';
      });
    });
  }

  const MAIN_TRIGGER_RADIUS = 34;
  function updateMainFlower() {
    if (!mainCells.length || !flowerStageEl) return;
    const rect = flowerStageEl.getBoundingClientRect();
    const scaleX = rect.width / CONTAINER_SIZE, scaleY = rect.height / CONTAINER_SIZE;
    const localX = (rawMouseX - rect.left) / scaleX;
    const localY = (rawMouseY - rect.top) / scaleY;
    const thresholdSq = MAIN_TRIGGER_RADIUS * MAIN_TRIGGER_RADIUS;

    mainCells.forEach((cell) => {
      const dx = cell.baseLeft - localX, dy = cell.baseTop - localY;
      const distSq = dx * dx + dy * dy;
      if (distSq > thresholdSq * 4 && cell.energy < 0.001) return; // cheap skip when settled & far

      const target = distSq < thresholdSq ? 1 - Math.sqrt(distSq) / MAIN_TRIGGER_RADIUS : 0;
      cell.energy += (target - cell.energy) * 0.25;
      if (cell.energy < 0.001) {
        cell.span.style.transform = '';
        cell.span.style.opacity = '';
        return;
      }
      const dist = Math.sqrt(distSq) || 0.01;
      const push = cell.energy * 16;
      const ox = (dx / dist) * push, oy = (dy / dist) * push;
      cell.span.style.transform = `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px) scale(${(1 + cell.energy * 0.5).toFixed(2)})`;
      cell.span.style.opacity = (0.7 + cell.energy * 0.3).toFixed(2);
    });
  }

  function frame(now) {
    const elapsed = now - startTime;
    const breathe = Math.sin(now * 0.0006);
    const mouseStrength = lastMoveTime ? clamp(1 - (now - lastMoveTime) / 900, 0, 1) : 0;
    mouseNx += (mouseTargetNx - mouseNx) * 0.1;
    mouseNy += (mouseTargetNy - mouseNy) * 0.1;

    const satBloomA = easeOutCubic(clamp((elapsed - 350) / 1700, 0, 1));
    satAEl.textContent = computeFlowerField(26, 13, satBloomA, scrollT, 0, 0, 0, breathe, 1, 6, 4, 0.4);
    const satBloomB = easeOutCubic(clamp((elapsed - 550) / 1700, 0, 1));
    satBEl.textContent = computeFlowerField(24, 12, satBloomB, scrollT, 0, 0, 0, breathe, 1, 3, 3, -0.6);

    const mx = mouseNx * 6, my = mouseNy * -6;
    cellsEl.style.transform = 'perspective(600px) rotateX(' + my + 'deg) rotateY(' + mx + 'deg) rotate(' + (scrollT * 8) + 'deg) scale(' + (1 + scrollT * 0.06) + ')';

    updateOrbs(now);
    updateMainFlower();
    updateNehaGlow(now);

    if (!reducedMotion) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
