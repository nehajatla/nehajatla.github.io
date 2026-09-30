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
    image:   'work/metlife/metlife.png',
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
    title:   'Rewriting the Code',
    role:    'SWE & Data Analytics Intern',
    desc:    'Software engineering and data analytics with Rewriting the Code.',
    color:   '#C9AFCC',
    image:   'work/rtc/RTC-poster.jpg',
    hoverImage: 'work/rtc/RTC.gif',
    tall:    false,
    tags:    ['SWE', 'Data Analytics'],
    body: `
      <div class="case-meta">
        <div>
          <p class="case-meta-label">Role</p>
          <p>Software Engineering &amp; Data Analytics Intern</p>
        </div>
        <div>
          <p class="case-meta-label">Timeline</p>
          <p>June – December 2025</p>
        </div>
        <div>
          <p class="case-meta-label">Team</p>
          <p>Swadha Rai</p>
          <p>Rewriting the Code</p>
          <p>Reboot Representation</p>
        </div>
        <div>
          <p class="case-meta-label">Skills</p>
          <p>Python &amp; NLP</p>
          <p>Tableau</p>
          <p>Survey Analysis</p>
        </div>
      </div>

      <h3>How might a 40K+ member community turn its own data into decisions?</h3>
      <p>Rewriting the Code supports women in tech through community, data and advocacy. Over six months I worked on both ends of that data: the conversations happening in Slack, and the recruiting outcomes of the students in it.</p>

      <h3>The community was talking more than anyone could read...</h3>
      <p>RTC's Slack generated thousands of messages, and reporting ran on manual workflows. Staff couldn't sort what members needed fast enough to act on it.</p>
      <p>...and the recruiting data that mattered most didn't exist. Few studies break tech recruiting outcomes down by race and gender together. Without that evidence, it was hard to advocate for Black, Latina and Native American (BLNA) women in computing.</p>
      <p><em>Where in the pipeline do BLNA women fall behind — at the application, the interview, or the offer?</em></p>

      <h3>An NLP Slackbot that reads the community for you</h3>
      <p>I built and launched an AI-powered Python Slackbot that processed 2K+ community messages, then automated the reporting behind it with 10+ Tableau dashboards stakeholders use to make decisions.</p>

      <h3>The Reboot report: 549 students, three questions, five lenses</h3>
      <p>With Swadha Rai, I co-authored an 80-page study with Reboot Representation and ColorStack on the 2025 recruiting cycle.</p>
      <ol class="case-steps">
        <li><strong>Survey design</strong> — refined over multiple rounds to cover search strategy, technical prep and interview progression.</li>
        <li><strong>Sampling</strong> — stratified random sampling that oversampled BLNA students: 244 BLNA women, 208 BLNA men, 97 non-BLNA respondents.</li>
        <li><strong>Cleaning</strong> — validated eligibility, removed outliers, converted multi-select answers to binary indicators.</li>
        <li><strong>Analysis</strong> — every question cut by race, gender, graduation year, first-gen status and top-CS-program attendance.</li>
        <li><strong>Visualization</strong> — filterable Tableau dashboards for offers, application volume, selectiveness and interview stage.</li>
      </ol>

      <h3>Read the report</h3>
      <p>A short preview — the cover and two pages from the 80-page study.</p>
      <div class="report-book" tabindex="0" aria-label="Report preview, use the arrows or left/right keys to flip pages">
        <div class="report-book-frame">
          <img class="report-book-page is-active" src="work/rtc/cover.png" alt="Report cover: Understanding Recruiting Experiences and Outcomes for BLNA Undergraduate Women in Tech, Reboot Representation x Rewriting the Code">
          <img class="report-book-page" src="work/rtc/page1.png" alt="Report page: application volume by top computer science program attendance">
          <img class="report-book-page" src="work/rtc/page2.png" alt="Report page: offer count by graduation year">
        </div>
        <div class="report-book-controls">
          <button class="report-book-prev" type="button" aria-label="Previous page">‹</button>
          <span class="report-book-counter">1 / 3</span>
          <button class="report-book-next" type="button" aria-label="Next page">›</button>
        </div>
        <div class="report-book-dots">
          <span class="report-book-dot is-active"></span>
          <span class="report-book-dot"></span>
          <span class="report-book-dot"></span>
        </div>
      </div>

      <h3>Five hiring insights, delivered to leadership</h3>
      <div class="case-stats">
        <div class="case-stat"><b>2K+</b><span>messages processed for a 40K+ member community</span></div>
        <div class="case-stat"><b>72%</b><span>increase in workflow efficiency</span></div>
        <div class="case-stat"><b>5+</b><span>hiring insights communicated to leadership</span></div>
      </div>
      <p>The report found BLNA women face barriers at several stages of the pipeline, not only at the offer.</p>
      <table class="case-compare">
        <thead><tr><th>Offers received</th><th>BLNA women</th><th>Non-BLNA women</th></tr></thead>
        <tbody>
          <tr><td>Zero</td><td class="hl">44%</td><td>33%</td></tr>
          <tr><td>One</td><td>32%</td><td>25%</td></tr>
          <tr><td>Two or more</td><td class="hl">24%</td><td>41%</td></tr>
          <tr><td>Mean offers</td><td class="hl">0.9</td><td>1.4</td></tr>
        </tbody>
      </table>
      <div class="case-confidential">
        <p>The full internal hiring report is confidential. Want more insights or to learn more? <a href="mailto:neha.jatla@duke.edu">Reach out to me directly</a>.</p>
      </div>
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
    video:   'work/legends/Legends.mp4',
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
