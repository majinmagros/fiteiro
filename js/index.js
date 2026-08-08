import * as THREE from 'three';
import { OrbitControls } from './build/OrbitControls.js';
import { createRenderer, watchResize, loadTexture, addStars, loopWhenVisible } from './core.js';

const IMGS = ['ini-rl06.jpg', 'ini-sl03.jpg', 'news-01-01.jpg', 'news-04-01.jpg', 'ini-tit2.jpg', 'logoFiteiro.png'];

async function hero() {
  const mount = document.getElementById('hero-canvas');
  if (!mount) return;
  const { renderer, cleanup: cleanupRenderer } = createRenderer(mount);
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

  // Create texture atlas and instanced mesh for hero images
  const { texture: atlasTexture, uvRects } = await createTextureAtlas(IMGS);
  if (!atlasTexture) return;

  const { mesh, dummy, setInstanceOpacity } = createCarouselInstancedMesh(uvRects, IMGS.length, 1.9, 1.9);
  mesh.material.uniforms.uAtlas.value = atlasTexture;
  scene.add(mesh);

  // Torus rings
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

  // Central logo (separate, not instanced)
  let centralLogo = null;
  const { texture: centralLogoTexture } = await createTextureAtlas(['logoFiteiro.png']);
  if (centralLogoTexture) {
    const img = centralLogoTexture.image;
    const ar = img.width / img.height;
    const geo = new THREE.PlaneGeometry(3 * ar, 3);
    const mat = new THREE.MeshBasicMaterial({ map: centralLogoTexture, transparent: true, depthWrite: false });
    centralLogo = new THREE.Mesh(geo, mat);
    scene.add(centralLogo);
  }

  const clock = new THREE.Clock();
  const stopLoop = loopWhenVisible(mount, () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    IMGS.forEach((src, i) => {
      const angle = (i / IMGS.length) * Math.PI * 2;
      const a = angle + t * 1.5; // autoRotateSpeed
      const radius = 3.6;
      const bob = 0.5 + (i % 3) * 0.3;
      
      const x = Math.cos(a) * radius;
      const y = Math.sin(t * 0.5 + angle) * bob;
      const z = Math.sin(a) * radius;
      
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, a + Math.PI / 2, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const behind = Math.sin(a) > 0.2;
      setInstanceOpacity(i, behind ? 0.25 : 1);
    });
    mesh.instanceMatrix.needsUpdate = true;

    logo.rotation.z += dt * 0.15;
    logo2.rotation.y -= dt * 0.2;

    if (centralLogo) {
      centralLogo.rotation.y += dt * 0.4;
      centralLogo.lookAt(camera.position);
    }

    controls.update();
    renderer.render(scene, camera);
  });

  const stopResize = watchResize(renderer, camera, mount);

  // Cleanup on mount removal
  const observer = new MutationObserver(() => {
    if (!document.body.contains(mount)) {
      stopLoop();
      stopResize();
      cleanupRenderer();
      disposeScene(scene);
      atlasTexture.dispose();
      if (centralLogoTexture) centralLogoTexture.dispose();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
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
  const MAX_CARD_W = viewW * 0.9;
  const CARD_ASPECT = MAX_CARD_W / CARD_H;

  let modal = null;
  let exhibitions = [];

  loadExhibitions().then((data) => {
    exhibitions = data;
    if (exhibitions.length > 0) {
      modal = createExhibitionModal();
    }
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onPointerMove(event) {
    const rect = mount.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function onClick() {
    if (!modal || exhibitions.length === 0) return;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(cards.filter(c => c.userData.exhibitionIndex !== undefined));
    if (intersects.length > 0) {
      const idx = intersects[0].object.userData.exhibitionIndex;
      const exhibition = exhibitions[idx % exhibitions.length];
      openModal(modal, exhibition);
    }
  }

  mount.addEventListener('pointermove', onPointerMove);
  mount.addEventListener('click', onClick);

  Promise.all(imgs.map(loadTexture)).then((texs) => {
    texs.forEach((tex, i) => {
      const img = tex.image;
      const imgAspect = img.width / img.height;
      let w = MAX_CARD_W;
      let repeatX = 1, repeatY = 1, offsetX = 0, offsetY = 0;

      if (imgAspect > CARD_ASPECT) {
        repeatY = CARD_ASPECT / imgAspect;
        offsetY = (1 - repeatY) / 2;
      } else {
        w = CARD_H * imgAspect;
      }

      const geo = new THREE.PlaneGeometry(w, CARD_H);
      const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true, depthWrite: false });
      tex.repeat.set(repeatX, repeatY);
      tex.offset.set(offsetX, offsetY);
      const plane = new THREE.Mesh(geo, mat);
      plane.position.y = -i * (CARD_H + GAP);
      plane.userData = { baseY: plane.position.y, height: CARD_H, exhibitionIndex: i };
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
    const SPEED = 1.2;
    loopWhenVisible(mount, () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      group.position.y += SPEED * dt;
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