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
if (window.parent !== window) {
  document.addEventListener('pointermove', (e) => {
    window.parent.postMessage({ type: 'storm-strings-pointer', x: e.clientX, y: e.clientY }, '*');
  });
}

const LETTER_COLORS = ['#0a1f38', '#0d2b4e', '#123c6b', '#164272', '#1c4d8a', '#153e75', '#111820', '#000000'];
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
// code content.
function buildRainContent(targetLength) {
  let str = '';
  while (str.length < targetLength) {
    const r = Math.random();
    if (r < 0.22) {
      str += RAIN_WORDS[Math.floor(Math.random() * RAIN_WORDS.length)] + ' ';
    } else if (r < 0.61) {
      // Only half of the remaining space gets a character — the rest
      // renders as blank gaps so the strings aren't overly dense.
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
  damping: .99,
  iterationsPerFrame: 5,
  compressFactor: .02,
  stretchFactor: 1.1,
  mouseSize: 5000,
  mouseStrength: 4,
  contain: false,
  randomSolve: false,
  preset: ''
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

let rafID, input, c;
function main() {
  rainContent = buildRainContent(CONFIG.gridW * CONFIG.gridH + 200);
  const { awidth: width, aheight: height, gridW, gridH, gravity, damping, iterationsPerFrame, compressFactor, stretchFactor, cellWidth, cellHeight } = CONFIG;

  // Per-cell content for the ASCII cloud — mostly single characters, with
  // the occasional cloud-synonym word overflowing into neighbor cells for
  // overlap/depth. A small random jitter per cell breaks up the grid look.
  // Picked once so it doesn't flicker every frame (rerollCloudChars swaps
  // a few at a time).
  const cloudFilledCells = [];
  CLOUD_MASK.forEach((row, r) => row.split('').forEach((ch, ci) => { if (ch === '#') cloudFilledCells.push([r, ci]); }));

  function randomCloudContent() {
    return Math.random() < 0.05
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
  const CLOUD_CLICK_DURATION = 650;
  // Smoothed per-cell "energy" (0..1) so each character eases toward its
  // own distance-based target instead of jumping — and so only cells near
  // the cursor/ripple actually move, not the whole cloud at once.
  const cloudCellEnergy = {};
  cloudFilledCells.forEach(([r, ci]) => { cloudCellEnergy[r + ',' + ci] = 0; });

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

  const oldCanvas = container.querySelector('canvas');
  if (oldCanvas) oldCanvas.remove();
  c = document.createElement('canvas');
  container.insertBefore(c, container.firstChild);
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const ctx = c.getContext('2d');

  const particles = [];
  const constraints = [], verticalConstraints = [], horizontalConstraints = [];
  const pinnedParticles = [];

  input = new Input({ c, particles });

  for(let i=0;i<gridW;i++) {
    const dropOffset = cloudDropOffset(i, gridW);
    for(let j=0;j<gridH;j++) {
      let x = i*cellWidth;
      let y = j*cellHeight + dropOffset;

      const id = getPointID(j, i, gridH);
      const pinned = j === 0;

      const charIndex = (i + j * gridW) % rainContent.length;
      const char = rainContent[charIndex] || ' ';

      const particle = new Particle({ x, y, pinned, id, char })
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
  function drawCloud(now) {
    const { left, top, width: cloudWidth, height: cloudHeight, cellSize } = getCloudBounds();
    const hoverRadius = cellSize * 5.5;

    // Cheap single AABB check (vs. a hypot() per cell) — most frames the
    // pointer is nowhere near the cloud, so skip all per-cell distance
    // math entirely and just ease any leftover energy back down to 0.
    const pointerNear =
      cloudPointer.x >= left - hoverRadius && cloudPointer.x <= left + cloudWidth + hoverRadius &&
      cloudPointer.y >= top - hoverRadius && cloudPointer.y <= top + cloudHeight + hoverRadius;

    const rippleProgress = (now - cloudClickStart) / CLOUD_CLICK_DURATION;
    const rippleRunning = cloudClickStart > -Infinity && rippleProgress >= 0 && rippleProgress <= 1;
    const rippleRadius = rippleProgress * cloudWidth * 0.85;
    const rippleBand = cellSize * 4;
    const skipEnergyCalc = !pointerNear && !rippleRunning;

    ctx.font = `bold ${Math.round(fontSize)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;

    for (const [r, ci] of cloudFilledCells) {
      const key = r + ',' + ci;
      const [jx, jy] = cloudCellJitter[key];
      const baseX = left + (ci + jx) * cellSize + cellSize / 2;
      const baseY = top + (r + jy) * cellSize + cellSize / 2;

      let energy = cloudCellEnergy[key];
      if (skipEnergyCalc) {
        if (energy > 0.001) {
          energy += (0 - energy) * 0.2;
          cloudCellEnergy[key] = energy;
        }
      } else {
        // How close is this specific character to the cursor?
        const distToPointer = Math.hypot(baseX - cloudPointer.x, baseY - cloudPointer.y);
        const hoverTarget = Math.max(0, 1 - distToPointer / hoverRadius);

        // Expanding ring from the last click — only cells the ring is
        // currently passing through light up, fading as it travels outward.
        let rippleTarget = 0;
        if (rippleRunning) {
          const distToClick = Math.hypot(baseX - cloudClickPos.x, baseY - cloudClickPos.y);
          const bandDist = Math.abs(distToClick - rippleRadius);
          if (bandDist < rippleBand) {
            rippleTarget = (1 - bandDist / rippleBand) * (1 - rippleProgress);
          }
        }

        const targetEnergy = Math.max(hoverTarget, rippleTarget);
        energy += (targetEnergy - energy) * 0.2;
        cloudCellEnergy[key] = energy;
      }

      ctx.fillStyle = cloudCellColor[key];

      if (energy < 0.01) {
        ctx.fillText(cloudCellContent[key], baseX, baseY);
        continue;
      }

      // Only cells with real energy pay for the transform — pushed gently
      // outward from the cursor/click and locally scaled + pulsing.
      const pushDist = energy * cellSize * 1.3;
      const angle = Math.atan2(baseY - cloudPointer.y, baseX - cloudPointer.x) || 0;
      const px = baseX + Math.cos(angle) * pushDist;
      const py = baseY + Math.sin(angle) * pushDist;
      const localPulse = 1 + Math.sin(now * 0.006 + r * 0.4 + ci * 0.3) * 0.15 * energy;
      const localScale = (1 + energy * 0.85) * localPulse;

      ctx.save();
      ctx.translate(px, py);
      ctx.scale(localScale, localScale);
      ctx.fillText(cloudCellContent[key], 0, 0);
      ctx.restore();
    }

    if (now - lastCloudReroll > 220) {
      rerollCloudChars(3);
      lastCloudReroll = now;
    }
  }

  function drawCode() {
    const offset = [c.width/2-width/2, c.height/2-height/2 + 40];
    particles.forEach(p => {
      if (p.char && p.char !== " ") {
        const constraint = p.downConstraint;
        let angle = 0;

        const img = charCanvases[p.char];
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
      }
    });
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

    particles.forEach(p=>p.update(delta-lastDelta));
    lastDelta = delta;

    if(CONFIG.randomSolve) shuffleArray(constraints)
    for(let i=0;i<iterationsPerFrame;i++) {
      for(let j=0;j<constraints.length;j++) constraints[j].solve();
    }

    if(CONFIG.contain) particles.forEach(p=>p.contain());

    drawCloud(delta);
    drawCode();

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
  constructor({ c, particles }) {
    this.c = c, this.particles = particles;
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
  // Added 'char' to the constructor
  constructor({x, y, pinned, id, char}={}) {
    this.pos = new Vec2(x, y);
    this.oldPos = new Vec2(x, y);
    this.velocity = new Vec2()
    this.acceleration = new Vec2();
    this.pinned = pinned;
    this.id = id;
    this.char = char;
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
