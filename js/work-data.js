/* ================================================================
   work-data.js — Selected Work project data. Ported forward
   unchanged from the previous site's paintstore.js (same projects,
   same copy) — only the render engine moved out, into
   work-render.js (work.html) and home-preview.js (index.html).

   FIELDS
   ──────
   id       unique slug
   context  small caps label: "WHERE · WHEN"
   title    project name
   role     real role/title held on the project (shown under the
            thumbnail on the work-timeline strip — see work-timeline.js);
            sourced from each project's own body text / about.html,
            never invented
   desc     one-line description
   color    bold placeholder bg color (shown until a real image is set)
   image    path to thumbnail — "" for none yet
   hoverImage  optional animated file (gif) shown only while hovered
   embed    optional live iframe URL shown as the thumbnail
   video    optional .mp4 shown as the thumbnail, hover-to-play
   tall     true = portrait aspect ratio
   wide     true = landscape 16:9 aspect ratio
   big      true = larger square thumbnail
   logo     true = image is a brand mark, shown small + contained
   tags     discipline tags shown in the case-study header
   body     HTML for the full case study body (work.html only)
   ================================================================ */
const PROJECTS = [
  {
    id:      'metlife',
    context: 'METLIFE - 2026',
    title:   'MetLife',
    role:    'AI Product Strategy & Design Intern',
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
  {
    id:      'cognition',
    context: 'COGNITION - 2025',
    title:   'Cognition: Brand & Product Design',
    role:    'Product Design Intern',
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
  {
    id:      'rtc',
    context: 'REWRITING THE CODE - 2025',
    title:   'RTC: SWE & Data Analytics',
    role:    'SWE & Data Analytics Intern',
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
  {
    id:      'duke-ai-health',
    context: 'DUKE AI HEALTH - 2025',
    title:   'Duke AI Health',
    role:    'Product Research & Engineering Intern',
    desc:    'Coming soon.',
    color:   '#B7D3C4',
    image:   '',
    tall:    false,
    tags:    ['Product Research', 'Engineering'],
    body: `
      <p>Coming soon: thumbnail and case study in progress.</p>
    `
  },
  {
    id:      'duke-eatz',
    context: 'DUKE EATZ - 2025',
    title:   'Duke Eatz',
    role:    '',
    desc:    'Coming soon.',
    color:   '#F0C9B8',
    image:   '',
    tall:    false,
    tags:    ['Coming Soon'],
    body: `
      <p>Coming soon: thumbnail and case study in progress.</p>
    `
  },
  {
    id:      'legends',
    context: 'LEGENDS - 2026',
    title:   'Legends',
    role:    'Media & Design Chair',
    desc:    'Coming soon.',
    color:   '#D9C6A0',
    image:   '',
    video:   'work/Legends.mp4',
    tall:    false,
    wide:    true,
    tags:    ['Coming Soon'],
    body: `
      <p>Coming soon: thumbnail and case study in progress.</p>
    `
  }
];

/* ================================================================
   PROJECT_TIMELINE_ORDER — single source of truth for real
   chronological order + year, as given directly by the user (not
   re-derived from `context` strings, which aren't all month-precise).
   Used by both work-timeline.js (the full work.html timeline) and
   home-preview.js (the home page's "Selected Work" teaser), so the
   home page always shows the same real projects, in the same real
   order, as the actual work page.
   ================================================================ */
const PROJECT_TIMELINE_ORDER = [
  { id: 'rtc',            year: 2025 },
  { id: 'duke-ai-health', year: 2025 },
  { id: 'cognition',      year: 2025 },
  { id: 'duke-eatz',      year: 2025 },
  { id: 'metlife',        year: 2026 },
  { id: 'legends',        year: 2026 }
];
