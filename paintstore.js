/* ================================================================
   THE PAINT STORE
   Every project lives once in PROJECTS. `aisles` controls which
   shelf(s) it's rendered on (a project can belong to more than one);
   `disciplines` controls which colored chip(s) it wears. To add a
   project, add an object here — nothing else needs to change.
   ================================================================ */

const DISCIPLINES = {
  swe:      { label: 'SWE',      color: '#8F94FB' }, // blue
  ai:       { label: 'AI / DS',  color: '#6E8F72' }, // green
  design:   { label: 'UX',       color: '#7454CC' }, // purple
  strategy: { label: 'Strategy', color: '#F5792C' }, // orange
  creative: { label: 'Creative', color: '#DE4386' }, // pink
  research: { label: 'Research', color: '#E6B149' }, // yellow
};

const PROJECTS = [
  {
    id: 'telemetry',
    code: '01',
    title: 'Distributed Telemetry Pipeline',
    role: 'Backend Engineering Intern',
    year: '2025',
    aisles: ['build'],
    disciplines: ['swe'],
    teaser: 'A real-time ingestion layer built to handle millions of events per minute.',
    tech: ['Go', 'Kafka', 'Prometheus'],
    impact: 'Cut alert latency from minutes to seconds.',
    finish: 'Matte',
    swatchColor: '#DCE3EA',
    case: {
      problem: 'Our incident response was slow because telemetry from a few hundred services landed in a single relational store that could not keep up with write volume during traffic spikes — the exact moments an on-call engineer needed fresh data most.',
      role: 'I designed and built the ingestion layer end to end: schema, streaming topology, and the alerting rules that consumed it.',
      process: 'I started by profiling the existing write path to find the actual bottleneck (it was lock contention, not throughput), then prototyped a Kafka-backed pipeline that decoupled ingestion from aggregation so each could scale independently.',
      technical: 'Events land on a partitioned Kafka topic, get windowed and aggregated by a Go consumer group, and are exposed to Prometheus via a custom exporter — all deployed with rolling updates so the migration required zero downtime.',
      challenges: 'The hardest tradeoff was exactly-once semantics versus latency; I chose at-least-once delivery with idempotent aggregation, which was simpler to operate and fast enough for our alerting SLAs.',
      results: 'Alert latency dropped from minutes to single-digit seconds, and the pipeline now handles 10x the previous write volume without adding hardware.',
      reflection: 'The biggest lesson was that the "obvious" fix (bigger database) would have masked the real problem. Profiling first saved weeks of wasted work.',
    },
  },
  {
    id: 'fintech-ds',
    code: '02',
    title: 'Component System for a FinTech Dashboard',
    role: 'Product Design Intern',
    year: '2024',
    aisles: ['design'],
    disciplines: ['design'],
    teaser: 'A token-driven design system spanning 40+ components for a fast-moving product team.',
    tech: ['Figma', 'React', 'Storybook'],
    impact: 'Cut new-screen design time by roughly half.',
    finish: 'Satin',
    swatchColor: '#E2D9E8',
    case: {
      problem: 'Every new dashboard screen was designed from scratch, so spacing, color, and interaction patterns drifted further apart with each release — small inconsistencies that added up to a product that felt unfinished.',
      role: 'I led the design side of the system: auditing existing screens, defining tokens, and pairing with engineering on the component API.',
      process: 'I audited every screen in production, grouped near-duplicate patterns, and proposed a token layer (color, spacing, type) before touching a single component, so the system had a stable foundation to build on.',
      technical: 'Tokens were defined once in Figma variables and mirrored as CSS custom properties consumed by a React + Storybook component library, keeping design and code as close to a single source of truth as possible.',
      challenges: 'The hard part was governance, not tooling — getting a fast-moving team to adopt shared components without feeling slowed down. I resolved this by shipping the five most-used components first, so adoption paid for itself immediately.',
      results: 'New screens went from days to design to about half that, and cross-screen consistency issues in QA dropped sharply.',
      reflection: 'A design system succeeds or fails on adoption, not documentation. Shipping value early mattered more than covering every edge case up front.',
    },
  },
  {
    id: 'motion-studies',
    code: '03',
    title: 'Generative Motion Studies',
    role: 'Personal Project',
    year: '2024',
    aisles: ['design', 'explore'],
    disciplines: ['creative', 'research'],
    teaser: 'Browser-based generative sketches exploring parallax, inertia, and seeded randomness.',
    tech: ['JS Canvas', 'GLSL'],
    impact: 'Became the interaction language for this site’s playground.',
    finish: 'Gloss',
    swatchColor: '#E9D8CE',
    case: {
      problem: 'I wanted interaction on my own site to feel tactile rather than decorative, but most "creative coding" demos I found were either too chaotic to feel premium or too static to feel alive.',
      role: 'Solo — concept, shaders, and interaction logic.',
      process: 'I worked in short, deliberate studies: one exploring deterministic pseudo-randomness for layout, another isolating cursor-parallax from drag-inertia so the two could never visually fight each other.',
      technical: 'Layout uses a seeded hash function so positions stay stable across reloads without storing state; motion is a single combined transform per frame (drag + parallax), which keeps everything perfectly in sync with no jitter.',
      challenges: 'The tradeoff was restraint — early versions used real 3D perspective and it read as gimmicky. Flattening everything to 2D translation and scale made the motion feel more expensive, not less.',
      results: 'The techniques from these studies became the actual drag-and-parallax system running on this site’s Playground page.',
      reflection: 'Constraints made the work better. The version with the fewest moving parts ended up feeling the most premium.',
    },
  },
  {
    id: 'healthcare-ux',
    code: '04',
    title: 'Redesigning Trust: A Healthcare Onboarding Study',
    role: 'UX Research',
    year: '2023',
    aisles: ['design', 'explore'],
    disciplines: ['design', 'research'],
    teaser: 'How small copy and sequencing changes measurably increased patient onboarding completion.',
    tech: ['Figma', 'Maze', 'SQL'],
    impact: 'Raised onboarding completion by double digits.',
    finish: 'Semi-Gloss',
    swatchColor: '#D9E0D3',
    case: {
      problem: 'A meaningful share of new patients dropped off during onboarding, and the team assumed it was a form-length problem — but the funnel data didn’t clearly support that theory.',
      role: 'I ran the research: usability sessions, funnel analysis, and the redesign recommendations that followed.',
      process: 'I paired moderated usability sessions with quantitative funnel analysis to find where trust actually broke down, which turned out to be *why* a field was being asked for, not how many fields there were.',
      technical: 'I queried step-level drop-off from the product database directly (SQL) to validate session findings at scale, then prototyped and A/B tested copy and sequencing changes with Maze before proposing engineering changes.',
      challenges: 'The tradeoff was pace versus rigor — stakeholders wanted a quick redesign, but shipping unvalidated copy changes risked solving the wrong problem twice. I negotiated a two-week research window to de-risk the fix.',
      results: 'Reframing three fields with plain-language context (why we ask, what happens next) raised onboarding completion by double digits, with no changes to form length.',
      reflection: 'Drop-off is rarely a UI problem first — it’s usually a missing-context problem that shows up as a UI symptom.',
    },
  },
  {
    id: 'feature-store',
    code: '05',
    title: 'Machine Learning Feature Store',
    role: 'Data Scientist Intern',
    year: '2023',
    aisles: ['build'],
    disciplines: ['ai'],
    teaser: 'A shared feature store bridging offline training and low-latency online inference.',
    tech: ['Python', 'Spark', 'Redis'],
    impact: 'Replaced three redundant one-off pipelines with one shared system.',
    finish: 'Matte',
    swatchColor: '#DCE5DC',
    case: {
      problem: 'Three separate teams had each built their own feature pipeline to feed models, which meant the same "customer activity in the last 7 days" feature was computed three different ways with three different bugs.',
      role: 'I designed the shared feature schema and built the batch-to-online sync path.',
      process: 'I started by cataloguing every feature in use across the three pipelines, found the ~80% that were genuinely shared, and designed a single definition each team could subscribe to instead of recomputing.',
      technical: 'Features are computed in batch with Spark, written to a versioned offline store, and synced to Redis for sub-10ms online lookups at inference time — with the same feature definition guaranteeing training/serving consistency.',
      challenges: 'The tricky tradeoff was freshness versus cost: some features needed near-real-time updates, most didn’t. I built a tiered refresh schedule instead of over-engineering everything to the strictest requirement.',
      results: 'The three redundant pipelines were retired in favor of one shared system, and training/serving skew — a recurring source of model bugs — dropped to near zero.',
      reflection: 'Most of the value here was organizational, not algorithmic: getting three teams to agree on one definition of a feature was harder than building the pipeline itself.',
    },
  },
  {
    id: 'editorial-framework',
    code: '06',
    title: 'Editorial Portfolio Framework',
    role: 'Design Systems',
    year: '2022',
    aisles: ['design'],
    disciplines: ['design'],
    teaser: 'A reusable set of layout and typography primitives tuned for whitespace, rhythm, and restraint.',
    tech: ['CSS', 'Design Tokens'],
    impact: 'Now the base system this site itself runs on.',
    finish: 'Satin',
    swatchColor: '#EFE7DA',
    case: {
      problem: 'Most portfolio templates I found were either generic SaaS-style grids or over-designed to the point of distraction — I wanted a base that got out of the way of the work.',
      role: 'Solo — token system, type scale, and layout primitives.',
      process: 'I started from typography (a serif/sans pairing and a restrained type scale) and let spacing and color follow from that, rather than starting with a color palette and retrofitting type.',
      technical: 'Every color, spacing, and border value is a CSS custom property, so an entire page’s mood can shift by swapping a handful of tokens — exactly what powers the per-project accent color in this case study system.',
      challenges: 'The temptation was to add more visual flourish; the harder discipline was cutting anything that didn’t serve legibility or hierarchy.',
      results: 'The token system now underlies every page on this site, including this one, and let new pages ship in hours instead of days.',
      reflection: 'Restraint is a design decision, not an absence of one — the whitespace here took as much iteration as any component did.',
    },
  },
  {
    id: 'growth-strategy',
    code: '07',
    title: 'Growth Strategy Dashboard',
    role: 'Product Strategy',
    year: '2023',
    aisles: ['build', 'explore'],
    disciplines: ['strategy', 'ai'],
    teaser: 'A self-serve dashboard that reframed growth reporting around cohort retention, not raw signups.',
    tech: ['SQL', 'Looker', 'Python'],
    impact: 'Became the team’s weekly source of truth for growth decisions.',
    finish: 'Semi-Gloss',
    swatchColor: '#E3DED5',
    case: {
      problem: 'Leadership was making growth decisions off a single headline signup number, which looked healthy even in weeks when retention was quietly getting worse.',
      role: 'I defined the metrics framework and built the dashboard leadership actually used weekly.',
      process: 'I modeled cohort retention curves in Python to find which weeks were actually driving durable growth, then worked backward to the small set of metrics worth surfacing daily.',
      technical: 'A scheduled Python job computes cohort retention and writes it to a warehouse table that Looker reads directly, so the dashboard stays current without any manual refresh step.',
      challenges: 'The tradeoff was simplicity versus completeness — it was tempting to surface every metric we could compute. I cut the dashboard down to four numbers that could each drive a decision.',
      results: 'The dashboard replaced three conflicting internal spreadsheets and became the team’s standing weekly growth review artifact.',
      reflection: 'The real work of a strategy dashboard is deciding what *not* to show. Fewer, better-chosen metrics changed behavior more than a comprehensive one ever did.',
    },
  },
];

/* ================================================================
   RENDER SWATCHES INTO THEIR AISLE GRID(S)
   ================================================================ */
function disciplineChips(disciplines) {
  return disciplines
    .map((key) => {
      const d = DISCIPLINES[key];
      return `<span class="chip" style="--chip-color:${d.color}">${d.label}</span>`;
    })
    .join('');
}

function techPills(tech) {
  return tech.map((t) => `<span class="tech-pill">${t}</span>`).join('');
}

function renderSwatch(project) {
  const el = document.createElement('div');
  el.className = 'swatch';
  el.style.setProperty('--swatch-bg', project.swatchColor);
  el.dataset.id = project.id;
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-haspopup', 'dialog');
  el.setAttribute('aria-label', `Open case study: ${project.title}`);

  el.innerHTML = `
    <div class="swatch-top">
      <span class="swatch-code">No. ${project.code}</span>
      <div class="swatch-chips">${disciplineChips(project.disciplines)}</div>
    </div>
    <div class="swatch-reveal">
      <p class="swatch-meta">${project.role} — ${project.year}</p>
      <p class="swatch-teaser">${project.teaser}</p>
      <div class="swatch-tech">${techPills(project.tech)}</div>
      <p class="swatch-impact">${project.impact}</p>
      <span class="swatch-cta">View case study →</span>
    </div>
    <div class="swatch-bottom">
      <h4 class="swatch-title">${project.title}</h4>
      <span class="swatch-finish">${project.finish} Finish</span>
    </div>
  `;

  el.addEventListener('click', () => openCaseStudy(project.id));
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openCaseStudy(project.id);
    }
  });

  return el;
}

function renderAisles() {
  const aisles = ['build', 'design', 'explore'];
  aisles.forEach((aisle) => {
    const grid = document.getElementById(`grid-${aisle}`);
    if (!grid) return;
    PROJECTS.filter((p) => p.aisles.includes(aisle)).forEach((p) => {
      grid.appendChild(renderSwatch(p));
    });
  });
}

/* ================================================================
   CASE STUDY OVERLAY
   ================================================================ */
const overlay = document.getElementById('case-overlay');
const caseHero = document.getElementById('case-hero');
const caseHeroLabel = document.getElementById('case-hero-label');
const caseHeroTitle = document.getElementById('case-hero-title');
const caseHeroMeta = document.getElementById('case-hero-meta');
const caseBody = document.getElementById('case-body');
const caseClose = document.getElementById('case-close');
const caseBack = document.getElementById('case-back');

const CASE_SECTIONS = [
  ['01 — Problem', 'problem'],
  ['02 — My Role', 'role'],
  ['03 — Process & Decisions', 'process'],
  ['04 — Technical Implementation', 'technical'],
  ['05 — Challenges & Tradeoffs', 'challenges'],
  ['06 — Results & Impact', 'results'],
  ['07 — Reflection', 'reflection'],
];

let lastFocusedSwatch = null;

function openCaseStudy(id) {
  const project = PROJECTS.find((p) => p.id === id);
  if (!project) return;

  lastFocusedSwatch = document.activeElement;

  const disciplineLabel = project.disciplines
    .map((key) => DISCIPLINES[key].label)
    .join(' + ');
  const accent = DISCIPLINES[project.disciplines[0]].color;

  overlay.style.setProperty('--case-wash', project.swatchColor);
  overlay.style.setProperty('--case-accent', accent);

  caseHeroLabel.textContent = `${project.aisles.join(' / ')} — ${disciplineLabel}`;
  caseHeroTitle.textContent = project.title;
  caseHeroMeta.textContent = `${project.role} — ${project.year} — ${project.finish} Finish`;

  caseBody.innerHTML = CASE_SECTIONS.map(
    ([label, key]) => `
      <div class="case-section">
        <span class="case-label">${label}</span>
        <p class="case-text">${project.case[key]}</p>
      </div>
    `
  ).join('');

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overlay-open');
  overlay.scrollTop = 0;
  caseClose.focus();
}

function closeCaseStudy() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overlay-open');
  if (lastFocusedSwatch) lastFocusedSwatch.focus();
}

caseClose.addEventListener('click', closeCaseStudy);
caseBack.addEventListener('click', closeCaseStudy);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) closeCaseStudy();
});

/* ================================================================
   NAV — highlight "Work" while the paint store is in view
   ================================================================ */
function initWorkScrollSpy() {
  const workSection = document.getElementById('work');
  const navWork = document.getElementById('nav-work');
  if (!workSection || !navWork || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        navWork.classList.toggle('active', entry.isIntersecting);
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  observer.observe(workSection);
}

renderAisles();
initWorkScrollSpy();
