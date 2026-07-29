// "Storm Strings" — a rainy-day reskin of a Verlet string-physics grid
// originally built by Liam Egan (https://codepen.io/shubniggurath/pen/ZYpjorm),
// forked from https://codepen.io/shubniggurath/pen/xbwOJye. MIT licensed,
// see LICENSE.txt. The physics engine (Particle/Constraint/Input/Vec2) is
// untouched below — only the pinned-row shape, character source, glyph
// rendering, and the lightning overlay are new.

import {
  lerp,
  getPointsForGridId,
  getEdgeIdsForGridId,
  getPointID,
  hash,
  smoothstep
} from "https://codepen.io/shubniggurath/pen/OPyPdmm.js";

console.clear();

// When embedded in the portfolio wall, there is exactly ONE cursor dot —
// the parent page's own — and it is the only thing that ever draws it.
// This iframe has no cursor element of its own; it just relays raw
// pointer position up to the host via postMessage, which combined with
// the iframe's own bounding rect (known to the parent) is enough for the
// parent to keep its single dot tracking seamlessly across the boundary.
// No local dot here means nothing can ever get left behind/"stuck" when
// the pointer exits, because there's nothing rendered in this document
// to forget to hide.
//
// Opened directly (not embedded), none of that applies — `.embedded` is
// never added, so the CSS falls back to the normal native cursor instead
// of hiding it with nothing to replace it.
if (window.parent !== window) {
  document.body.classList.add('embedded');
  document.addEventListener('pointermove', (e) => {
    window.parent.postMessage({ type: 'storm-strings-pointer', x: e.clientX, y: e.clientY }, '*');
  });
}

const LETTER_COLORS = [
  '#a7c6e7', '#7aabdb', '#4f8cd6', '#2f76b4', '#1f5b8a',
  '#1a4b75', '#163f65', '#0f334e', '#0a2c3e'
];
const RAIN_WORDS = [
  'drip', 'storm', 'pour', 'grey', 'damp', 'drizzle',
  'patter', 'soak', 'mist', 'downpour', 'puddle', 'thunder', 'gust', 'wet'
];
// Numbers and rain-shaped ASCII punctuation, woven between the words.
const RAIN_CHARS = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '.', ',', "'", '`', '"', ':', ';', '|', '/', '\\', '~', '*'
];

// The cloud, drawn as ASCII art instead of a realistic render — same vibe
// as the letter strings. Mask sampled from a Blender/OpenVDB volumetric
// render of an actual cloud (cloud/render_cloud_anim.py) so the silhouette
// still reads as a cloud; '#' cells get a random character/word + color below.
const CLOUD_MASK = [
  '                                                                      ',
  '                          #                                           ',
  '                     #############                                    ',
  '                    ################                                  ',
  '                  ####################                                ',
  '                 ############################                         ',
  '                ################################                      ',
  '              ######################################                  ',
  '             #########################################                ',
  '             ##########################################               ',
  '             #############################################            ',
  '             ###############################################          ',
  '          ###################################################         ',
  '        ######################################################        ',
  '       ######################################################## #     ',
  '      ###########################################################     ',
  '      #############################################################   ',
  '     ###############################################################  ',
  '     ###############################################################  ',
  '    ###############################################################   ',
  '  #################################################################   ',
  '   ################################################################   ',
  '     ###########################################################      ',
  '       ########################################################       ',
  '         #####################################################        ',
  '           #################################################          ',
  '           ##############################################             ',
  '            ###########################################               ',
  '            ################################## ######                 ',
  '              #  ############################   ####                  ',
  '              ## ## ####################           #                  ',
  '                      ##############                                  ',
  '                                 #                                    ',
  '                                                                      '
];
const CLOUD_CHARS = ['#', '%', '&', '@', '0', 'O', '8', '*', '+', '.', '~', 'o', '^'];
const CLOUD_WORDS = [
  'cloud', 'fog', 'mist', 'haze', 'puff', 'billow', 'nimbus', 'cumulus',
  'vapor', 'drift', 'wisp', 'overcast', 'fluff', 'stratus', 'grey'
];
const CLOUD_COLORS = ['#ffffff', '#f2f2f2', '#e2e2e2', '#cfcfcf', '#b5b5b5', '#989898', '#7d7d7d'];

// Deterministic per-character color pick, so a given character is always
// the same color but different characters vary across the palette.
function colorForChar(ch, palette) {
  let code = 0;
  for (let k = 0; k < ch.length; k++) code += ch.charCodeAt(k) * (k + 1);
  return palette[code % palette.length];
}

// Builds the string particles pull their "char" from — words, numbers, and
// rain-shaped ASCII punctuation. Replaces the old `main.toString()` source-
// code content. `density` (0..1) is the fraction of the string that's
// filled vs. blank gaps — passed per-column so some strings run sparse and
// others dense, instead of every string looking equally busy.
function buildRainContent(targetLength, density = 0.61) {
  let str = '';
  while (str.length < targetLength) {
    const r = Math.random();
    if (r < density * 0.36) {
      str += RAIN_WORDS[Math.floor(Math.random() * RAIN_WORDS.length)] + ' ';
    } else if (r < density) {
      str += RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)] + ' ';
    } else {
      str += '  ';
    }
  }
  return str;
}

// Cloud silhouette the pinned row traces, in canvas Y-offset per column.
// Sampled directly from storm-cloud.webm's alpha channel (24 columns across
// its bottom edge, see cloud/render_cloud_anim.py output) and normalized
// 0..1, so the strings look like they're dripping off the cloud's actual
// underside rather than a guessed shape.
function cloudDropOffset(i, gridW) {
  const profile = [
    0.018, 0.159, 0.287, 0.701, 0.872, 0.872, 0.860, 0.945,
    0.957, 0.939, 1.000, 1.000, 0.915, 0.872, 0.811, 0.744,
    0.762, 0.811, 0.720, 0.494, 0.409, 0.335, 0.134, 0.000
  ];
  const maxDrop = 26;
  const t = gridW <= 1 ? 0 : i / (gridW - 1);
  const pos = t * (profile.length - 1);
  const idx = Math.floor(pos);
  const frac = pos - idx;
  const a = profile[idx];
  const b = profile[Math.min(idx + 1, profile.length - 1)];
  return (a + (b - a) * frac) * maxDrop;
}

let rainContent = '';

const w = Math.min(400, window.innerWidth - 100), h = Math.min(400, window.innerHeight - 100);
const CONFIG = {
  awidth: w,
  aheight: h,
  gridW: Math.min(50, Math.floor(w/10)), // arbitrary something something
  gridH: Math.min(50, Math.floor(w/5)),
  gravity: .2,
  damping: .88,
  iterationsPerFrame: 12,
  compressFactor: .02,
  stretchFactor: 1.1,
  mouseSize: 5000,
  mouseStrength: 4,
  contain: false,
  randomSolve: false,
  preset: '',
  flowSpeed: 0.0065,       // how fast rain text scrolls down each string
  dripRate: 3,             // avg droplets spawned per frame, ambient (safe: capped by maxDrips)
  dripGravity: 0.011,      // acceleration applied to falling droplets
  mouseDripChance: 0.06,   // per-frame chance a disturbed lower particle drips
  dripMouseScatter: 2.2,   // sideways push drips get from a nearby cursor
  maxDrips: 180            // hard cap — slow fall speed means drips live longer, so cap population
};
CONFIG.cellWidth = CONFIG.awidth/(CONFIG.gridW-1)
CONFIG.cellHeight = CONFIG.aheight/(CONFIG.gridH-1);

window.addEventListener('resize', () => {
  if(c && c.width) {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    CONFIG.awidth = Math.min(CONFIG.width, c.width - 100);
    CONFIG.aheight = Math.min(CONFIG.height, c.height - 100);
    CONFIG.cellWidth = CONFIG.awidth/(CONFIG.gridW-1)
    CONFIG.cellHeight = CONFIG.aheight/(CONFIG.gridH-1);
  }
})

// Deterministic per-column jitter (0..1) so each string's rain flows at its
// own slightly different speed instead of everything scrolling in lockstep.
function seededRandom(seed) {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

let rafID, input, c;
function main() {
  const { awidth: width, aheight: height, gridW, gridH, gravity, damping, iterationsPerFrame, compressFactor, stretchFactor, cellWidth, cellHeight } = CONFIG;

  // Per-column variance: each string gets its own scroll/fall speed and its
  // own character density, so the wall reads as many independent rain
  // strands rather than one texture repeated gridW times.
  const colSpeed = [];      // multiplies text-flow AND drip fall speed
  const colDensity = [];    // fraction of the string that's filled vs blank
  const columnContent = []; // each column's own character sequence
  for (let i = 0; i < gridW; i++) {
    // Wide range on purpose — a handful of strings should read as
    // near-frozen and near-empty, not just "a bit slower/sparser", so the
    // wall feels like organically varied rain rather than one texture
    // repeated with a light jitter.
    // Bucketed rather than a smooth gradient — a distinct slow cluster and
    // a distinct fast cluster read as more organic variation than one wide
    // uniform range, where most strings end up looking similarly "medium".
    const isSlow = seededRandom(i * 3.1) < 0.55;
    colSpeed.push(isSlow
      ? 0.015 + seededRandom(i) * 0.35
      : 1.1 + seededRandom(i) * 3.6);
    colDensity.push(0.06 + seededRandom(i * 7.3) * 0.9);
    columnContent.push(buildRainContent(gridH + 60, colDensity[i]));
  }
  rainContent = columnContent.join('');
  let flowSteps = 0;

  // What character shows at grid position (i, j) right now. Subtracting
  // flowSteps (scaled per-column) from the row index means row j at the
  // next tick shows what row j-1 showed at this tick — text visibly slides
  // down each string instead of sitting static at the position it was born.
  function charAt(i, j) {
    const content = columnContent[i];
    const len = content.length;
    const idx = ((j - Math.floor(flowSteps * colSpeed[i])) % len + len) % len;
    return content[idx] || ' ';
  }

  // Per-cell content for the ASCII cloud — mostly single characters, with
  // the occasional cloud-synonym word overflowing into neighbor cells for
  // overlap/depth. A small random jitter per cell breaks up the grid look.
  // Picked once so it doesn't flicker every frame (rerollCloudChars swaps
  // a few at a time).
  const cloudFilledCells = [];
  CLOUD_MASK.forEach((row, r) => row.split('').forEach((ch, ci) => { if (ch === '#') cloudFilledCells.push([r, ci]); }));

  function randomCloudContent() {
    return Math.random() < 0.22
      ? CLOUD_WORDS[Math.floor(Math.random() * CLOUD_WORDS.length)]
      : CLOUD_CHARS[Math.floor(Math.random() * CLOUD_CHARS.length)];
  }

  const cloudCellContent = {};
  const cloudCellColor = {};
  const cloudCellJitter = {};
  cloudFilledCells.forEach(([r, ci]) => {
    const key = r + ',' + ci;
    cloudCellContent[key] = randomCloudContent();
    cloudCellColor[key] = CLOUD_COLORS[Math.floor(Math.random() * CLOUD_COLORS.length)];
    cloudCellJitter[key] = [(Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8];
  });

  function rerollCloudChars(count) {
    for (let n = 0; n < count; n++) {
      const [r, ci] = cloudFilledCells[Math.floor(Math.random() * cloudFilledCells.length)];
      cloudCellContent[r + ',' + ci] = randomCloudContent();
    }
  }

  // ---- Cloud hover/click interaction — expands, pulses, and drifts while
  // the pointer is over it, plus a quick outward burst on click. ----
  const CLOUD_COLS = CLOUD_MASK[0].length;
  const CLOUD_ROWS = CLOUD_MASK.length;

  function getCloudBounds() {
    const offset = [c.width/2-width/2, c.height/2-height/2 + 40];
    const cloudWidth = width * 1.35;
    const cellSize = cloudWidth / CLOUD_COLS;
    const cloudHeight = cellSize * CLOUD_ROWS;
    const left = offset[0] + width / 2 - cloudWidth / 2;
    const bottom = offset[1] + 12;
    const top = bottom - cloudHeight;
    return { left, top, width: cloudWidth, height: cloudHeight, cellSize };
  }

  let cloudPointer = { x: -99999, y: -99999 };
  let cloudClickStart = -Infinity;
  let cloudClickPos = { x: 0, y: 0 };
  const CLOUD_CLICK_DURATION = 1100;
  // Two independent smoothed per-cell energies: hover (poke away from the
  // cursor, local) and ripple (a gas disturbance that starts right where
  // you clicked and travels outward through the rest of the cloud, rather
  // than the whole silhouette moving in lockstep).
  const cloudCellEnergy = {};
  const cloudCellBurst = {};
  cloudFilledCells.forEach(([r, ci]) => {
    const key = r + ',' + ci;
    cloudCellEnergy[key] = 0;
    cloudCellBurst[key] = 0;
  });

  function isPointerOverCloud(x, y) {
    const b = getCloudBounds();
    const pad = b.cellSize * 2;
    return x >= b.left - pad && x <= b.left + b.width + pad &&
           y >= b.top - pad && y <= b.top + b.height + pad;
  }

  document.addEventListener('pointermove', (e) => {
    cloudPointer.x = e.clientX;
    cloudPointer.y = e.clientY;
  });
  document.addEventListener('pointerdown', (e) => {
    if (isPointerOverCloud(e.clientX, e.clientY)) {
      cloudClickStart = performance.now();
      cloudClickPos = { x: e.clientX, y: e.clientY };
    }
  });

  const charCanvases = {};
  const fontSize = Math.max(12, cellHeight * 1.2);
  for (const ch of new Set(rainContent)) {
    if (ch === ' ') continue;
    const off = document.createElement('canvas');
    off.width = off.height = Math.ceil(fontSize * 1.4);
    const octx = off.getContext('2d');
    octx.font = `bold ${fontSize}px monospace`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillStyle = colorForChar(ch, LETTER_COLORS);
    octx.fillText(ch, off.width / 2, off.height / 2);
    charCanvases[ch] = off;
  }

  // A second, brighter-tinted set of the same glyphs — used for drips that
  // spawn while the cloud overhead is "charged" (recently touched/clicked),
  // so the rain visibly picks up brightness right after the cloud reacts,
  // tying the two systems together instead of them looking independent.
  const BRIGHT_DRIP_COLOR = '#a7c6e7';
  const charCanvasesBright = {};
  for (const ch of new Set(rainContent)) {
    if (ch === ' ') continue;
    const off = document.createElement('canvas');
    off.width = off.height = Math.ceil(fontSize * 1.4);
    const octx = off.getContext('2d');
    octx.font = `bold ${fontSize}px monospace`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillStyle = BRIGHT_DRIP_COLOR;
    octx.fillText(ch, off.width / 2, off.height / 2);
    charCanvasesBright[ch] = off;
  }

  // Cloud glyph cache — fillText() does text shaping/measurement on every
  // call, which for ~800+ filled cloud cells every single frame is real
  // cost and was a major source of the cloud feeling laggy. Cloud content
  // only ever comes from a small fixed set (CLOUD_CHARS + CLOUD_WORDS) in
  // one of CLOUD_COLORS, so every combination is pre-rasterized once here;
  // drawing a cloud cell afterward is a cheap drawImage() blit instead.
  const cloudGlyphCanvases = {};
  const cloudFontSize = Math.max(8, fontSize * 0.55);
  const cloudGlyphSize = Math.ceil(cloudFontSize * 4.2);
  for (const content of [...CLOUD_CHARS, ...CLOUD_WORDS]) {
    for (const color of CLOUD_COLORS) {
      const off = document.createElement('canvas');
      off.width = off.height = cloudGlyphSize;
      const octx = off.getContext('2d');
      octx.font = `bold ${Math.round(cloudFontSize)}px monospace`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillStyle = color;
      octx.fillText(content, cloudGlyphSize / 2, cloudGlyphSize / 2);
      cloudGlyphCanvases[content + '|' + color] = off;
    }
  }

  const oldCanvas = container.querySelector('canvas');
  if (oldCanvas) oldCanvas.remove();
  c = document.createElement('canvas');
  container.insertBefore(c, container.firstChild);
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const ctx = c.getContext('2d');

  // Rogue characters that drift loose around the cloud's silhouette rather
  // than sitting inside the fixed pixel mask — small, dim, independently
  // wandering and slowly breathing in and out. Reads as gas that isn't
  // fully contained by a rigid outline, instead of a static sprite.
  const STRAY_COUNT = 30;
  const strayParticles = [];
  for (let n = 0; n < STRAY_COUNT; n++) {
    strayParticles.push({
      angle: Math.random() * Math.PI * 2,
      radiusFactor: 0.5 + Math.random() * 0.9,
      wanderPhase: Math.random() * 1000,
      wanderSpeed: 0.5 + Math.random() * 0.9,
      rotateSpeed: (Math.random() - 0.5) * 0.00035,
      content: randomCloudContent(),
      color: CLOUD_COLORS[Math.floor(Math.random() * CLOUD_COLORS.length)],
      opacity: 0.35 + Math.random() * 0.45,
      rerollAt: 0
    });
  }

  function drawStrays(now) {
    const { left, top, width: strayCloudWidth, height: strayCloudHeight, cellSize: strayCellSize } = getCloudBounds();
    const centerX = left + strayCloudWidth / 2;
    const centerY = top + strayCloudHeight / 2;
    const rx = strayCloudWidth / 2;
    const ry = strayCloudHeight / 2;

    strayParticles.forEach(s => {
      if (now > s.rerollAt) {
        s.content = randomCloudContent();
        s.rerollAt = now + 2000 + Math.random() * 4000;
      }

      const angle = s.angle + now * s.rotateSpeed;
      const breathe = Math.sin(now * 0.0007 * s.wanderSpeed + s.wanderPhase);
      const radius = s.radiusFactor + breathe * 0.14;
      const x = centerX + Math.cos(angle) * rx * radius;
      const y = centerY + Math.sin(angle) * ry * radius
        + Math.sin(now * 0.0005 + s.wanderPhase * 1.3) * strayCellSize * 1.6;

      const img = cloudGlyphCanvases[s.content + '|' + s.color];
      if (!img) return;
      const drawSize = img.width * 0.45;
      ctx.globalAlpha = s.opacity;
      ctx.drawImage(img, x - drawSize / 2, y - drawSize / 2, drawSize, drawSize);
    });
    ctx.globalAlpha = 1;
  }

  const particles = [];
  const constraints = [], verticalConstraints = [], horizontalConstraints = [];
  const pinnedParticles = [];

  input = new Input({ c, particles, gridH, spawnDrip });

  for(let i=0;i<gridW;i++) {
    const dropOffset = cloudDropOffset(i, gridW);
    for(let j=0;j<gridH;j++) {
      let x = i*cellWidth;
      let y = j*cellHeight + dropOffset;

      const id = getPointID(j, i, gridH);
      const pinned = j === 0;

      const particle = new Particle({ x, y, pinned, id })
      particle.col = i;
      particle.row = j;
      particles.push(particle);
      if(pinned) pinnedParticles.push(particle);
    }
  }

  for(let i=0;i<gridW;i++) {
    for(let j=0;j<gridH;j++) {
      const id = getPointID(j, i, gridH);
      const p = particles[id];

      if(j<gridH-1) {
        const bottomP = particles[getPointID(j+1, i, gridH)];
        const c = new Constraint({p1: p, p2: bottomP, length: cellHeight, id: id+gridW*gridH, compressFactor, stretchFactor});
        constraints.push(c);
        p.downConstraint = c; // Cache the down ref directly on the particle
      }
      if(i<gridW-1) {
        const rightP = particles[getPointID(j, i+1, gridH)];

        const hc = new Constraint({
          p1: p,
          p2: rightP,
          length: cellWidth,
          id: id+gridW*gridH*2,
          compressFactor: 0.6,
          stretchFactor: 4,
          isSpacer: true
        });

        constraints.push(hc);
        horizontalConstraints.push(hc);
      }
    }
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(...p.pos, CONFIG.pointRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  let lastCloudReroll = 0;
  // How "charged" the cloud currently is (0..1), sampled during the click
  // ripple's peak — read by spawnDrip so freshly-spawned rain briefly picks
  // up extra brightness right after the cloud gets touched/clicked.
  let cloudActivityLevel = 0;
  function drawCloud(now) {
    const { left, top, width: cloudWidth, height: cloudHeight, cellSize } = getCloudBounds();
    // Wide enough to cover the whole cloud (with soft falloff) so touching
    // it makes the entire silhouette react, not just a small local poke.
    const hoverRadius = Math.max(cloudWidth, cloudHeight) * 0.85;

    // Cheap single AABB check (vs. a hypot() per cell) — most frames the
    // pointer is nowhere near the cloud, so skip all per-cell distance
    // math entirely and just ease any leftover energy back down to 0.
    const pointerNear =
      cloudPointer.x >= left - hoverRadius && cloudPointer.x <= left + cloudWidth + hoverRadius &&
      cloudPointer.y >= top - hoverRadius && cloudPointer.y <= top + cloudHeight + hoverRadius;

    // Click ripple: the area right where you clicked reacts immediately,
    // then an expanding ring carries that disturbance outward through the
    // rest of the cloud, fading as it travels — a gas ripple radiating from
    // one spot, not the whole silhouette moving together.
    const rippleProgress = (now - cloudClickStart) / CLOUD_CLICK_DURATION;
    const rippleRunning = cloudClickStart > -Infinity && rippleProgress >= 0 && rippleProgress <= 1;
    const maxRadius = Math.hypot(cloudWidth, cloudHeight);
    const rippleRadius = rippleProgress * maxRadius;
    const rippleBand = cellSize * 5;
    const immediateRadius = cellSize * 3.5;
    const skipEnergyCalc = !pointerNear && !rippleRunning;

    const targetActivity = rippleRunning ? Math.sin(Math.min(1, Math.max(0, rippleProgress)) * Math.PI) : 0;
    cloudActivityLevel += (targetActivity - cloudActivityLevel) * 0.1;

    // Whole-cloud sway, slow enough to read as gas drifting rather than
    // anything mechanical — applied to every cell before per-cell billow.
    const driftX = Math.sin(now * 0.00035) * cellSize * 1.8;
    const driftY = Math.sin(now * 0.00028 + 1.7) * cellSize * 1.1;

    for (const [r, ci] of cloudFilledCells) {
      const key = r + ',' + ci;
      const [jx, jy] = cloudCellJitter[key];
      const baseX = left + (ci + jx) * cellSize + cellSize / 2;
      const baseY = top + (r + jy) * cellSize + cellSize / 2;

      let energy = cloudCellEnergy[key];
      let burst = cloudCellBurst[key];
      if (skipEnergyCalc) {
        if (energy > 0.001) energy += (0 - energy) * 0.2;
        if (burst > 0.001) burst += (0 - burst) * 0.12;
        cloudCellEnergy[key] = energy;
        cloudCellBurst[key] = burst;
      } else {
        // How close is this specific character is to the cursor (poke).
        const distToPointer = Math.hypot(baseX - cloudPointer.x, baseY - cloudPointer.y);
        const hoverTarget = Math.max(0, 1 - distToPointer / hoverRadius);
        energy += (hoverTarget - energy) * 0.2;
        cloudCellEnergy[key] = energy;

        // Immediate area around the click reacts right away; beyond that,
        // only cells the expanding ring is currently passing through light
        // up, fading the farther out (and the longer ago) the ring reached.
        let burstTarget = 0;
        if (rippleRunning) {
          const distToClick = Math.hypot(baseX - cloudClickPos.x, baseY - cloudClickPos.y);
          if (distToClick < immediateRadius) {
            burstTarget = (1 - distToClick / immediateRadius) * (1 - rippleProgress * 0.6);
          } else {
            const bandDist = Math.abs(distToClick - rippleRadius);
            if (bandDist < rippleBand) {
              burstTarget = (1 - bandDist / rippleBand) * (1 - rippleProgress);
            }
          }
        }
        burst += (burstTarget - burst) * 0.15;
        cloudCellBurst[key] = burst;
      }

      const img = cloudGlyphCanvases[cloudCellContent[key] + '|' + cloudCellColor[key]];
      if (!img) continue;
      // Draw at the cached canvas's own native size — it was rasterized at
      // the same fontSize the old fillText() calls used, so this reproduces
      // the original glyph scale exactly (rather than an arbitrary
      // cellSize-based size, which was shrinking words/characters).
      const drawSize = img.width;
      const half = drawSize / 2;

      // Cheap ambient drift — a plain position offset, no matrix transform
      // needed, so every cell can afford to sway gently even fully at rest
      // without costing a frame.
      const seed = r * 12.9898 + ci * 78.233;
      const puffX = Math.sin(now * 0.0009 + seed) * cellSize * 0.7;
      const puffY = Math.sin(now * 0.0011 + seed * 1.7) * cellSize * 0.55;
      const px = baseX + driftX + puffX;
      const py = baseY + driftY + puffY;

      if (energy < 0.01 && burst < 0.01) {
        // The vast majority of cells most frames — a plain blit, no
        // transform, this is the expensive path only paid when needed.
        ctx.drawImage(img, px - half, py - half, drawSize, drawSize);
        continue;
      }

      let pushX = px, pushY = py, localScale = 1;

      if (energy >= 0.01) {
        // Local poke — pushed away from the cursor, only nearby cells.
        const pushDist = energy * cellSize * 1.3;
        const angle = Math.atan2(baseY - cloudPointer.y, baseX - cloudPointer.x) || 0;
        pushX += Math.cos(angle) * pushDist;
        pushY += Math.sin(angle) * pushDist;
        const hoverPulse = 1 + Math.sin(now * 0.006 + r * 0.4 + ci * 0.3) * 0.15 * energy;
        localScale *= (1 + energy * 0.85) * hoverPulse;
      }

      if (burst >= 0.01) {
        // Pushed away from the click point, not the cloud's center — this
        // is what makes it read as a ripple radiating from where you
        // touched it, rather than the whole shape moving as one.
        const burstPushDist = burst * cellSize * 3.4;
        const burstAngle = Math.atan2(baseY - cloudClickPos.y, baseX - cloudClickPos.x) || 0;
        pushX += Math.cos(burstAngle) * burstPushDist;
        pushY += Math.sin(burstAngle) * burstPushDist;
        localScale *= 1 + burst * 0.9;
      }

      ctx.setTransform(localScale, 0, 0, localScale, pushX, pushY);
      ctx.drawImage(img, -half, -half, drawSize, drawSize);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    if (now - lastCloudReroll > 220) {
      rerollCloudChars(3);
      lastCloudReroll = now;
    }

    drawStrays(now);
  }

  function getOffset() {
    return [c.width/2-width/2, c.height/2-height/2 + 40];
  }

  function drawCode() {
    const offset = getOffset();
    particles.forEach(p => {
      const ch = charAt(p.col, p.row);
      if (ch === ' ') return;

      const constraint = p.downConstraint;
      let angle = 0;

      const img = charCanvases[ch];
      if (!img) return;
      const half = img.width / 2;

      let cos = 1, sin = 0;

      if (constraint) {
        const dx = constraint.p2.pos.x - constraint.p1.pos.x;
        const dy = constraint.p2.pos.y - constraint.p1.pos.y;
        angle = Math.atan2(dy, dx) - Math.PI / 2;
        cos = Math.cos(angle);
        sin = Math.sin(angle);
      }

      ctx.setTransform(cos, sin, -sin, cos, p.pos.x+offset[0], p.pos.y+offset[1]);
      ctx.drawImage(img, -half, -half);
    });
  }

  // ---- Drips: characters that break off a string and free-fall through
  // the screen on their own, independent of the Verlet constraints. Spawned
  // both ambiently (a steady background drizzle) and when the mouse
  // disturbs a string's lower half (see Input.pointermove below). ----
  const drips = [];

  function spawnDrip(i, j, x, y) {
    if (drips.length >= CONFIG.maxDrips) return;
    const ch = charAt(i, j);
    if (ch === ' ') return;
    const fallMult = colSpeed[i];
    drips.push({
      x, y,
      vy: (0.25 + Math.random() * 0.3) * fallMult,
      vx: (Math.random() - 0.5) * 0.6,
      fallMult,
      char: ch,
      // Drips spawned while the cloud is freshly "charged" (mid-ripple)
      // pick up the brighter glyph set, tying the rain's look to the
      // cloud's own activity instead of the two feeling separate.
      bright: Math.random() < cloudActivityLevel * 0.85,
      seed: Math.random() * 1000,
      alpha: 1
    });
  }

  // ---- Splashes: a brief radial burst of tiny characters where a drip
  // lands, so it reads as hitting something rather than just vanishing. ----
  const splashes = [];
  function spawnSplash(x, y) {
    const count = 2 + Math.floor(Math.random() * 2);
    for (let n = 0; n < count; n++) {
      const angle = Math.random() * Math.PI * 2;
      splashes.push({
        x, y,
        vx: Math.cos(angle) * (0.3 + Math.random() * 0.5),
        vy: -Math.abs(Math.sin(angle)) * 0.4 - 0.15,
        life: 0,
        maxLife: 240 + Math.random() * 160,
        char: RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)]
      });
    }
  }

  function updateSplashes(dt) {
    for (let k = splashes.length - 1; k >= 0; k--) {
      const s = splashes[k];
      s.life += dt;
      if (s.life > s.maxLife) { splashes.splice(k, 1); continue; }
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.012;
    }
  }

  function drawSplashes() {
    const offset = getOffset();
    splashes.forEach(s => {
      const img = charCanvases[s.char];
      if (!img) return;
      const t = s.life / s.maxLife;
      ctx.globalAlpha = 1 - t;
      const scale = 0.35 + t * 0.75;
      ctx.setTransform(scale, 0, 0, scale, s.x + offset[0], s.y + offset[1]);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    });
    ctx.globalAlpha = 1;
  }

  // The strings hang from a single pinned top row and can stretch under
  // gravity, so their actual settled bottom can sit a bit past the
  // theoretical CONFIG.aheight. Reading the real bottom-most particle each
  // frame keeps splashes landing exactly where the strings visually end.
  function getStringBottomY() {
    let maxY = 0;
    for (let i = 0; i < gridW; i++) {
      const y = particles[getPointID(gridH - 1, i, gridH)].pos.y;
      if (y > maxY) maxY = y;
    }
    return maxY;
  }

  function updateDrips(now, groundY) {
    const mouse = input && input.mousePos;
    const scatterRadius = Math.sqrt(CONFIG.mouseSize);
    for (let k = drips.length - 1; k >= 0; k--) {
      const d = drips[k];
      d.vy += CONFIG.dripGravity * d.fallMult;

      if (mouse) {
        const dx = d.x - mouse.x, dy = d.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < scatterRadius && dist > 0.01) {
          const push = (1 - dist / scatterRadius) * CONFIG.dripMouseScatter;
          d.vx += (dx / dist) * push;
        }
      }

      d.x += d.vx + Math.sin(now * 0.003 + d.seed) * 0.3;
      d.y += d.vy;
      if (d.y >= groundY) {
        spawnSplash(d.x, groundY);
        drips.splice(k, 1);
        continue;
      }
      if (d.y > groundY - 80) d.alpha = Math.max(0, (groundY - d.y) / 80);
    }
  }

  function drawDrips() {
    const offset = getOffset();
    // drawCode leaves the canvas transform rotated to whatever the last
    // glyph needed — reset to identity once so drip positions (which
    // already have offset baked in) land where they're meant to.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drips.forEach(d => {
      const img = (d.bright ? charCanvasesBright : charCanvases)[d.char];
      if (!img) return;

      ctx.globalAlpha = d.alpha;
      ctx.setTransform(1, 0, 0, 1, d.x + offset[0], d.y + offset[1]);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    });
    ctx.globalAlpha = 1;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  let lastDelta = 0;
  function runloop(delta) {
    rafID = requestAnimationFrame(runloop);

    ctx.save();
    ctx.clearRect(0,0,c.width,c.height);

    const dt = delta - lastDelta;
    particles.forEach(p=>p.update(dt));
    lastDelta = delta;
    flowSteps += dt * CONFIG.flowSpeed;

    if(CONFIG.randomSolve) shuffleArray(constraints)
    for(let i=0;i<iterationsPerFrame;i++) {
      for(let j=0;j<constraints.length;j++) constraints[j].solve();
    }

    if(CONFIG.contain) particles.forEach(p=>p.contain());

    const dripsToSpawn = Math.floor(CONFIG.dripRate) + (Math.random() < CONFIG.dripRate % 1 ? 1 : 0);
    for (let n = 0; n < dripsToSpawn; n++) {
      const i = Math.floor(Math.random() * gridW);
      // Weighted toward the lower half of each string, but not exclusively —
      // drips shaking loose anywhere along the string reads as heavier rain.
      const j = Math.min(gridH - 1, Math.floor(gridH * (0.25 + Math.pow(Math.random(), 0.6) * 0.75)));
      const p = particles[getPointID(j, i, gridH)];
      spawnDrip(i, j, p.pos.x, p.pos.y);
    }
    updateDrips(delta, getStringBottomY());
    updateSplashes(dt);

    drawCloud(delta);
    drawCode();
    drawDrips();
    drawSplashes();

    ctx.restore();
  }
  runloopRef = runloop;
  rafID = requestAnimationFrame(runloop);
}

// When embedded (e.g. the portfolio playground wall), the host page can
// mount several instances of this piece at once outside the visible
// viewport (kept alive in a scroll buffer). Each one runs a genuinely
// expensive physics simulation unconditionally, so left unchecked that's
// several full sims running at once for zero visible benefit. The host
// posts pause/resume based on actual on-screen visibility (see
// playground.html's IntersectionObserver on the iframe).
let runloopRef = null;
let animPaused = false;
window.addEventListener('message', (e) => {
  if (!e.data || typeof e.data !== 'object') return;
  if (e.data.type === 'storm-strings-pause' && !animPaused) {
    animPaused = true;
    if (rafID) cancelAnimationFrame(rafID);
  } else if (e.data.type === 'storm-strings-resume' && animPaused && runloopRef) {
    animPaused = false;
    rafID = requestAnimationFrame(runloopRef);
  }
});

class Input {
  constructor({ c, particles, gridH, spawnDrip }) {
    this.c = c, this.particles = particles;
    this.gridH = gridH;
    this.spawnDrip = spawnDrip;
    this.mousePos = new Vec2();
    this.grabRadius = 20;
    this.grabbed;
    this.bind()
  }
  pointerdown(e) {
    const rect = this.rect;
    this.mousePos.x = e.clientX - c.width/2 + CONFIG.awidth/2;
    this.mousePos.y = e.clientY - c.height/2 + CONFIG.aheight/2;

    for (const p of this.particles) {
      if (this.mousePos.subtractNew(p.pos).length < this.grabRadius) {
        this.grabbedParticle = p;
        this.grabbedParticle.originalPinnedState = this.grabbedParticle.pinned;
        this.grabbedParticle.pinned = true;
        break;
      }
    }
    if(!this.grabbedParticle) {
      this.pointerIsDown = true
    }
  }
  pointerup(e) {
    if (this.grabbedParticle) {
      // Kill any residual velocity right at release so the particle drops
      // dead-still instead of carrying momentum into a recoil swirl.
      this.grabbedParticle.oldPos.reset(this.grabbedParticle.pos.x, this.grabbedParticle.pos.y);
      this.grabbedParticle.pinned = this.grabbedParticle.originalPinnedState;
      this.grabbedParticle = null;
    }
    clearTimeout(this.pointerUpTimer)
    this.pointerUpTimer = setTimeout(() => {
      this.pointerIsDown = false
    }, 1000)
  }
  pointermove(e) {
    const rect = this.rect;
    this.mousePos.x = e.clientX - c.width/2 + CONFIG.awidth/2;
    this.mousePos.y = e.clientY - c.height/2 + CONFIG.aheight/2;

    if (this.grabbedParticle) {
      this.grabbedParticle.pos.reset(this.mousePos.x, this.mousePos.y);
      this.grabbedParticle.oldPos.reset(this.mousePos.x, this.mousePos.y);
    }
      for (const p of this.particles) {
        const diff = this.mousePos.subtractNew(p.pos);
        const ls = diff.lengthSquared
        if(ls < CONFIG.mouseSize) {
          const a = diff.angle-Math.PI;
          const strength = smoothstep(CONFIG.mouseSize, -2000, ls)*CONFIG.mouseStrength/300;

          const force = new Vec2(Math.cos(a)*strength, Math.sin(a)*strength);
          p.applyForce(force)

          // Disturbing the lower half of a string has a chance to knock a
          // character loose as an independent falling drip.
          if (this.spawnDrip && p.row > this.gridH * 0.6 && Math.random() < CONFIG.mouseDripChance) {
            this.spawnDrip(p.col, p.row, p.pos.x, p.pos.y);
          }
        }
    }
  }
  contextmenu(e) {
    e.preventDefault();
  }
  get rect() {
    const rect = this.c.getBoundingClientRect();
    rect.scale = rect.width/this.c.width;
    return rect;
  }
  bind() {
    this.pointerdown=this.pointerdown.bind(this)
    this.pointerup=this.pointerup.bind(this)
    this.pointermove=this.pointermove.bind(this)
    this.contextmenu=this.contextmenu.bind(this)
    document.addEventListener('pointerdown', this.pointerdown)
    document.addEventListener('pointerup', this.pointerup)
    document.addEventListener('pointermove', this.pointermove)
    document.addEventListener('contextmenu', this.contextmenu)
  }
  unbind() {
    document.removeEventListener('pointerdown', this.pointerdown)
    document.removeEventListener('pointerup', this.pointerup)
    document.removeEventListener('pointermove', this.pointermove)
    document.removeEventListener('contextmenu', this.contextmenu)
  }
}

class Vec2 {
  constructor(x=0, y=0) {
    this.reset(x,y)
  }
  zero() {
    this.reset(0,0)
  }
  reset(x=0, y=0) {
    this.x = x;
    this.y = y;
  }
  clone() {
    return new Vec2(this.x, this.y);
  }
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  addNew(v) {
    return this.clone().add(v);
  }
  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  subtractNew(v) {
    return this.clone().subtract(v);
  }
  multiply(v) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }
  multiplyNew(v) {
    return this.clone().multiply(v);
  }
  scale(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  scaleNew(scalar) {
    return this.clone().scale(scalar);
  }

  get array() {
    return [this.x, this.y];
  }
  get lengthSquared() {
    return this.x**2 + this.y**2;
  }
  get length() {
    return Math.hypot(this.x, this.y);
  }
  get angle() {
    return Math.atan2(this.y, this.x);
  }

  [Symbol.iterator]() {
    let values = this.array;
    let i = 0;
    return {
      next() {
        if(i < values.length) {
          let value = values[i];
          i++;
          return { value, done: false }
        } else return { done: true }
      }
    }
  }
}

class Particle {
  constructor({x, y, pinned, id}={}) {
    this.pos = new Vec2(x, y);
    this.oldPos = new Vec2(x, y);
    this.velocity = new Vec2()
    this.acceleration = new Vec2();
    this.pinned = pinned;
    this.id = id;
    this.gravityVec = new Vec2();
  }
  contain() {
    if(this.pinned) return;
    const radius = 5;

    if (this.pos.x < radius) {
      this.pos.x = radius;
      this.oldPos.x = this.pos.x + Math.abs(this.oldPos.x - this.pos.x) * 0.8;
    } else if (this.pos.x > CONFIG.awidth - radius) {
      this.pos.x = CONFIG.awidth - radius;
      this.oldPos.x = this.pos.x - Math.abs(this.oldPos.x - this.pos.x) * 0.8;
    }
    if (this.pos.y < radius) {
        this.pos.y = radius;
        this.oldPos.y = this.pos.y + Math.abs(this.oldPos.y - this.pos.y) * 0.8;
    } else if (this.pos.y > CONFIG.aheight - radius) {
        this.pos.y = CONFIG.aheight - radius;
        this.oldPos.y = this.pos.y - Math.abs(this.oldPos.y - this.pos.y) * 0.8;
    }
  }
  update(delta) {
    if(this.pinned) {
      this.acceleration.zero();
      return;
    }

    this.velocity.reset(
      (this.pos.x - this.oldPos.x) * CONFIG.damping,
      (this.pos.y - this.oldPos.y) * CONFIG.damping
    );

    this.oldPos.reset(...this.pos);

    const dd = delta**2;
    this.gravityVec.reset(0,CONFIG.gravity/dd)

    this.applyForce(this.gravityVec)

    this.pos.x += this.velocity.x + this.acceleration.x * dd;
    this.pos.y += this.velocity.y + this.acceleration.y * dd;

    this.acceleration.reset();
  }
  applyForce(v) {
    this.acceleration.add(v);
  }
}

class Constraint {
  constructor({p1, p2, length, id, compressFactor, stretchFactor}) {
    this.p1 = p1;
    this.p2 = p2;
    this.length = length;
    this.id=id;
    this.minLength = length * compressFactor;
    this.maxLength = length * stretchFactor;

    c.addEventListener("update", (e) => {
this.minLength = this.length * (this.isSpacer ? compressFactor : e.detail.compressFactor);
      this.maxLength = this.length * (this.isSpacer ? stretchFactor : e.detail.stretchFactor);    })
  }
  solve() {
    // Inline the vector math to avoid thrash
    const dx = this.p2.pos.x - this.p1.pos.x;
    const dy = this.p2.pos.y - this.p1.pos.y;
    const distance = Math.hypot(dx, dy);

    if (distance == 0) return;

    let targetLength = this.length;
    if (distance < this.minLength) targetLength = this.minLength;
    else if (distance > this.maxLength) targetLength = this.maxLength;
    else return;

    const difference = targetLength - distance;
    const percent = difference / distance / 2;

    const offsetX = dx * percent;
    const offsetY = dy * percent;

    if (!this.p1.pinned) {
      this.p1.pos.x -= offsetX;
      this.p1.pos.y -= offsetY;
    }
    if (!this.p2.pinned) {
      this.p2.pos.x += offsetX;
      this.p2.pos.y += offsetY;
    }
  }
}

setTimeout(() => main(), 500);
