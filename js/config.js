/* ================================================================
   config.js — every tunable value for the hero effects, eye/hand
   illustration interactions, and custom cursor, in one place. Loaded
   before hero-effects.js / eyes.js / hand.js / cursor.js, which read
   from window.SITE_CONFIG.

   Halftone/ASCII grid constants + the 5-phase timeline are carried
   over unchanged from hero-prototype.html (already tuned there —
   see that file's own header comment).
   ================================================================ */
window.SITE_CONFIG = {
  hero: {
    padding: 30,
    timing: { dissolve: 150, flash: 400, shrink: 200, ripple: 500, resolve: 250 },
    light: { x: -1, y: -1 },

    halftone: {
      spacing: 3,
      maxStrokeRadius: 4.2,
      sizeScale: [0.16, 0.34, 0.52, 0.74, 1.0],
      maxDotRadius: 2.35,
      coreTiers: [3, 4],
      highlightTierMin: 1,
      highlightThreshold: 0.35,
      coverageStep: 2
    },

    ascii: {
      cell: 5,
      sizeScale: [8, 12, 18],
      thickThreshold: 3.0,
      midThreshold: 1.4,
      charset: '0123456789+−×÷=<>(){}[];∑∫πΔλ√∞ƒ'.split(''),
      fragments: ['f(x)=', '∑i', 'Δt', '2π', '√n', 'λ=0.5', '∫dx'],
      minFragmentRun: 4,
      highlightThreshold: 0.35,
      coverageStep: 2
    },

    ripple: { speedPxPerSec: 1500, frontWidth: 46 },

    assets: {
      eye: {
        // Single eye now (the right-eye variant was removed) — kept
        // under the "left" key since eyes.js/hero.css key off
        // data-eye="left" and CONFIG.assets.eye.left.
        left: {
          closed: 'assets/hero/eye-closed-left.png',
          openEmpty: 'assets/hero/eye-open-empty-left.png',
          // Both assets are rendered straight from the same source
          // vector sheet (MacBook Air - 10.svg: one pod+lash group for
          // open, one crease+lash group for closed) and the closed art
          // is then fit (contain, centered, transparent pad) onto a
          // canvas of the OPEN eye's exact pixel dimensions — so the
          // two PNGs are pixel-dimension-identical and heightAspect
          // below is shared by both states: the box never resizes or
          // shifts position when the eye blinks.
          pupilCenterFrac: { x: 0.6848, y: 0.5732 },
          pupilRadiusFrac: 0.1739,
          // Pod outline's own bounding box (excluding lashes), as a
          // fraction of the shared crop. eyes.js inscribes an ELLIPSE
          // in this rect and clamps pupil travel to that ellipse (not
          // the rect itself) so it can't cross the almond-shaped
          // outline — a rectangular clamp would let it reach the
          // rect's corners, which sit outside the pod's pointed tips.
          podBoundsFrac: { left: 0.0458, top: 0.2352, right: 1.0, bottom: 1.0 },
          heightAspect: 1.7293
        },
        pupilColor: '#4B8AFF'
      },
      hand: {
        rest: 'assets/hero/hand-rest.png',
        waveFrames: [
          'assets/hero/hand-wave-01.png',
          'assets/hero/hand-wave-02.png',
          'assets/hero/hand-wave-03.png',
          'assets/hero/hand-wave-04.png'
        ]
      }
    },

    eye: {
      hoverPadding: 24,
      openDuration: 250,
      // Upper bound on the SHARED gaze vector before each eye clamps it
      // to its own safe margin (see marginsFor in eyes.js) — this can
      // be generous since the per-eye clamp is what actually keeps
      // pupils inside their own outline.
      pupilMaxRadius: 18,
      // Lower = slower/smoother lerp toward the target each frame,
      // trading a little responsiveness for a less jittery, more fluid
      // motion.
      pupilEase: 0.1,
      touchOpenHold: 2200
    },

    hand: {
      // Rotation waypoints (degrees) for one wave cycle, tweened smoothly
      // between them (see js/hand.js) rather than stepped like before.
      angles: [0, -16, 10, -8, 4, 0],
      cycleDuration: 1400,   // ms for one full wave cycle
      pauseDuration: 350,    // ms held at rest between cycles
      returnDuration: 350,   // ms to ease back to rest on leave
      pivotFrac: { x: 0.50, y: 0.60 }, // wrist pivot, fraction of hand-rest.png
      touchCycles: 2,
      // Overall size (arm + palm scale together, box grows uniformly —
      // see #hand-wrap in hero.css) and a nudge relative to the text
      // baseline. Applied as CSS custom properties at init.
      scale: 1.3,      // 1.3 = 30% bigger
      offsetX: -22,     // px, shifts the whole hand box left (unchanged)
      offsetY: 60       // px, shifts the whole hand box upward
    }
  },

  cursor: {
    size: 11,
    hoverSize: 27,
    pressSize: 7,
    ease: 0.6,
    // .timeline-card is included explicitly because the "next stop:
    // singapore" card has no href (case study opens later) and is
    // rendered as a plain <div>, not an <a> — it wouldn't otherwise
    // match any other part of this selector.
    hoverSelector: 'a, button, [role="button"], .word, .glyph-img, input[type="checkbox"], .work-card, .preview-card, .timeline-card, [tabindex]'
  }
};
