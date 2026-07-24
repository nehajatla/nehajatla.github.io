/* ================================================================
   paintstore.js — Work section projects

   HOW TO ADD YOUR THUMBNAIL IMAGES LATER
   ────────────────────────────────────────
   1. Drop your image file into assets/images/
      e.g. assets/images/lovable.jpg
   2. Set  image: "assets/images/lovable.jpg"  on the project below
   3. The color field becomes the fallback if image fails to load
   4. Save + push — done.

   FIELDS
   ──────
   id       unique slug
   context  small caps label: "WHERE · WHEN"
   title    project name
   desc     one-line description
   color    bold placeholder bg color (shows until real image added)
   image    path to thumbnail — leave "" for now
   tall     true = portrait aspect ratio (phone mockups etc)
   tags     discipline tags shown in case study header
   body     HTML for full case study body
================================================================ */

const PROJECTS = [

  /* 01 — Lovable */
  {
    id:      'lovable',
    context: 'LOVABLE · 2025',
    title:   'Lovable',
    desc:    'SWE & product work at AI-native app builder.',
    color:   '#FF4D00',
    image:   '',
    tall:    false,
    tags:    ['SWE', 'Product', 'AI'],
    body: `
      <p>Coming soon — thumbnail and case study in progress.</p>
    `
  },

  /* 02 — MetLife */
  {
    id:      'metlife',
    context: 'METLIFE · 2024',
    title:   'MetLife',
    desc:    'Software engineering and data analytics internship.',
    color:   '#0066FF',
    image:   '',
    tall:    false,
    tags:    ['SWE', 'Data Analytics'],
    body: `
      <p>Coming soon — thumbnail and case study in progress.</p>
    `
  },

  /* 03 — Cognition Product Design */
  {
    id:      'cognition',
    context: 'COGNITION · 2024',
    title:   'Cognition — Product Design',
    desc:    'Designing the interface for an AI coding agent.',
    color:   '#8B00FF',
    image:   '',
    tall:    false,
    tags:    ['Product Design', 'UX', 'AI'],
    body: `
      <p>Coming soon — thumbnail and case study in progress.</p>
    `
  },

  /* 04 — Rhydhun */
  {
    id:      'rhydhun',
    context: 'DUKE RHYDHUN · 2023–PRESENT',
    title:   'Rhydhun — Brand & Motion',
    desc:    'Instagram identity and video motion for Duke\'s fusion dance team.',
    color:   '#FF0080',
    image:   '',
    tall:    true,
    tags:    ['Brand', 'Motion', 'Social Media'],
    body: `
      <p>Coming soon — thumbnail and case study in progress.</p>
    `
  },

  /* 05 — Duke Eatz */
  {
    id:      'duke-eatz',
    context: 'DUKE EATZ · 2024',
    title:   'Duke Eatz',
    desc:    'Campus food discovery app — design and engineering.',
    color:   '#FF8C00',
    image:   '',
    tall:    false,
    tags:    ['Product Design', 'SWE', 'Mobile'],
    body: `
      <p>Coming soon — thumbnail and case study in progress.</p>
    `
  },

  /* 06 — Spotify */
  {
    id:      'spotify',
    context: 'SPOTIFY · CASE STUDY',
    title:   'Spotify — Case Study & Data',
    desc:    'UX case study combined with streaming data analysis.',
    color:   '#1DB954',
    image:   '',
    tall:    false,
    tags:    ['UX Research', 'Data', 'Case Study'],
    body: `
      <p>Coming soon — thumbnail and case study in progress.</p>
    `
  },

  /* 07 — CHWgo */
  {
    id:      'chwgo',
    context: 'APPSEED · 2023',
    title:   'CHWgo',
    desc:    'Community health worker platform for Puerto Rico.',
    color:   '#00B4D8',
    image:   '',
    tall:    false,
    tags:    ['Product Design', 'Social Impact', 'Mobile'],
    body: `
      <p>Coming soon — thumbnail and case study in progress.</p>
    `
  },

  /* 08 — Jonas RX */
  {
    id:      'jonas-rx',
    context: 'JONAS RX · 2024',
    title:   'Jonas RX',
    desc:    'Healthcare software design and engineering.',
    color:   '#E63946',
    image:   '',
    tall:    false,
    tags:    ['SWE', 'Healthcare', 'Design'],
    body: `
      <p>Coming soon — thumbnail and case study in progress.</p>
    `
  },

  /* 09 — Duke EHR */
  {
    id:      'duke-ehr',
    context: 'DUKE AI HEALTH · 2024',
    title:   'Duke EHR — LLM Pipeline',
    desc:    'Natural-language SQL interface for clinical health records.',
    color:   '#023E8A',
    image:   '',
    tall:    false,
    tags:    ['SWE', 'LLMs', 'SQL', 'Healthcare'],
    body: `
      <p>Coming soon — thumbnail and case study in progress.</p>
    `
  },

  /* 10 — Apple Watch Digests */
  {
    id:      'apple-watch',
    context: 'CONCEPT · 2025',
    title:   'Apple Watch Digests',
    desc:    'World Cup live digest experience on Apple Watch.',
    color:   '#1C1C1E',
    image:   '',
    tall:    true,
    tags:    ['Product Design', 'Concept', 'Wearables'],
    body: `
      <p>Coming soon — thumbnail and case study in progress.</p>
    `
  },

  /* 11 — RTC SWE + Data Analytics */
  {
    id:      'rtc',
    context: 'REWRITING THE CODE · 2023',
    title:   'RTC — SWE & Data Analytics',
    desc:    'Software engineering and data analytics with Rewriting the Code.',
    color:   '#7209B7',
    image:   '',
    tall:    false,
    tags:    ['SWE', 'Data Analytics'],
    body: `
      <p>Coming soon — thumbnail and case study in progress.</p>
    `
  },

];
/* ── END OF PROJECTS ── */


/* ================================================================
   RENDER ENGINE
================================================================ */
(function () {

  const grid     = document.getElementById('card-grid');
  const overlay  = document.getElementById('case-overlay');
  const labelEl  = document.getElementById('case-hero-label');
  const titleEl  = document.getElementById('case-hero-title');
  const metaEl   = document.getElementById('case-hero-meta');
  const bodyEl   = document.getElementById('case-body');
  const backBtn  = document.getElementById('case-back');
  const closeBtn = document.getElementById('case-close');

  if (!grid) return;

  PROJECTS.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = [
      'work-card',
      i % 2 === 1 ? 'work-card--offset' : '',
      p.tall       ? 'work-card--tall'   : '',
    ].filter(Boolean).join(' ');

    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open: ${p.title}`);

    /* Thumbnail */
    const thumb = document.createElement('div');
    thumb.className = 'card-thumb';
    thumb.style.background = p.color;

    if (p.image) {
      const img = document.createElement('img');
      img.src     = p.image;
      img.alt     = p.title;
      img.loading = 'lazy';
      thumb.appendChild(img);
    }

    /* Caption */
    const caption = document.createElement('div');
    caption.className = 'card-caption';
    caption.innerHTML = `
      <p class="card-context">${p.context}</p>
      <h3 class="card-title">${p.title}</h3>
      <p class="card-desc">${p.desc}</p>
    `;

    card.appendChild(thumb);
    card.appendChild(caption);
    grid.appendChild(card);

    /* Open overlay */
    const open = () => {
      labelEl.textContent = p.context;
      titleEl.textContent = p.title;
      metaEl.textContent  = p.tags.join(' · ');
      bodyEl.innerHTML    = p.body;
      overlay.setAttribute('aria-hidden', 'false');
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      overlay.scrollTop = 0;
      backBtn.focus();
    };

    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  /* Close overlay */
  const close = () => {
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  backBtn.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  /* Scroll cue fade */
  const cue = document.querySelector('.scroll-cue');
  if (cue) {
    window.addEventListener('scroll', () => {
      cue.style.opacity = window.scrollY > 60 ? '0' : '1';
    }, { passive: true });
  }

})();