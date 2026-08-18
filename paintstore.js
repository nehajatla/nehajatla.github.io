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
   hoverImage  optional — an animated file (gif) shown only while the
               card is hovered; `image` stays as the static poster frame
               the rest of the time, so the animation doesn't autoplay
   tall     true = portrait aspect ratio (phone mockups etc)
   wide     true = landscape 16:9 aspect ratio
   logo     true = image is a brand mark, not a photo — shown small and
            contained on a plain white field instead of covering the card
   tags     discipline tags shown in case study header
   body     HTML for full case study body
================================================================ */

const PROJECTS = [

  /* 01 — MetLife */
  {
    id:      'metlife',
    context: 'METLIFE - 2024',
    title:   'MetLife',
    desc:    'AI product strategy and design for an enterprise LLM platform.',
    color:   '#AEC0D6',
    image:   'work/metlife.png',
    logo:    true,
    tall:    false,
    big:     true,
    tags:    ['AI', 'Product Strategy', 'Design'],
    body: `
      <p><strong>Role:</strong> AI Product Strategy & Design Intern</p>

      <p><strong>Work:</strong> Designing an end to end AI video generation product from scratch as part of MetLife's enterprise LLM platform, making real decisions about user flow, interaction patterns, and interface clarity under actual production constraints.</p>

      <p><em>More details can be accessed upon request.</em></p>
    `
  },

  /* 02 — Cognition Brand & Product Design */
  {
    id:      'cognition',
    context: 'COGNITION - AUG 2025 TO JAN 2026',
    title:   'Cognition: Brand & Product Design',
    desc:    'Brand identity and UI/UX for a neurotech BCI startup.',
    color:   '#5B5D63',
    image:   '',
    tall:    false,
    big:     true,
    tags:    ['Product Design', 'Brand', 'UX'],
    body: `
      <div class="case-col">
        <p><strong>Team:</strong> Product Design (me), Joseph Ayinde (Co-Founder & CEO), and other founding team members<br>
        <strong>Role:</strong> Product Design Intern</p>

        <p>As Product Design Intern at Cognition, an early stage neurotechnology startup building personalized brain computer interfaces, I worked directly with Joseph Ayinde, Co-Founder & CEO, and the founding team to develop new design ideas and iterations, translating complex EEG signal data into intuitive UI and UX flows during a formative period for the company's visual identity.</p>

        <h3>Logo & Brand</h3>
        <p>Working with an early stage company meant starting from a blank slate rather than an existing system. In sessions with Joseph and the team, I explored several logo directions, ranging from more literal neural or wave inspired marks to simpler geometric forms, before the team converged on a minimal, monochromatic identity. The black and white palette was chosen deliberately to keep the brand feeling clinical, trustworthy, and precise, qualities that mattered for a product dealing with sensitive biometric data.</p>

        <h3>Brand Guidelines</h3>
        <p>Given the startup's early phase, guidelines were still informal rather than a fully documented system. Conversations with Joseph functioned as a lightweight internal guide covering logo usage, spacing, and how strictly to hold to the black and white constraint, meant primarily to keep design decisions consistent as the founding team moved quickly across features.</p>
      </div>

      <div class="case-col">
        <h3>Typography</h3>
        <p>The typography leaned toward a clean, geometric sans serif, something neutral enough to let the black and white palette carry visual weight without competing for attention. This fit a product built around trust and clarity, where data legibility mattered more than personality in the type choice.</p>

        <h3>Website & Mobile</h3>
        <p>I designed UI and UX flows that made raw EEG signal data legible within a strict black and white system, tackling information hierarchy challenges specific to a product where the underlying data is invisible by default. Without color available as a signal for alerts, trends, or data states, I relied on contrast, weight, and spacing, using shading and line weight variation to distinguish signal strength or session status instead of a color coded system.</p>

        <h3>Process</h3>
        <ul>
          <li><strong>Discovery:</strong> meeting with Joseph and the team to understand the product vision and the desired brand feel</li>
          <li><strong>Exploration:</strong> concepting several logo and visual directions within a monochromatic black and white constraint</li>
          <li><strong>Refinement:</strong> narrowing directions through feedback loops with Joseph and the founding team</li>
          <li><strong>Systemization:</strong> establishing lightweight internal rules for logo usage and spacing to keep the system consistent as the team moved quickly</li>
          <li><strong>Application:</strong> extending the monochromatic system into UI flows for visualizing EEG signal data across web and mobile</li>
        </ul>
      </div>

      <h3>Brand Guidelines (Figma)</h3>
      <div class="case-embed full-bleed">
        <iframe src="https://embed.figma.com/design/rBHWMZ88aoCs960yApReYo/Cognition-Brand-Guidelines--WIP-?node-id=0-1&embed-host=share" allowfullscreen></iframe>
      </div>
    `
  },

  /* 03 — RTC SWE + Data Analytics */
  {
    id:      'rtc',
    context: 'REWRITING THE CODE - 2023',
    title:   'RTC: SWE & Data Analytics',
    desc:    'Software engineering and data analytics with Rewriting the Code.',
    color:   '#C9AFCC',
    image:   'work/RTC-poster.jpg',
    hoverImage: 'work/RTC.gif',
    tall:    false,
    tags:    ['SWE', 'Data Analytics'],
    body: `
      <p>Coming soon: thumbnail and case study in progress.</p>
    `
  },

  /* 04 — Legends */
  {
    id:      'legends',
    context: 'LEGENDS - 2024',
    title:   'Legends',
    desc:    'Coming soon.',
    color:   '#D9C6A0',
    image:   '',
    tall:    false,
    wide:    true,
    tags:    ['Coming Soon'],
    body: `
      <p>Coming soon: thumbnail and case study in progress.</p>
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
      p.big        ? 'work-card--big'    : '',
      p.wide       ? 'work-card--wide'   : '',
    ].filter(Boolean).join(' ');

    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open: ${p.title}`);

    /* Thumbnail */
    const thumb = document.createElement('div');
    thumb.className = 'card-thumb' + (p.logo ? ' card-thumb--logo' : '');
    thumb.style.background = p.logo ? '#fff' : p.color;

    if (p.image) {
      const img = document.createElement('img');
      img.src     = p.image;
      img.alt     = p.title;
      img.loading = 'lazy';
      thumb.appendChild(img);

      /* hoverImage (e.g. an animated gif) only plays while hovered — a
         gif starts animating the moment its src loads, so swapping to
         the poster src on mouseleave is what actually "pauses" it. */
      if (p.hoverImage) {
        thumb.addEventListener('mouseenter', () => { img.src = p.hoverImage; });
        thumb.addEventListener('mouseleave', () => { img.src = p.image; });
      }
    } else {
      /* No real image yet — a simple centered outline standing in for
         the mockup, so the grid still reads as "a piece with visual
         content coming" rather than a flat swatch. */
      const placeholder = document.createElement('div');
      placeholder.className = 'card-thumb-placeholder';
      thumb.appendChild(placeholder);
    }

    /* Caption — overlaid as a label on top of the picture, not stacked
       below it, so the image can run full-bleed and bigger. */
    const caption = document.createElement('div');
    caption.className = 'card-caption';
    caption.innerHTML = `
      <p class="card-context">${p.context}</p>
      <h3 class="card-title">${p.title}</h3>
      <p class="card-desc">${p.desc}</p>
    `;
    thumb.appendChild(caption);

    card.appendChild(thumb);
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