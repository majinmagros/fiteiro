import * as THREE from 'three';
import { OrbitControls } from './build/OrbitControls.js';
import { createRenderer, watchResize, loadTexture, addStars } from './core.js';

const IMGS = ['ini-rl06.jpg', 'ini-sl03.jpg', 'news-01-01.jpg', 'news-04-01.jpg', 'ini-tit2.jpg', 'logoFiteiro.png'];

function makePlane(tex) {
  const img = tex.image;
  const ar = img.width / img.height;
  const geo = new THREE.PlaneGeometry(1.9 * ar, 1.9);
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.visible = false;
  return mesh;
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
  function animate() {
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
      const behind = Math.sin(a) > 0.2;
      plane.material.opacity = behind ? 0.25 : 1;
      if (plane.material.opacity !== (behind ? 0.25 : 1)) plane.material.needsUpdate = true;
    });

    logo.rotation.z += dt * 0.15;
    logo2.rotation.y -= dt * 0.2;

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
  watchResize(renderer, camera, mount);
}

function destaques() {
  const mount = document.getElementById('destaques-canvas');
  if (!mount) return;
  const renderer = createRenderer(mount);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  addStars(scene, 250, 16, 0xff9900);

  const imgs = ['news-01-01.jpg', 'news-02-01.jpg', 'news-03-01.jpg', 'news-04-01.jpg'];
  const group = new THREE.Group();
  scene.add(group);
  const cards = [];

  imgs.forEach((src, i) => {
    const angle = (i / imgs.length) * Math.PI * 2;
    loadTexture(src).then((tex) => {
      const plane = makePlane(tex);
      plane.scale.set(1, 0.24, 1);
      group.add(plane);
      cards.push({ plane, angle });
    }).catch(() => {});
  });

  const clock = new THREE.Clock();
  function animate() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    group.rotation.y += dt * 0.4;

    cards.forEach(({ plane, angle }) => {
      const a = angle + group.rotation.y;
      const r = 3;
      plane.position.set(Math.cos(a) * r, Math.sin(t * 0.4 + angle) * 0.4, Math.sin(a) * r);
      plane.rotation.set(0, a + Math.PI / 2, 0);
      const behind = Math.sin(a) > 0.15;
      plane.material.opacity = behind ? 0.2 : 1;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
  watchResize(renderer, camera, mount);
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