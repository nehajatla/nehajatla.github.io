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
          // Pupil geometry read directly off the source vector's own
          // numbers (ellipse cx/cy/rx against the crop box), not
          // detected from a raster — exact, not approximated. The
          // open-eye crop now includes its lash strokes (previously
          // cropped to just the pod outline, which is why lashes were
          // missing on the open state), so this box is wider/taller
          // than before and these fractions moved with it.
          pupilCenterFrac: { x: 0.6805, y: 0.5709 },
          pupilRadiusFrac: 0.1706,
          // The pod outline's own bounding box, as a fraction of the
          // full (lash-inclusive) crop — eyes.js clamps pupil travel to
          // THIS box, not the full painted rect, since the crop now
          // extends past the pod to include the lash strokes above/
          // beside it and clamping to the outer image edge would let
          // the pupil visually cross the pod's own outline.
          podBoundsFrac: { left: 0.0501, top: 0.2378, right: 0.9932, bottom: 0.9883 },
          // heightAspect = the SMALLER of this eye's closed/open aspect
          // ratios. eyes.js sizes both eyes to the SAME WIDTH and
          // derives each one's own box height as width/heightAspect —
          // using the smaller aspect guarantees object-fit:contain is
          // always width-constrained (fills the box's full width) in
          // BOTH states, so the drawn eye itself is the same visual
          // width as its sibling, not just the outer box. Here the open
          // crop (1.7135, now including lash margin) is smaller than
          // the closed crop's own aspect (2.378), so it's the
          // constraining one.
          heightAspect: 1.7135
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
