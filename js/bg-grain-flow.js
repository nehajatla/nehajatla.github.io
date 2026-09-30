/* ================================================================
   bg-grain-flow.js — WebGL ambient background: a soft grainy circle
   of pastel static (yellow/pink/blue) drifting on white. Renders into
   any <canvas class="bg-grain-flow"> found on the page, sized to that
   canvas's own box (not the viewport) via ResizeObserver, so it works
   inside a .bg-field that only covers one section. Requires three.js
   to be loaded first (see the <script> tag before this one).
   ================================================================ */
(function () {
  'use strict';
  const canvases = document.querySelectorAll('.bg-grain-flow');
  if (!canvases.length || !window.THREE) return;

  const VERT = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2  uRes;

    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i),              hash(i + vec2(1, 0)), u.x),
                 mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
      for (int i = 0; i < 4; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
      return v;
    }

    void main() {
      float aspect = uRes.x / uRes.y;
      vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
      float t = uTime * 0.08;

      vec2 c = vec2(0.22 * aspect * 0.5, 0.0)
             + 0.06 * vec2(sin(t * 1.3), cos(t * 1.1));
      float radius = 0.62 + 0.03 * sin(t * 1.7);

      float d = length(p - c) / radius;
      d += (fbm(p * 2.0 + t) - 0.5) * 0.12;
      float density = 1.0 - smoothstep(0.15, 1.0, d);

      vec2 fc = gl_FragCoord.xy;
      float frame = floor(uTime * 24.0);
      float dots = step(hash(fc + vec2(frame * 37.0, frame * 17.0)), density * 0.9);
      float amt = mix(density * 0.3, dots, 0.8);

      vec3 cYellow = vec3(1.000, 0.914, 0.608);
      vec3 cPink   = vec3(0.827, 0.584, 0.882);
      vec3 cBlue   = vec3(0.294, 0.541, 1.000);
      vec2 rp = p - c;
      vec2 w = vec2(fbm(rp * 1.2 + vec2(t * 0.9, 0.0)), fbm(rp * 1.2 + vec2(4.7, -t * 0.8)));
      vec2 fp = rp * 1.6 + (w - 0.5) * 1.1;

      float fY = fbm(fp + vec2( 1.7,  9.2) + vec2( t * 0.7,  t * 0.2));
      float fP = fbm(fp + vec2( 8.3,  2.8) + vec2(-t * 0.5,  t * 0.6));
      float fB = fbm(fp + vec2(-4.1,  6.5) + vec2( t * 0.3, -t * 0.7));
      float fW = fbm(fp + vec2( 5.9, -3.3) + vec2(-t * 0.6, -t * 0.3));
      float wY = pow(fY, 7.0) * 1.4;
      float wP = pow(fP, 7.0) * 1.5;
      float wB = pow(fB, 7.0) * 0.6;
      float wW = pow(fW, 7.0) * 0.9;
      vec3 tint = (cYellow * wY + cPink * wP + cBlue * wB + vec3(1.0) * wW)
                / (wY + wP + wB + wW);
      tint = mix(tint, vec3(1.0), 0.25);

      vec3 col = mix(vec3(1.0), tint, amt * 0.9);
      col -= (hash(fc + fract(uTime * 7.13) * 100.0) - 0.5) * 0.02;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  canvases.forEach((canvas) => {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } };
    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      renderer.setSize(rect.width, rect.height, false);
      renderer.getDrawingBufferSize(uniforms.uRes.value);
    }
    resize();
    if (window.ResizeObserver) {
      new ResizeObserver(resize).observe(canvas);
    } else {
      window.addEventListener('resize', resize);
    }

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      uniforms.uTime.value += reduced ? dt * 0.2 : dt;
      renderer.render(scene, camera);
    });
  });
})();
