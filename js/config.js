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
        // Left and right are genuinely different drawn shapes (not a
        // mirrored copy of one), each with its own pupil position/size.
        left: {
          closed: 'assets/hero/eye-closed-left.png',
          openEmpty: 'assets/hero/eye-open-empty-left.png',
          // Pupil geometry read directly off the source vector's own
          // numbers (ellipse cx/cy/rx against the crop box), not
          // detected from a raster — exact, not approximated.
          pupilCenterFrac: { x: 0.6628, y: 0.537 },
          pupilRadiusFrac: 0.1717,
          // heightAspect = the SMALLER of this eye's closed/open aspect
          // ratios (2.378). eyes.js sizes both eyes to the SAME WIDTH
          // and derives each one's own box height as width/heightAspect
          // — using the smaller aspect guarantees object-fit:contain
          // is always width-constrained (fills the box's full width) in
          // BOTH states, so the drawn eye itself is the same visual
          // width as its sibling, not just the outer box. (Equal outer
          // boxes alone weren't enough: left's closed art nearly fills
          // its box at 2.378, but right's closed art — 1.369, a
          // genuinely more compact drawn shape — only filled ~55% of
          // an equally-sized box, reading as visibly smaller.)
          heightAspect: 2.378
        },
        right: {
          closed: 'assets/hero/eye-closed-right.png',
          openEmpty: 'assets/hero/eye-open-empty-right.png',
          pupilCenterFrac: { x: 0.6354, y: 0.4035 },
          pupilRadiusFrac: 0.1747,
          heightAspect: 1.369
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
      pupilEase: 0.18,
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
      // see #hand-wrap in hero.css) and an upward nudge relative to the
      // text baseline. Applied as CSS custom properties at init.
      scale: 1.3,      // 1.3 = 30% bigger
      offsetY: 12       // px, shifts the whole hand box upward
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
