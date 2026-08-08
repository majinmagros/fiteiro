import * as THREE from 'three';

THREE.Cache.enabled = true;

export const TAU = Math.PI * 2;

export function createRenderer(el, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  el.appendChild(renderer.domElement);
  fit(renderer, el);
  return renderer;
}

export function fit(renderer, el) {
  const w = el.clientWidth || window.innerWidth || 640;
  const h = el.clientHeight || 420;
  renderer.setSize(w, h, false);
}

export function resizeCamera(renderer, camera, el) {
  const w = el.clientWidth || window.innerWidth || 640;
  const h = el.clientHeight || 420;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

export function watchResize(renderer, camera, el) {
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => resizeCamera(renderer, camera, el));
    ro.observe(el);
    return () => ro.disconnect();
  }
  const onWin = () => resizeCamera(renderer, camera, el);
  window.addEventListener('resize', onWin);
  return () => window.removeEventListener('resize', onWin);
}

export function loadTexture(url) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        resolve(tex);
      },
      undefined,
      reject
    );
  });
}

export function loopWhenVisible(el, tick) {
  let running = false;
  function step() {
    if (!running) return;
    tick();
    requestAnimationFrame(step);
  }
  const start = () => { if (!running) { running = true; step(); } };
  const stop = () => { running = false; };
  if (typeof IntersectionObserver === 'undefined') { start(); return stop; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) (e.isIntersecting ? start : stop)();
  });
  io.observe(el);
  return () => { stop(); io.disconnect(); };
}

export function addStars(scene, count = 500, radius = 40, color = 0xff9900) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 2 * radius;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 2 * radius;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 2 * radius;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color, size: 0.06, transparent: true, opacity: 0.7, depthWrite: false });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return pts;
}