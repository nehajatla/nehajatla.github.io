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
   contain  true = show the whole image (no crop) on the color bg
   tags     discipline tags shown in the case-study header
   body     HTML for the full case study body (work.html only)
   ================================================================ */
const PROJECTS = [
  {
    id:      'lovable',
    context: 'LOVABLE - 2026',
    title:   'Lovable',
    role:    'Product Designer & Product Manager',
    desc:    'Smart Preview: see it before you spend it.',
    color:   '#F4F1EE',
    image:   'work/lovable/lovable-cover.jpg',
    tall:    false,
    tags:    ['Product Management', 'Product Design', 'User Research'],
    body: `
      <div class="case-meta">
        <div>
          <p class="case-meta-label">Role</p>
          <p>Product Designer &amp; Product Manager</p>
        </div>
        <div>
          <p class="case-meta-label">Timeline</p>
          <p>January – May 2026</p>
        </div>
        <div>
          <p class="case-meta-label">Team</p>
          <p>Camila Acquarone</p>
          <p>Eileen Cai</p>
          <p>Lily Zheng</p>
        </div>
        <div>
          <p class="case-meta-label">Skills</p>
          <p>User Research</p>
          <p>Product Design</p>
          <p>Product Strategy</p>
        </div>
      </div>

      <h3>How might Lovable let people experiment freely without wasting credits?</h3>
      <p>Lovable turns a plain-language prompt into a working full-stack app in minutes. Our team of four studied where that experience breaks down for new, non-technical builders, and designed a feature to fix it.</p>

      <h3>46 evaluations, three lenses</h3>
      <p>We gathered 46 hands-on evaluations of Lovable from students, designers and developers, each structured around three frameworks:</p>
      <ol class="case-steps">
        <li><strong>Attribute scoring</strong>: rate user value, speed, usability, delight, quality, trust and more from 1 to 5, and explain the extremes.</li>
        <li><strong>Thinking strategy</strong>: what is the product trying to do, what do you see that says so, and what does that imply about its business?</li>
        <li><strong>Product priority</strong>: three things to evangelize, three to fix or add, and how both shape strategy.</li>
      </ol>

      <h3>Users love how fast Lovable builds...</h3>
      <p>People rated the product highly on the moments that make it magic.</p>
      <div class="case-scores">
        <div class="case-score"><b>4.8</b><span>User Value</span>idea to app in minutes</div>
        <div class="case-score"><b>4.1</b><span>Usability</span>intuitive, low barrier</div>
        <div class="case-score"><b>4.1</b><span>Delight</span>strong wow factor</div>
      </div>

      <h3>...but every attempt costs credits, even the wrong ones</h3>
      <p>Credit anxiety was the #1 cited frustration. Users spend credits on outputs they don't want, then spend more fixing bugs the AI created. One respondent said users <em>burn a lot of their credits trying to fix a bug that the system created.</em> Many quit or switch platforms before they see enough value to upgrade.</p>
      <p>The idea surfaced in the backlog answers too. One evaluator asked for a way to <em>undo the feature and receive credit back</em> when an output misses.</p>
      <div class="case-scores">
        <div class="case-score"><b>3.2</b><span>Trust</span>unsure outputs are correct</div>
        <div class="case-score"><b>3.8</b><span>Clarity</span>unclear what changed</div>
      </div>

      <h3>Who feels it most</h3>
      <p>Non-technical creators like PMs, designers and small teams prototyping early ideas, and especially first-time users on the free plan. They are the most sensitive to credit usage because they are still learning how the product works, and they are the users Lovable most needs to convert.</p>
      <p><em>What if the AI showed its work before it charged for it?</em></p>

      <h3>Vibe coding is under two years old and already crowded</h3>
      <div class="case-cards">
        <div class="case-card"><h4>What it is</h4><ul><li>Natural-language interface</li><li>No coding required</li><li>Real, full-stack output, not just mockups</li></ul></div>
        <div class="case-card"><h4>Why now</h4><ul><li>Rise of the non-technical founder</li><li>Speed to first product</li><li>Remote, virtual building</li></ul></div>
        <div class="case-card"><h4>Who is building</h4><ul><li>Non-technical founders validating ideas</li><li>PMs and designers prototyping</li><li>Students and early-career builders</li><li>Small teams wearing many hats</li></ul></div>
        <div class="case-card"><h4>The stakes</h4><ul><li>User expectations are being set right now</li><li>Whoever builds the best experience wins loyalty early</li></ul></div>
      </div>

      <h3>Competitive map</h3>
      <figure>
        <div class="case-frame case-frame--pad"><img style="max-width:720px;margin:0 auto" src="work/lovable/lovable-competitive-map.jpg" alt="2x2 map of team collaboration depth versus non-technical accessibility: Replit high collaboration low accessibility, Cursor low on both, Bolt and Lovable today high accessibility low collaboration, Lovable target high on both"></div>
        <figcaption>Competitive analysis: team collaboration depth vs. non-technical accessibility. <a href="work/lovable/lovable-competitive-analysis.png" target="_blank" rel="noopener">View the full analysis &rarr;</a></figcaption>
      </figure>
      <p>The competitive matrix maps vibe coding platforms across how accessible they are to non-technical users, and how they support team collaboration. Cursor sits in the bottom-left and it's a developer-first IDE with minimal accessibility and no meaningful collaboration, making it irrelevant to Lovable's core audience. Bolt is Lovable's most direct competitor today, scoring high on accessibility and closely mirroring the current solo prototyping experience, but it has no role-based access and weak collaboration features. Replit is the most strategically relevant competitor for CBI specifically, as it has real multiplayer editing and sits higher on the collaboration axis than the others, but its steep learning curve keeps it in the technical-user lane and far from the PM and founder use case.</p>
      <p>The dashed arrow on the matrix shows Lovable's proposed move with CBI. The goal is not to sacrifice accessibility, which is the core product advantage, but to layer deep team collaboration on top of it without slowing the solo experience down. No competitor currently occupies the top-right quadrant where high accessibility meets high collaboration. If CBI executes well, Lovable moves into that space and creates a category of its own: the go-to platform for non-technical teams who need to build fast, debug confidently, and hand off cleanly together.</p>

      <h3>Transparency standards</h3>
      <figure>
        <div class="case-frame"><img src="work/lovable/lovable-standards.jpg" alt="Credit and transparency standards: Cursor shows diffs before applying, GitHub Copilot suggests inline, Midjourney generates four variations before upscaling, Figma edits non-destructively"></div>
        <figcaption>Leading AI tools already let users see a change before paying for it.</figcaption>
      </figure>

      <h3>SWOT snapshot</h3>
      <div class="case-cards">
        <div class="case-card"><h4>Strengths</h4><ul><li>Idea to working app in under 5 minutes</li><li>Natural language removes the coding barrier</li><li>Full-stack output: frontend, backend, database, auth</li><li>High delight on first use drives word of mouth</li><li>GitHub sync and exportable code</li></ul></div>
        <div class="case-card is-muted"><h4>Weaknesses</h4><ul><li>Credit anxiety blocks iteration</li><li>Trust deficit on data, privacy and code provenance</li><li>Black-box debugging for non-technical users</li><li>Weak onboarding; credits run out before value lands</li><li>Outputs can feel AI-generic</li></ul></div>
        <div class="case-card"><h4>Opportunities</h4><ul><li>Team collaboration whitespace</li><li>Student and academic market</li><li>Figma import as the design-to-code bridge</li><li>Mobile app generation</li><li>Prompt-quality tooling and guided iteration</li></ul></div>
        <div class="case-card is-muted"><h4>Threats</h4><ul><li>Commoditization: Bolt, Cursor, Base44, V0, Replit</li><li>Foundation models adding in-platform app building</li><li>Replit closing the accessibility gap</li><li>Credit model limits virality</li><li>AI quality plateau</li></ul></div>
      </div>

      <h3>Smart Preview: see what the AI will change before paying for it</h3>
      <p>Smart Preview adds a preview step before any credits are spent. Users see what Lovable understood, what it will change and what it will cost, then refine for free or apply when they're satisfied.</p>
      <div class="case-cards">
        <div class="case-card"><h4>Visual preview</h4><p>Side-by-side before and after, as a faster, cheaper partial render</p></div>
        <div class="case-card"><h4>Change summary</h4><p>Plain-language explanation of what the AI will modify</p></div>
        <div class="case-card"><h4>Credit estimate</h4><p>Upfront cost shown before committing any credits</p></div>
        <div class="case-card"><h4>Prompt refine</h4><p>Edit the prompt and re-preview at no cost</p></div>
      </div>
      <p class="case-ethos">Users should feel confident, not anxious, when they build. The AI should show its work before it charges for it.</p>

      <figure>
        <div class="case-frame"><img src="work/lovable/lovable-preview-visual.jpg" alt="Preview Visual mockup slide: Smart Preview Details and Preview cards, and the Lovable editor showing a dark-mode change in preview mode"></div>
        <figcaption>Mockup of Smart Preview. Left: a breakdown of what the AI will change. Right: a visual before and after.</figcaption>
      </figure>

      <figure>
        <div class="case-frame"><img src="work/lovable/lovable-preview-desktop.png" alt="Smart Preview in the Lovable editor: a Smart Preview Ready card for 12 credits beside the app preview labeled Preview Mode, no credits spent"></div>
        <figcaption>In the editor: the app previews the change while the banner confirms no credits have been spent.</figcaption>
      </figure>

      <h3>Goals and non-goals</h3>
      <div class="case-cards">
        <div class="case-card"><h4>Goals</h4><ul><li>Increase user confidence before spending credits</li><li>Encourage more iteration and exploration</li><li>Improve satisfaction with the platform and the credit system</li><li>Increase free-to-paid conversion by showing value before credits run out</li></ul></div>
        <div class="case-card is-muted"><h4>Non-goals</h4><ul><li>Removing or replacing the credit system</li><li>Showing the full result; the preview stays limited so it can't be used to bypass credits</li><li>Fixing underlying prompt accuracy</li></ul></div>
      </div>

      <h3>Epic: credit-confident AI generation</h3>
      <p>Goal: users see what changes the AI will make before officially spending credits.</p>
      <div class="case-story">
        <p class="case-meta-label">User story 1</p>
        <p class="case-story-as">As a free-plan Lovable user, I want to see a lightweight preview of AI-generated changes before spending any credits, so that I can verify the AI understood my prompt and avoid wasting credits.</p>
        <div class="case-story-cols">
          <div><p class="case-meta-label">Acceptance criteria</p><ul><li>Preview generated with no credit deduction</li><li>Partial visual of proposed changes shown</li><li>AI change summary displayed alongside preview</li><li>Estimated credit cost shown before confirmation</li><li>Loading screen while the preview is created</li><li>User can cancel the preview at any time</li></ul></div>
          <div><p class="case-meta-label">Why it matters</p><ul><li>Addresses the most cited frustration: credit anxiety</li><li>Free-plan users currently pay for every generation with no way to validate output first</li></ul></div>
        </div>
      </div>
      <div class="case-story">
        <p class="case-meta-label">User story 2</p>
        <p class="case-story-as">As a Lovable user unsatisfied with a Smart Preview, I want to refine my prompt and regenerate the preview at no credit cost, so that I can iterate freely until I'm confident before committing.</p>
        <div class="case-story-cols">
          <div><p class="case-meta-label">Acceptance criteria</p><ul><li>Edit the prompt directly after previewing</li><li>Refined prompt regenerates the preview with no charge</li><li>New preview replaces the previous one</li><li>Credit estimate updates for the new generation</li><li>Clear &ldquo;Apply Changes&rdquo; once satisfied</li><li>Low-credit warning and upgrade prompt if credits are insufficient</li></ul></div>
          <div><p class="case-meta-label">Why it matters</p><ul><li>Directly supports more iteration and exploration</li><li>Covers the refine-prompt and low-credit flows</li><li>Closes the loop: preview, adjust, commit</li></ul></div>
        </div>
      </div>

      <h3>A three-phase experiment plan</h3>
      <div class="case-phases">
        <div class="case-phase"><p class="case-meta-label">Phase 1 · weeks 2–3</p><p>Text-based change preview and a confirmation step before credits are used</p></div>
        <div class="case-phase"><p class="case-meta-label">Phase 2 · weeks 4–6</p><p>Side-by-side visual comparison and credit cost estimate</p></div>
        <div class="case-phase"><p class="case-meta-label">Phase 3 · weeks 6–8</p><p>Tune preview fidelity so it satisfies without giving the output away; refine cost estimates</p></div>
      </div>

      <h3>Trade-offs, risks and open questions</h3>
      <div class="case-cards">
        <div class="case-card is-muted"><h4>Trade-offs &amp; risks</h4><ul><li>Previews may not perfectly match the final output</li><li>Users could overuse free previews</li><li>Users may delay committing, reducing short-term revenue</li><li>Preview generation adds compute cost</li></ul></div>
        <div class="case-card"><h4>Open questions</h4><ul><li>What preview fidelity satisfies users while still motivating them to commit?</li><li>Should previews be capped?</li><li>Long term, does this increase subscriptions?</li></ul></div>
      </div>

      <h3>Pitched to Lovable, and now being built</h3>
      <p>We delivered a full product brief (goals, non-goals, risks, SWOT) and presented Smart Preview to Sophia Nabil Gustafsson at Lovable. Lovable is currently implementing it, and we are working with them as it comes together. The feature targets Lovable's biggest growth lever: turning first-time users into paying customers before their free credits run out.</p>

      <a class="case-press" href="https://docs.google.com/presentation/d/1gBw7ada7fFtA_N1we55dxkuofPpvREvUWxOrzc9mAgM/present?slide=id.g3d4e54718ea_3_110" target="_blank" rel="noopener">
        <span class="case-press-label">Final presentation · Google Slides</span>
        <span class="case-press-title">Lovable Smart Preview</span>
        <span class="case-press-go">View the slides &rarr;</span>
      </a>
    `
  },
  {
    id:      'metlife',
    context: 'METLIFE - 2026',
    title:   'MetLife',
    role:    'Product Manager Intern',
    desc:    'A custom generative AI video avatar experience for MetIQ.',
    color:   '#AEC0D6',
    image:   'work/metlife/metlife.png',
    logo:    true,
    tall:    false,
    big:     true,
    tags:    ['Product Management', 'Generative AI', 'Enterprise'],
    body: `
      <div class="case-meta">
        <div>
          <p class="case-meta-label">Role</p>
          <p>Product Manager Intern</p>
        </div>
        <div>
          <p class="case-meta-label">Timeline</p>
          <p>June – August 2026</p>
        </div>
        <div>
          <p class="case-meta-label">Team</p>
          <p>MetIQ</p>
          <p>Azure AI</p>
        </div>
        <div>
          <p class="case-meta-label">Skills</p>
          <p>Product Roadmapping</p>
          <p>Generative AI</p>
          <p>Competitive Benchmarking</p>
        </div>
      </div>

      <figure>
        <div class="case-frame"><img src="work/metlife/neha-metlife.jpg" alt="Neha Jatla standing in front of a large MetLife sign"></div>
      </figure>

      <h3>Building generative AI video in-house for MetIQ</h3>
      <p>As a product manager intern, I helped MetLife build its own generative AI video avatar experience inside MetIQ, its enterprise AI platform. The in-house product replaces third-party vendor licensing that cost $7,500 per user, so clients get custom AI video without the vendor bill.</p>

      <h3>What I worked on</h3>
      <ol class="case-steps">
        <li><strong>Product roadmap</strong>: defined the roadmap for a custom AI avatar experience within MetIQ, replacing $7,500/user third-party licensing for clients.</li>
        <li><strong>Cross-functional delivery</strong>: drove the roadmap across Azure AI and MetIQ, aligning engineering teams to ship generative video for enterprise acquisition.</li>
        <li><strong>Competitive benchmarking</strong>: benchmarked avatar fidelity and produced competitive telemetry that shaped the enterprise-wide AI product roadmap.</li>
      </ol>

      <div class="case-confidential">
        <p>This work is confidential, so the details here stay high level. For materials and demo videos, <a href="about.html#contact">reach out to me directly</a>.</p>
      </div>
    `
  },
  {
    id:      'cognition',
    context: 'COGNITION - 2025',
    title:   'Cognition',
    role:    'Product Manager & Design Intern',
    desc:    'Making AI judgment inspectable, and easy to come back to.',
    color:   '#0B0B0B',
    image:   'work/cognition/cognition-cover.jpg',
    tall:    false,
    big:     true,
    tags:    ['Product Management', 'Product Design', 'Brand'],
    body: `
      <div class="case-meta">
        <div>
          <p class="case-meta-label">Role</p>
          <p>Product Manager &amp; Design Intern</p>
        </div>
        <div>
          <p class="case-meta-label">Timeline</p>
          <p>August 2025 – January 2026</p>
        </div>
        <div>
          <p class="case-meta-label">Team</p>
          <p>Cognition</p>
          <p>Chapel Hill, NC</p>
        </div>
        <div>
          <p class="case-meta-label">Skills</p>
          <p>Customer Discovery</p>
          <p>A/B Testing</p>
          <p>Product Requirements</p>
        </div>
      </div>

      <h3>How do you make an AI agent's reasoning feel intuitive, not intimidating?</h3>
      <p>Cognition is a governed intelligence platform that keeps the reasoning, evidence and approvals behind AI-assisted decisions accessible across sessions, tools and teams. I joined as a product manager and design intern ahead of launch.</p>
      <p>Cognition is built by The Learning and Memory Lab. <a href="https://www.lamlab.ai/" target="_blank" rel="noopener">Visit lamlab.ai &rarr;</a></p>

      <h3>Powerful model behavior is hard to see...</h3>
      <p>Cognition captures decisions, links evidence and carries context forward. But that behavior only helps if users can understand what the agent did and why.</p>
      <p>...and users who can't see it drop off. Early product data showed where users were leaving the experience. Before launch, the team needed to know which gaps mattered most and fix them first.</p>
      <p><em>What would make users trust the agent enough to come back?</em></p>

      <h3>Listening to 500+ developers before launch</h3>
      <p>I led customer discovery with 500+ developer users, synthesized their feedback into product gaps, and turned it into a prioritized list of fixes to de-risk launch.</p>

      <h3>Translating model behavior into product requirements</h3>
      <p>I defined product requirements and engineering priorities for Cognition's AI agent interfaces, turning complex model behavior into experiences users could follow and act on.</p>

      <h3>Finding and fixing the drop-off points</h3>
      <ol class="case-steps">
        <li><strong>Analyze</strong>: tracked product data across 500+ users to surface where people dropped off.</li>
        <li><strong>Test</strong>: ran A/B tests on redesigns of those moments.</li>
        <li><strong>Ship</strong>: rolled out the winning redesign and kept optimizing the weakest steps.</li>
      </ol>

      <h3>A brand built on judgment, not hype</h3>
      <p>I designed Cognition's brand guidelines in Figma: a living system for a product still taking shape, covering its values, logomark, logotype, color and typography.</p>

      <figure>
        <div class="case-frame"><img src="work/cognition/cognition-brand.jpg" alt="Cognition Brand Guidelines cover: white brain-and-dots logomark above the COGNITION wordmark on a dark background"></div>
      </figure>

      <figure>
        <div class="case-frame"><img src="work/cognition/cognition-brand-values.jpg" alt="Brand values: human-gated trust, rigor over hype, compounding knowledge, friction-less integration"></div>
        <figcaption>Brand values</figcaption>
      </figure>

      <div class="case-pair">
        <figure>
          <div class="case-frame"><img src="work/cognition/cognition-brand-logomark.jpg" alt="Logomark: a butterfly drawn from concentric circles beside a brain built from dots"></div>
          <figcaption>Logomark: a butterfly of concentric circles paired with a dotted brain</figcaption>
        </figure>
        <figure>
          <div class="case-frame"><img src="work/cognition/cognition-brand-lockup.jpg" alt="Logo lockup with nature photography backgrounds: a forest and a desert at dusk beside the COGNITION wordmark"></div>
          <figcaption>Logo lockup and nature backgrounds</figcaption>
        </figure>
      </div>
      <p><a href="https://www.figma.com/design/rBHWMZ88aoCs960yApReYo/Cognition-Brand-Guidelines--WIP-?node-id=0-1" target="_blank" rel="noopener">View the full guidelines in Figma &rarr;</a></p>

      <h3>Higher retention and a de-risked launch</h3>
      <p>Redesigning the biggest drop-off points lifted retention by 41%, and turning discovery feedback into prioritized fixes meant the team launched with the most important gaps already closed.</p>
      <div class="case-stats">
        <div class="case-stat"><b>41%</b><span>lift in retention across 500+ users</span></div>
        <div class="case-stat"><b>500+</b><span>developer users in customer discovery</span></div>
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
      <p>A short preview: the cover and two pages from the 80-page study.</p>
      <div class="report-book" tabindex="0" aria-label="Report preview, use the arrows or left/right keys to flip pages">
        <div class="report-book-frame">
          <img class="report-book-page is-active" src="work/rtc/rtc-report-p1.png" alt="Report cover: Understanding Recruiting Experiences and Outcomes for BLNA Undergraduate Women in Tech, Reboot Representation x Rewriting the Code">
          <img class="report-book-page" src="work/rtc/rtc-report-p17.png" alt="Report page: offer count by graduation year">
          <img class="report-book-page" src="work/rtc/rtc-report-p21.png" alt="Report page: offer count by top computer science program attendance">
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
        <p>The full internal hiring report is confidential. Want more insights or to learn more? <a href="about.html#contact">Reach out to me directly</a>.</p>
      </div>
    `
  },
  {
    id:      'duke-cs-plus',
    context: 'DUKE CS+ - 2025',
    title:   'Duke CS+',
    role:    'Undergraduate Research Assistant',
    desc:    'A natural-language interface for electronic health records, built through Duke\'s CS+ summer research program.',
    color:   '#001A57',
    image:   'work/duke-cs-plus/duke-cs-logo.jpg',
    contain: true,
    tall:    false,
    tags:    ['Research', 'Product Design', 'LLM'],
    body: `
      <div class="case-meta">
        <div>
          <p class="case-meta-label">Role</p>
          <p>Undergraduate Research Assistant</p>
        </div>
        <div>
          <p class="case-meta-label">Timeline</p>
          <p>May – July 2025</p>
        </div>
        <div>
          <p class="case-meta-label">Team</p>
          <p>Amanda Guo</p>
          <p>Duke CS+ Program</p>
        </div>
        <div>
          <p class="case-meta-label">Skills</p>
          <p>Product Research</p>
          <p>Product Design</p>
          <p>LLM Prompting</p>
        </div>
      </div>

      <figure>
        <div class="case-frame"><img src="work/duke-cs-plus/cs-plus-team.jpg" alt="Amanda Guo and Neha Jatla stand by their CS+ research poster"></div>
        <figcaption>Amanda Guo and me with our poster at the CS+ summer showcase. Photo: Duke Interdisciplinary Studies.</figcaption>
      </figure>

      <h3>How might clinicians surface insights from health records without writing SQL?</h3>
      <p>Through Duke's CS+ summer research program, Amanda Guo and I built an end-to-end AI application that works as a natural-language interface for electronic health records (EHR), mentored by Panyu Chen, Danyang Zhuo, Anru Zhang, Raymond Xiong and Carl Dong.</p>

      <h3>Healthcare researchers rely on EHRs for critical insights...</h3>
      <p>EHR databases like MIMIC hold diagnoses, ICU stays, labs and outcomes for thousands of patients, making them one of the richest sources for clinical research.</p>
      <p>...but many lack the expertise to query them. Writing complex SQL and building meaningful visualizations are both technical bottlenecks. That slows down data exploration and delays scientific discovery for the clinical staff who need the answers most.</p>
      <p><em>What if anyone could just ask the question?</em></p>

      <h3>From workflow research to product requirements</h3>
      <p>I studied how clinicians and researchers explore data today and translated their needs into requirements, then led product design of an LLM pipeline that turns plain language into SQL, visualizations and cohort-selection flowcharts.</p>

      <figure>
        <div class="case-frame case-frame--pad"><img src="work/duke-cs-plus/ehr-architecture.png" alt="System architecture: user prompt to LLM-predicted SQL, interactive SQL editor, database query, predicted visualization and feedback; prompt built from schema information, cell reference information and top-K similar few-shot demos"></div>
        <figcaption>System architecture. Each prompt combines schema information, real cell values and the most similar few-shot examples before it reaches the LLM.</figcaption>
      </figure>

      <h3>Ask, refine, visualize</h3>
      <p>Users pick a database and model, ask a question, and get SQL back. They can refine the query in plain English with the interactive SQL editor, chart the results, and send feedback that feeds error logging.</p>

      <figure>
        <div class="case-frame"><img src="work/duke-cs-plus/ehr-demo.png" alt="Product demo: natural-language query generates SQL, the SQL is edited with an added age filter, results render as a bar chart, and a feedback box appears below"></div>
        <figcaption>Live demo on the MIMIC-IV demo database: a cohort question becomes SQL, gets refined (&ldquo;at least 15 years old&rdquo;), and renders as a chart.</figcaption>
      </figure>

      <h3>Designing for flexibility</h3>
      <p>At our midsummer check-in, we added dropdowns so researchers could switch between MIMIC datasets and choose which LLM generates their query, alongside error messages and a feedback form.</p>

      <h3>Engineering the prompt, one component at a time</h3>
      <ol class="case-steps">
        <li><strong>Schema information</strong>: tables, columns and data types ground the model so it doesn't invent fields.</li>
        <li><strong>Cell reference information</strong>: real values (age: 72, diagnosis: &ldquo;sepsis&rdquo;) teach the model how to filter, so &ldquo;patients over 65 with sepsis&rdquo; becomes a valid query.</li>
        <li><strong>Top-K similar few-shot demos</strong>: the question-query pairs closest to the user's prompt, found by cosine similarity in embedding space.</li>
      </ol>

      <h3>30% more accurate queries, and a tool non-coders can use</h3>
      <div class="case-stats">
        <div class="case-stat"><b>30%</b><span>improvement in query accuracy from prompt experimentation</span></div>
        <div class="case-stat"><b>0.52</b><span>execution accuracy with the full prompt</span></div>
        <div class="case-stat"><b>3</b><span>outputs from one question: SQL, charts and cohort flowcharts</span></div>
      </div>

      <h3>Ablation study</h3>
      <p>An ablation study showed every prompt component matters. Removing few-shot demos cut execution accuracy by about two-thirds.</p>
      <table class="case-ablation">
        <tr class="is-full"><td>Full prompt</td><td><div class="bar-track" style="width:100%"></div></td><td>0.523</td></tr>
        <tr><td>Without cell reference</td><td><div class="bar-track" style="width:54%"></div></td><td>0.284</td></tr>
        <tr><td>Without schema information</td><td><div class="bar-track" style="width:48%"></div></td><td>0.249</td></tr>
        <tr><td>Without few-shot demos</td><td><div class="bar-track" style="width:35%"></div></td><td>0.182</td></tr>
      </table>

      <p>Next steps: build a clinical Text2SQL dataset from past research studies to benchmark against expert-written queries, and pilot the tool with the Duke Bioinformatics Department.</p>

      <h3>Poster</h3>
      <figure>
        <a class="case-frame" href="work/duke-cs-plus/ehr-poster.jpg" target="_blank" rel="noopener" style="display:block"><img src="work/duke-cs-plus/ehr-poster.jpg" alt="Final CS+ research poster: LLM-Powered Querying and Visualization of Electronic Health Records by Amanda Guo and Neha Jatla, with problem, solution, interface demonstration, design and future work sections"></a>
        <figcaption>Our final CS+ poster. Click to view full size.</figcaption>
      </figure>

      <a class="case-press" href="https://interdisciplinary.duke.edu/news/plus-programs-add-research-intensive-summer/" target="_blank" rel="noopener">
        <span class="case-press-label">Featured · Duke Interdisciplinary Studies · August 2025</span>
        <span class="case-press-title">&ldquo;Plus&rdquo; Programs Add Up to Research-Intensive Summer</span>
        <span class="case-press-go">Read the article &rarr;</span>
      </a>
    `
  },
  {
    id:      'duke-eatz',
    context: 'DUKE EATZ - 2025',
    title:   'DukeEatz',
    role:    'Product Lead',
    desc:    'Duke\'s first student-driven dining guide.',
    color:   '#2A4A6E',
    image:   'work/duke-eatz/dukeeatz-cover.jpg',
    tall:    false,
    tags:    ['Product Strategy', 'Full-Stack', 'Figma'],
    body: `
      <div class="case-meta">
        <div>
          <p class="case-meta-label">Role</p>
          <p>Product Lead</p>
        </div>
        <div>
          <p class="case-meta-label">Timeline</p>
          <p>August 2025 – March 2026</p>
        </div>
        <div>
          <p class="case-meta-label">Team</p>
          <p>Shravan Selvavel</p>
          <p>Abhinav Meduri</p>
          <p>Arnav Meduri</p>
          <p>Kashish Maheshwari</p>
        </div>
        <div>
          <p class="case-meta-label">Skills</p>
          <p>Product Strategy</p>
          <p>React, Flask, PostgreSQL</p>
          <p>Figma</p>
        </div>
      </div>

      <figure>
        <div class="case-frame"><img src="work/duke-eatz/dukeeatz-staff-pick.png" alt="Course staff announcement: Staff Choice Award winner, Open Project Option, DukeEatz by Abhinav Meduri, Arnav Meduri, Neha Jatla, Kashish Maheshwari and Shravan Selvavel"></div>
        <figcaption>The CS 316 staff announcing DukeEatz as a Staff Choice Award winner.</figcaption>
      </figure>

      <h3>Finding a good place to eat at Duke shouldn't be a daily scavenger hunt</h3>
      <p>Duke has dozens of dining options, yet most students rotate between the same few spots. For CS 316, our team of five built DukeEatz: one place to explore on-campus and Merchants-on-Points vendors, full menus with dietary tags, and real student reviews. I led product strategy for the platform.</p>

      <h3>The information exists...</h3>
      <p>Menu details, prices, dietary accommodations and which vendors take Food Points are all out there.</p>
      <p>...but it's scattered everywhere. Students piece it together from the Duke Dining website, Reddit, Google Reviews and word of mouth. None of these were built around a Duke student's needs.</p>

      <h3>Existing solutions</h3>
      <table class="case-compare">
        <thead><tr><th>Existing solution</th><th>Where it falls short</th></tr></thead>
        <tbody>
          <tr><td>Duke Mobile Ordering</td><td>Built for placing orders; no item-level reviews, fragmented dietary info, no off-campus eateries</td></tr>
          <tr><td>Duke Dining website</td><td>Static menus, rarely updated, minimal detail on Merchants-on-Points; no community feedback</td></tr>
          <tr><td>Net Nutrition</td><td>Static nutrition and allergen info, but no reviews or ratings</td></tr>
          <tr><td>Yelp, Google Reviews, Reddit</td><td>Not Duke-specific; no Food Points context or item-level detail for students</td></tr>
        </tbody>
      </table>
      <p><em>What if every Duke dining option lived in one place, rated by students?</em></p>

      <h3>Unifying 25+ campus vendors into one student-centered experience</h3>
      <p>I prioritized the features that matter in daily student life: dietary filters, reviews and vendor discovery.</p>
      <div class="case-cards">
        <div class="case-card"><h4>Search &amp; filters</h4><p>Browse vendors and menu items by cuisine, location, payment method (including Food Points) and dietary needs</p></div>
        <div class="case-card"><h4>Vendor pages</h4><p>Location, hours, contact info, accepted payments, cuisine tags and the full menu</p></div>
        <div class="case-card"><h4>Item-level reviews</h4><p>Rate and review individual dishes, not just vendors, with ratings that update live</p></div>
        <div class="case-card"><h4>Favorites &amp; profile</h4><p>Save favorite vendors and see your review history in one place</p></div>
        <div class="case-card"><h4>Trending items</h4><p>Surface what students are rating highly right now</p></div>
        <div class="case-card"><h4>Smarter browsing</h4><p>Partial-match search and open/closed status based on stored hours</p></div>
      </div>

      <h3>User flow</h3>
      <figure>
        <div class="case-frame case-frame--pad"><img style="max-width:560px;margin:0 auto" src="work/duke-eatz/dukeeatz-user-flow.png" alt="Website navigation and flow: browse vendors, open vendor and menu item pages, sign in to favorite or review, review validation and moderation, plus an admin moderation queue"></div>
        <figcaption>Website navigation and flow, from browsing to reviewing, plus the admin moderation path.</figcaption>
      </figure>

      <h3>Built on a three-tier stack</h3>
      <div class="case-cards">
        <div class="case-card"><h4>Frontend · React</h4><p>Component-based UI with reusable vendor cards, review forms and filter panels; React Router for navigation</p></div>
        <div class="case-card"><h4>Backend · Flask</h4><p>REST API for vendors, menus, reviews, favorites and profiles, with secure password hashing</p></div>
        <div class="case-card"><h4>Database · PostgreSQL</h4><p>Five relations (users, vendors, menu items, reviews, favorites) with JSONB for hours and nutrition data</p></div>
        <div class="case-card"><h4>Performance</h4><p>Benchmarked 33 queries across 9 categories; most run in under 1 millisecond</p></div>
      </div>

      <h3>See it in action</h3>
      <p>A full walkthrough of DukeEatz, from registering to browsing, filtering and reviewing.</p>
      <div class="case-embed">
        <iframe src="https://drive.google.com/file/d/13a-J9nvw5fHT5hNauBc1ZJbUUKp2-Fla/preview" title="DukeEatz demo video" allow="autoplay; fullscreen" loading="lazy" allowfullscreen></iframe>
      </div>

      <h3>Named a Staff Pick</h3>
      <div class="case-stats">
        <div class="case-stat"><b>25+</b><span>campus vendors in one platform</span></div>
        <div class="case-stat"><b>33</b><span>queries benchmarked, most under 1 ms</span></div>
        <div class="case-stat"><b>6</b><span>core features shipped and verified</span></div>
      </div>
      <p>Duke peers who tested DukeEatz said it fixes what existing platforms miss: dining info in one place, reviews at both the vendor and item level, and Duke-specific details like Food Points.</p>

      <h3>What's next</h3>
      <ol class="case-steps">
        <li><strong>Live menus</strong>: API integrations or a nightly scraper to keep menus current.</li>
        <li><strong>Wait times</strong>: estimate crowd levels from check-ins and review timestamps.</li>
        <li><strong>Personalized picks</strong>: collaborative filtering on review data to recommend vendors and dishes.</li>
        <li><strong>Food Points tracker</strong>: semester budgets with automated spending alerts.</li>
      </ol>

      <a class="case-press" href="https://github.com/shravan2453/DukeEatz" target="_blank" rel="noopener">
        <span class="case-press-label">Code · GitHub</span>
        <span class="case-press-title">DukeEatz repository</span>
        <span class="case-press-go">View on GitHub &rarr;</span>
      </a>
    `
  },
  {
    id:      'legends',
    context: 'LEGENDS - 2026',
    title:   'Legends',
    role:    'Media & Design Lead',
    desc:    'Telling the story of the biggest desi dance circuit.',
    color:   '#1A1020',
    image:   '',
    video:   'work/legends/Legends.mp4',
    tall:    false,
    wide:    true,
    tags:    ['Social Media Strategy', 'Visual Design', 'Event Operations'],
    body: `
      <div class="case-meta">
        <div>
          <p class="case-meta-label">Role</p>
          <p>Media &amp; Design Lead</p>
        </div>
        <div>
          <p class="case-meta-label">Timeline</p>
          <p>June 2026 – Present</p>
        </div>
        <div>
          <p class="case-meta-label">Team</p>
          <p>Legends Executive Board</p>
          <p>Remote</p>
        </div>
        <div>
          <p class="case-meta-label">Skills</p>
          <p>Social Media Strategy</p>
          <p>Visual Design</p>
          <p>Event Operations</p>
        </div>
      </div>

      <figure>
        <a class="case-frame" href="https://www.instagram.com/ddnlegends/" target="_blank" rel="noopener" style="display:block;max-width:620px;margin:0 auto;width:100%"><img src="work/legends/legends-instagram.jpg" alt="The @ddnlegends Instagram profile: Legends Dance Championship, 18.2K followers, with a grid of dark purple and red competition posts"></a>
        <figcaption style="text-align:center">@ddnlegends on Instagram. <a href="https://www.instagram.com/ddnlegends/" target="_blank" rel="noopener">View profile &rarr;</a></figcaption>
      </figure>

      <h3>How do you build one voice for 150+ teams and 30 competitions?</h3>
      <p>Legends is a national championship circuit for South Asian collegiate dance, independent of any single school. As Media &amp; Design Lead on the executive board, I help run the whole circuit rather than a single team, owning how Legends shows up online and keeping teams aligned behind the scenes.</p>

      <h3>The circuit is huge...</h3>
      <p>Each season spans 150+ collegiate teams, about 4,500 dancers and 30 competitions across the country.</p>
      <p>...and every team needs the same information at the same time. Timelines, requirements and judging criteria have to reach every team clearly, while the circuit's public presence has to stay consistent and keep audiences engaged all season.</p>
      <p><em>What if the circuit looked and felt like one brand, everywhere?</em></p>

      <h3>Owning Instagram and marketing strategy</h3>
      <p>I own Instagram and marketing strategy across the circuit: a cohesive dark, cinematic visual language for announcements, competition promos, team spotlights and recaps.</p>
      <figure>
        <div class="case-frame"><img src="work/legends/legends-row-teams.jpg" alt="Row of Legends competition posts: dancers on stage, team silhouettes, and promo graphics in purple and orange light"></div>
        <figcaption>Competition and team posts in the Legends visual style.</figcaption>
      </figure>

      <h3>Supporting Netflix's <em>The Best of the Best</em> premiere</h3>
      <p>I provided marketing support for the premiere of Netflix's documentary <em>The Best of the Best</em>, delivering Instagram performance reports and coordinating with the film's directors and producers.</p>
      <figure>
        <div class="case-frame"><img src="work/legends/legends-row-premiere.jpg" alt="Row of Legends posts: Best of the Best is out now, a Sway x Legends collaboration, DDN x Best of the Best premiere, a town hall announcement and directors announcement"></div>
        <figcaption>Premiere, partnership and circuit announcement posts.</figcaption>
      </figure>

      <h3>Keeping 4,500+ dancers aligned</h3>
      <p>Behind the feed, I coordinate logistics and communication across 150+ teams, aligning timelines and requirements circuit-wide, and partner with the judging panel on evaluation criteria and new dance initiatives.</p>

      <h3>More reach, more engagement, one circuit</h3>
      <div class="case-stats">
        <div class="case-stat"><b>150K+</b><span>views across the circuit's content</span></div>
        <div class="case-stat"><b>32%</b><span>lift in engagement rate</span></div>
        <div class="case-stat"><b>150+</b><span>teams and 4,500+ dancers coordinated</span></div>
      </div>

      <a class="case-press" href="https://www.instagram.com/ddnlegends/" target="_blank" rel="noopener">
        <span class="case-press-label">Instagram · @ddnlegends</span>
        <span class="case-press-title">Legends Dance Championship</span>
        <span class="case-press-go">See the feed &rarr;</span>
      </a>
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
  { id: 'duke-cs-plus',   year: 2025 },
  { id: 'cognition',      year: 2025 },
  { id: 'duke-eatz',      year: 2025 },
  { id: 'lovable',        year: 2026 },
  { id: 'metlife',        year: 2026 },
  { id: 'legends',        year: 2026 }
];
