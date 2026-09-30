/* ================================================================
   hero-effects.js — halftone (designer) / ASCII (engineer) glyph
   dissolve hover effects. Ported directly from hero-prototype.html
   (see that file's own header for the full mechanism writeup); only
   change here is reading tunables from window.SITE_CONFIG.hero and
   the color/font custom properties from the new global token system
   (--color-30/--color-10/--color-60/--font-mono) instead of the
   prototype's locally-scoped --hero-* names.
   ================================================================ */
(function () {
  'use strict';

  const CONFIG = (window.SITE_CONFIG && window.SITE_CONFIG.hero) || {};
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hash2(a, b) {
    let h = (a * 374761393 + b * 668265263) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    h = h ^ (h >>> 16);
    return ((h >>> 0) % 100000) / 100000;
  }

  // ── Glyph mask + chamfer distance field ────────────────────────
  function buildMaskField(text, font, boxW, boxH, padding, dpr) {
    const w = Math.ceil((boxW + padding * 2) * dpr);
    const h = Math.ceil((boxH + padding * 2) * dpr);
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const ctx = off.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.font = font;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#000';

    const metrics = ctx.measureText(text);
    const ascent = metrics.actualBoundingBoxAscent || boxH * 0.78;
    const descent = metrics.actualBoundingBoxDescent || boxH * 0.2;
    const baselineY = padding + ascent + (boxH - ascent - descent) / 2;
    ctx.fillText(text, padding, baselineY);

    const data = ctx.getImageData(0, 0, w, h).data;
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) mask[i] = data[i * 4 + 3] >= 40 ? 1 : 0;

    return { mask, dist: chamferDistance(mask, w, h), width: w, height: h, dpr, padding };
  }

  function chamferDistance(mask, w, h) {
    const INF = 1e6;
    const dist = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) dist[i] = mask[i] ? INF : 0;
    const D1 = 1, D2 = Math.SQRT2;
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        const i = row + x;
        if (!mask[i]) continue;
        let d = dist[i];
        if (x > 0) d = Math.min(d, dist[i - 1] + D1);
        if (y > 0) d = Math.min(d, dist[i - w] + D1);
        if (x > 0 && y > 0) d = Math.min(d, dist[i - w - 1] + D2);
        if (x < w - 1 && y > 0) d = Math.min(d, dist[i - w + 1] + D2);
        dist[i] = d;
      }
    }
    for (let y = h - 1; y >= 0; y--) {
      const row = y * w;
      for (let x = w - 1; x >= 0; x--) {
        const i = row + x;
        if (!mask[i]) continue;
        let d = dist[i];
        if (x < w - 1) d = Math.min(d, dist[i + 1] + D1);
        if (y < h - 1) d = Math.min(d, dist[i + w] + D1);
        if (x < w - 1 && y < h - 1) d = Math.min(d, dist[i + w + 1] + D2);
        if (x > 0 && y < h - 1) d = Math.min(d, dist[i + w - 1] + D2);
        dist[i] = d;
      }
    }
    return dist;
  }

  function sampleField(field, xCss, yCss) {
    const px = Math.min(field.width - 1, Math.max(0, Math.round(xCss * field.dpr)));
    const py = Math.min(field.height - 1, Math.max(0, Math.round(yCss * field.dpr)));
    const idx = py * field.width + px;
    return { inside: !!field.mask[idx], distCss: field.dist[idx] / field.dpr, px, py, idx };
  }

  function outwardNormal(field, px, py) {
    const w = field.width, h = field.height, d = field.dist;
    const xp = Math.min(w - 1, px + 1), xm = Math.max(0, px - 1);
    const yp = Math.min(h - 1, py + 1), ym = Math.max(0, py - 1);
    const gx = d[py * w + xp] - d[py * w + xm];
    const gy = d[yp * w + px] - d[ym * w + px];
    const len = Math.hypot(gx, gy) || 1;
    return { x: -gx / len, y: -gy / len };
  }
  function normalizeVec(v) { const len = Math.hypot(v.x, v.y) || 1; return { x: v.x / len, y: v.y / len }; }

  // ── Coverage pass — fills any gap the main grid missed ─────────
  function coveragePass(particles, field, W, H, step, radiusOf) {
    const cols = Math.ceil(W / step), rows = Math.ceil(H / step);
    const covered = new Uint8Array(cols * rows);
    particles.forEach((p) => {
      const cx = Math.floor(p.x / step), cy = Math.floor(p.y / step);
      const rad = Math.max(1, Math.ceil(radiusOf(p) / step) + 1);
      for (let dy = -rad; dy <= rad; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
          const gx = cx + dx, gy = cy + dy;
          if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) continue;
          covered[gy * cols + gx] = 1;
        }
      }
    });
    const extra = [];
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        if (covered[gy * cols + gx]) continue;
        const x = gx * step + step / 2, y = gy * step + step / 2;
        const s = sampleField(field, x, y);
        if (!s.inside) continue;
        extra.push({ x, y, distCss: s.distCss, px: s.px, py: s.py, isCoverage: true });
      }
    }
    return extra;
  }

  // ── Halftone — 45°-rotated dot grid ─────────────────────────────
  function generateRotatedGrid(spacing, W, H) {
    const cos = Math.SQRT1_2, sin = Math.SQRT1_2;
    const diag = Math.sqrt(W * W + H * H);
    const pts = [];
    for (let v = -diag; v <= diag; v += spacing) {
      for (let u = -diag; u <= diag; u += spacing) {
        const x = u * cos - v * sin, y = u * sin + v * cos;
        if (x >= -1 && x <= W + 1 && y >= -1 && y <= H + 1) pts.push({ x, y, u });
      }
    }
    return pts;
  }

  function tierFor(distCss, maxStrokeRadius, sizeScale) {
    const norm = clamp(distCss / maxStrokeRadius, 0, 1);
    return clamp(Math.round(norm * (sizeScale.length - 1)), 0, sizeScale.length - 1);
  }

  function buildHalftoneParticles(field, W, H) {
    const cfg = CONFIG.halftone;
    const grid = generateRotatedGrid(cfg.spacing, W, H);
    const light = normalizeVec(CONFIG.light);
    const particles = [];

    for (const p of grid) {
      const s = sampleField(field, p.x, p.y);
      if (!s.inside) continue;
      const tier = tierFor(s.distCss, cfg.maxStrokeRadius, cfg.sizeScale);
      const radius = cfg.sizeScale[tier] * cfg.maxDotRadius;
      const outward = outwardNormal(field, s.px, s.py);
      const facing = outward.x * light.x + outward.y * light.y;
      particles.push({
        x: p.x, y: p.y, u: p.u, tier, radius,
        color: cfg.coreTiers.includes(tier) ? 'core' : 'outer',
        highlight: tier >= cfg.highlightTierMin && facing > cfg.highlightThreshold
      });
    }

    const extra = coveragePass(particles, field, W, H, cfg.coverageStep, () => cfg.sizeScale[0] * cfg.maxDotRadius * 1.4);
    extra.forEach((e) => {
      const outward = outwardNormal(field, e.px, e.py);
      const facing = outward.x * light.x + outward.y * light.y;
      particles.push({
        x: e.x, y: e.y, u: e.x, tier: 0,
        radius: cfg.sizeScale[0] * cfg.maxDotRadius,
        color: 'outer',
        highlight: facing > cfg.highlightThreshold
      });
    });

    const us = particles.map((p) => p.u);
    const uMin = Math.min.apply(null, us), uMax = Math.max.apply(null, us);
    particles.forEach((p) => { p.sweepT = uMax > uMin ? (p.u - uMin) / (uMax - uMin) : 0; });
    return particles;
  }

  // ── ASCII — baseline row/column grid ────────────────────────────
  function buildAsciiParticles(field, W, H) {
    const cfg = CONFIG.ascii;
    const cols = Math.ceil(W / cfg.cell), rows = Math.ceil(H / cfg.cell);
    const grid = [];

    for (let r = 0; r < rows; r++) {
      const rowCells = [];
      for (let c = 0; c < cols; c++) {
        const x = c * cfg.cell + cfg.cell / 2, y = r * cfg.cell + cfg.cell / 2;
        if (x > W || y > H) { rowCells.push(null); continue; }
        const s = sampleField(field, x, y);
        if (!s.inside) { rowCells.push(null); continue; }
        let tier = 0;
        if (s.distCss >= cfg.thickThreshold) tier = 2;
        else if (s.distCss >= cfg.midThreshold) tier = 1;
        const outward = outwardNormal(field, s.px, s.py);
        rowCells.push({ x, y, row: r, col: c, tier, distCss: s.distCss, px: s.px, py: s.py, outward });
      }
      grid.push(rowCells);
    }

    grid.forEach((rowCells, r) => {
      let runStart = -1;
      for (let c = 0; c <= cols; c++) {
        const cell = rowCells[c];
        const isCore = cell && cell.tier === 2;
        if (isCore && runStart === -1) runStart = c;
        if ((!isCore || c === cols) && runStart !== -1) {
          const runLen = c - runStart;
          if (runLen >= cfg.minFragmentRun) {
            const frag = cfg.fragments[Math.floor(hash2(r, runStart) * cfg.fragments.length)];
            for (let k = 0; k < frag.length && runStart + k < c; k++) {
              const target = rowCells[runStart + k];
              target.isFragment = true;
              target.char = frag[k];
            }
          }
          runStart = -1;
        }
      }
    });

    const light = normalizeVec(CONFIG.light);
    const particles = [];
    grid.forEach((rowCells) => rowCells.forEach((cell) => {
      if (!cell) return;
      if (!cell.char) cell.char = cfg.charset[Math.floor(hash2(cell.row, cell.col) * cfg.charset.length)];
      const facing = cell.outward.x * light.x + cell.outward.y * light.y;
      cell.highlight = cell.tier <= 1 && facing > cfg.highlightThreshold;
      cell.scrambleChar = cell.char;
      particles.push(cell);
    }));

    const extra = coveragePass(particles, field, W, H, cfg.coverageStep, () => cfg.cell * 0.7);
    extra.forEach((e) => {
      const outward = outwardNormal(field, e.px, e.py);
      const facing = outward.x * light.x + outward.y * light.y;
      const ch = cfg.charset[Math.floor(hash2(Math.round(e.x), Math.round(e.y)) * cfg.charset.length)];
      particles.push({
        x: e.x, y: e.y, tier: 0, distCss: e.distCss,
        isFragment: false, char: ch, scrambleChar: ch,
        highlight: facing > cfg.highlightThreshold, isCoverage: true
      });
    });

    const xs = particles.map((p) => p.x);
    const xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs);
    particles.forEach((p) => { p.sweepT = xMax > xMin ? (p.x - xMin) / (xMax - xMin) : 0; });
    return particles;
  }

  // ── Shared timeline — createGlyphEffect(element, {mode}) ───────
  function createGlyphEffect(root, opts) {
    const mode = opts.mode;
    const textEl = root.querySelector('.word-text');
    const word = textEl.textContent;
    if (REDUCED_MOTION) return;

    const c30 = cssVar('--color-30', '#2F63D9');
    const c10 = cssVar('--color-10', '#FFE99B');
    const c60 = cssVar('--color-60', '#FAF8F5');

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let field = null, particles = [], boxW = 0, boxH = 0, dpr = Math.max(1, window.devicePixelRatio || 1);

    function layout() {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      const rect = textEl.getBoundingClientRect();
      boxW = rect.width; boxH = rect.height;
      const pad = CONFIG.padding;

      canvas.style.left = (-pad) + 'px';
      canvas.style.top = (-pad) + 'px';
      canvas.style.width = (boxW + pad * 2) + 'px';
      canvas.style.height = (boxH + pad * 2) + 'px';
      canvas.width = Math.ceil((boxW + pad * 2) * dpr);
      canvas.height = Math.ceil((boxH + pad * 2) * dpr);

      const cs = getComputedStyle(textEl);
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      field = buildMaskField(word, font, boxW, boxH, pad, dpr);

      const W = boxW + pad * 2, H = boxH + pad * 2;
      particles = mode === 'halftone' ? buildHalftoneParticles(field, W, H) : buildAsciiParticles(field, W, H);
    }

    let state = 'idle', phaseStart = 0, rafId = null, rippleOrigin = { x: 0, y: 0 };
    const T = CONFIG.timing;
    const PHASES = ['dissolve', 'flash', 'shrink', 'ripple', 'resolve'];
    const PHASE_BOUNDS = (() => { let t = 0; const b = {}; PHASES.forEach((p) => { b[p] = [t, t + T[p]]; t += T[p]; }); return b; })();

    function currentPhase(elapsed) {
      for (const p of PHASES) { const [s, e] = PHASE_BOUNDS[p]; if (elapsed < e) return { name: p, localT: (elapsed - s) / (e - s) }; }
      return { name: 'done', localT: 1 };
    }

    function trigger(originClient) {
      if (state === 'playing') return;
      state = 'playing';
      phaseStart = performance.now();
      const pad = CONFIG.padding;
      if (originClient) {
        const rect = root.getBoundingClientRect();
        rippleOrigin = { x: originClient.x - rect.left + pad, y: originClient.y - rect.top + pad };
      } else {
        rippleOrigin = { x: boxW / 2 + pad, y: boxH / 2 + pad };
      }
      textEl.style.opacity = '1';
      canvas.style.opacity = '0';
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    }

    function tick(now) {
      const elapsed = now - phaseStart;
      const { name, localT } = currentPhase(elapsed);
      if (name === 'done') {
        canvas.style.opacity = '0'; textEl.style.opacity = '1';
        state = 'idle'; rafId = null;
        return;
      }
      render(name, clamp(localT, 0, 1), elapsed);
      rafId = requestAnimationFrame(tick);
    }

    function scaleForPhase(phase, t, dist) {
      if (phase === 'dissolve' || phase === 'resolve') return 1;
      if (phase === 'shrink') return lerp(1, 0.12, t * t);
      if (phase === 'ripple') {
        const waveFront = (CONFIG.ripple.speedPxPerSec * (t * T.ripple)) / 1000;
        const diff = dist - waveFront, fw = CONFIG.ripple.frontWidth;
        let progress;
        if (diff > fw) progress = 0; else if (diff < -fw) progress = 1;
        else progress = 1 - (diff + fw) / (2 * fw);
        return lerp(0.12, 1, clamp(progress, 0, 1));
      }
      return 1;
    }

    function render(phase, t, elapsedMs) {
      if (phase === 'dissolve') { textEl.style.opacity = String(1 - t); canvas.style.opacity = String(t); }
      else if (phase === 'resolve') { textEl.style.opacity = String(t); canvas.style.opacity = String(1 - t); }
      else { textEl.style.opacity = '0'; canvas.style.opacity = '1'; }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      if (mode === 'halftone') renderHalftone(phase, t);
      else renderAscii(phase, t, elapsedMs);
      ctx.restore();
    }

    function renderHalftone(phase, t) {
      for (const p of particles) {
        const dist = Math.hypot(p.x - rippleOrigin.x, p.y - rippleOrigin.y);
        let scale = scaleForPhase(phase, t, dist);
        let glow = 0;
        if (phase === 'flash') {
          const d = Math.abs(t - p.sweepT), w = 0.12;
          glow = d < w ? 1 - d / w : 0;
          scale = 1 + glow * 0.4;
        }
        const r = p.radius * scale;
        if (r <= 0.15) continue;

        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = p.color === 'core' ? c10 : c30;
        ctx.fill();

        if (glow > 0.5) {
          ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = c10; ctx.globalAlpha = glow; ctx.fill(); ctx.globalAlpha = 1;
        }
        if (p.highlight && r > 0.6) {
          ctx.beginPath(); ctx.arc(p.x - r * 0.32, p.y - r * 0.32, r * 0.38, 0, Math.PI * 2);
          ctx.fillStyle = c60; ctx.fill();
        }
      }
    }

    function renderAscii(phase, t, elapsedMs) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const p of particles) {
        const dist = Math.hypot(p.x - rippleOrigin.x, p.y - rippleOrigin.y);
        let scale = scaleForPhase(phase, t, dist);
        let ch = p.isFragment ? p.char : p.scrambleChar;
        let color = p.isFragment ? c10 : c30;

        if (phase === 'flash') {
          const d = t - p.sweepT;
          if (d > -0.10 && d < 0.04) {
            p.scrambleChar = CONFIG.ascii.charset[(Math.random() * CONFIG.ascii.charset.length) | 0];
            ch = p.scrambleChar; color = c30;
            scale = 1 + Math.max(0, 0.04 - Math.abs(d)) * 6;
          } else if (d >= 0.04) {
            ch = p.isFragment ? p.char : p.scrambleChar;
            color = p.isFragment ? c10 : c30;
          } else {
            ch = p.scrambleChar; color = c30; scale *= 0.7;
          }
        }

        const px = (CONFIG.ascii.sizeScale[p.tier] || CONFIG.ascii.sizeScale[0]) * scale;
        if (px <= 1) continue;
        ctx.font = `${px}px ${cssVar('--font-mono', 'monospace')}`;
        ctx.fillStyle = color; ctx.globalAlpha = clamp(scale, 0, 1);
        ctx.fillText(ch, p.x, p.y); ctx.globalAlpha = 1;

        if (p.highlight && scale > 0.5) {
          ctx.font = `${px * 0.55}px ${cssVar('--font-mono', 'monospace')}`;
          ctx.fillStyle = c60;
          ctx.fillText(ch, p.x - px * 0.22, p.y - px * 0.22);
        }
      }
    }

    root.addEventListener('mouseenter', (e) => trigger({ x: e.clientX, y: e.clientY }));
    root.addEventListener('focusin', () => trigger(null));
    root.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      trigger(t ? { x: t.clientX, y: t.clientY } : null);
    }, { passive: true });

    layout();
    window.addEventListener('resize', layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  }

  document.querySelectorAll('.word').forEach((el) => createGlyphEffect(el, { mode: el.dataset.mode }));

  // ── Preload — every image frame, so first hover never flickers ──
  const ALL_IMAGE_PATHS = [
    CONFIG.assets.eye.closed, CONFIG.assets.eye.openEmpty, ...CONFIG.assets.eye.openFrames,
    CONFIG.assets.hand.rest, ...CONFIG.assets.hand.waveFrames
  ].filter(Boolean);
  ALL_IMAGE_PATHS.forEach((src) => { const img = new Image(); img.src = src; });
})();
