/* ================================================================
   about.js — face-flip photo cycler. Ported forward unchanged from
   the previous site's about.html inline script: cycles
   assets/about/face-1.jpg .. face-4.jpg, all preloaded before the
   cycle starts so switching frames never flickers.
   ================================================================ */
(function () {
  'use strict';
  const el = document.getElementById('face-flip');
  if (!el) return;

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const FACE_FRAMES = [
    'assets/about/face-1.jpg',
    'assets/about/face-2.jpg',
    'assets/about/face-3.jpg',
    'assets/about/face-4.jpg'
  ];
  const FRAME_MS = 550;

  let loaded = 0;
  const imgs = FACE_FRAMES.map((src) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.style.opacity = '0';
    img.addEventListener('load', () => { loaded++; });
    el.appendChild(img);
    return img;
  });

  const start = () => {
    imgs[0].style.opacity = '1';
    if (REDUCED_MOTION) return; // single static pose, no cycling
    let i = 0;
    setInterval(() => {
      imgs[i].style.opacity = '0';
      i = (i + 1) % imgs.length;
      imgs[i].style.opacity = '1';
    }, FRAME_MS);
  };

  const waitTimer = setInterval(() => {
    if (loaded >= imgs.length) { clearInterval(waitTimer); start(); }
  }, 50);
})();
