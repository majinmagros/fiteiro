import * as THREE from 'three';
import { OrbitControls } from './build/OrbitControls.js';
import { createRenderer, watchResize, loadTexture, addStars, loopWhenVisible } from './core.js';

const IMGS = ['ini-rl06.jpg', 'ini-sl03.jpg', 'news-01-01.jpg', 'news-04-01.jpg', 'ini-tit2.jpg', 'logoFiteiro.png'];

function makePlane(tex) {
  const img = tex.image;
  const ar = img.width / img.height;
  const geo = new THREE.PlaneGeometry(1.9 * ar, 1.9);
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true, depthWrite: false });
  return new THREE.Mesh(geo, mat);
}

function hero() {
  const mount = document.getElementById('hero-canvas');
  if (!mount) return;
  const renderer = createRenderer(mount);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 200);
  camera.position.set(0, 1, 13);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.5;
  controls.enablePan = false;
  controls.minDistance = 5;
  controls.maxDistance = 30;
  controls.target.set(0, 0, 0);

  addStars(scene, 700, 55, 0xff9900);
  scene.fog = new THREE.FogExp2(0x050505, 0.02);

  const group = new THREE.Group();
  scene.add(group);
  const cards = [];

  IMGS.forEach((src, i) => {
    const angle = (i / IMGS.length) * Math.PI * 2;
    loadTexture(src).then((tex) => {
      const plane = makePlane(tex);
      group.add(plane);
      cards.push({ plane, angle, radius: 3.6, bob: 0.5 + (i % 3) * 0.3 });
    }).catch(() => {});
  });

  const logo = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.03, 8, 100),
    new THREE.MeshBasicMaterial({ color: 0xff9900, transparent: true, opacity: 0.45 })
  );
  const logo2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.03, 8, 100),
    new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.45 })
  );
  logo.rotation.x = Math.PI / 2.2;
  logo2.rotation.x = Math.PI / 1.8;
  scene.add(logo);
  scene.add(logo2);

  loadTexture('logoFiteiro.png').then((tex) => {
    const img = tex.image;
    const ar = img.width / img.height;
    const g = new THREE.PlaneGeometry(3 * ar, 3);
    const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    const p = new THREE.Mesh(g, m);
    scene.add(p);
    cards.push({ plane: p, angle: 0, radius: 0, bob: 0, isLogo: true });
  }).catch(() => {});

  const clock = new THREE.Clock();
  loopWhenVisible(mount, () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    cards.forEach(({ plane, angle, radius, bob, isLogo }) => {
      if (isLogo) {
        plane.rotation.y += dt * 0.4;
        plane.lookAt(camera.position);
        return;
      }
      const a = angle + group.rotation.y;
      plane.position.set(Math.cos(a) * radius, Math.sin(t * 0.5 + angle) * bob, Math.sin(a) * radius);
      plane.rotation.set(0, a + Math.PI / 2, 0);
      plane.material.opacity = Math.sin(a) > 0.2 ? 0.25 : 1;
    });

    logo.rotation.z += dt * 0.15;
    logo2.rotation.y -= dt * 0.2;

    controls.update();
    renderer.render(scene, camera);
  });
  watchResize(renderer, camera, mount);
}

function destaques() {
  const mount = document.getElementById('destaques-canvas');
  if (!mount) return;
  const renderer = createRenderer(mount);
  const scene = new THREE.Scene();

  const aspect = mount.clientWidth / mount.clientHeight;
  const viewH = 5;
  const viewW = viewH * aspect;
  const camera = new THREE.OrthographicCamera(-viewW / 2, viewW / 2, viewH / 2, -viewH / 2, 0.1, 100);
  camera.position.set(0, 0, 10);

  const imgs = ['news-01-01.jpg', 'news-02-01.jpg', 'news-03-01.jpg', 'news-04-01.jpg'];
  const group = new THREE.Group();
  scene.add(group);
  const cards = [];
  const CARD_H = 2.2;
  const GAP = 0.4;
  const MAX_CARD_W = viewW * 0.9; // fit within camera frustum

  Promise.all(imgs.map(loadTexture)).then((texs) => {
    texs.forEach((tex, i) => {
      const img = tex.image;
      const ar = img.width / img.height;
      let w = CARD_H * ar;
      if (w > MAX_CARD_W) {
        w = MAX_CARD_W;
      }
      const geo = new THREE.PlaneGeometry(w, CARD_H);
      const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true, depthWrite: false });
      const plane = new THREE.Mesh(geo, mat);
      plane.position.y = -i * (CARD_H + GAP);
      plane.userData = { baseY: plane.position.y, height: CARD_H };
      group.add(plane);
      cards.push(plane);
    });

    // clone for seamless loop
    const totalH = cards.reduce((sum, c) => sum + c.userData.height + GAP, 0) - GAP;
    cards.forEach((plane) => {
      const clone = plane.clone();
      clone.position.y = plane.position.y - totalH;
      clone.userData = { ...plane.userData, baseY: clone.position.y };
      group.add(clone);
      cards.push(clone);
    });

    const clock = new THREE.Clock();
    const SPEED = 1.2; // units/sec (upward)
    loopWhenVisible(mount, () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      group.position.y += SPEED * dt;

      // seamless reset
      if (group.position.y >= totalH) {
        group.position.y -= totalH;
      }

      renderer.render(scene, camera);
    });
    watchResize(renderer, camera, mount);
  }).catch(() => {});
}

function start() {
  hero();
  destaques();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}