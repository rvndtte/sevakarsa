/* Hero 3D: pulau desa low-poly melayang + jalur kolaborasi ke kampus (Three.js) */
import * as THREE from 'three';
import { mulberry32, mat, buildVillage, buildCampus, cloud } from './world3d.js';

const A = window.App;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let ctx = null, host = null, visible = true, ro = null, io = null, dirty = true;
const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
const easeOutBack = x => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

function build() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  const rng = mulberry32(11);

  scene.add(new THREE.HemisphereLight(0xdff3e6, 0x5a6b55, 1.25));
  const sun = new THREE.DirectionalLight(0xfff0cc, 2.8); sun.position.set(7, 11, 6); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 }); sun.shadow.bias = -.0006; sun.shadow.radius = 4;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xd8ec6e, .9); rim.position.set(-7, 3, -6); scene.add(rim);

  const orb = new THREE.Mesh(new THREE.SphereGeometry(.9, 24, 16), new THREE.MeshBasicMaterial({ color: '#FFF3B0' })); orb.position.set(2.2, 4.2, -9);
  [[1.5, .16], [2.3, .07]].forEach(([s, o]) => { const h = new THREE.Mesh(new THREE.SphereGeometry(.9 * s, 24, 16), new THREE.MeshBasicMaterial({ color: '#FFF3B0', transparent: true, opacity: o, depthWrite: false })); orb.add(h); });
  scene.add(orb);

  const world = new THREE.Group(); scene.add(world);
  const island = buildVillage(rng).island; world.add(island);

  const campus = buildCampus(); campus.position.set(-4.7, 3.7, -1.2); world.add(campus);
  const flag = campus.userData.flag;

  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(2.0, 1.8, .4), new THREE.Vector3(-.6, 4.9, .3), new THREE.Vector3(-3.9, 3.9, -1.0)]);
  world.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 60, .022, 6), new THREE.MeshBasicMaterial({ color: '#D8EC6E', transparent: true, opacity: .4 })));
  const dotM = new THREE.MeshBasicMaterial({ color: '#D8EC6E' });
  const dots = Array.from({ length: 9 }, () => { const d = new THREE.Mesh(new THREE.SphereGeometry(.085, 10, 8), dotM); world.add(d); return d; });

  const pin = new THREE.Group();
  pin.add(new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 12), dotM));
  const tip = new THREE.Mesh(new THREE.ConeGeometry(.15, .34, 12), dotM); tip.rotation.x = Math.PI; tip.position.y = -.26; pin.add(tip);
  pin.position.set(2.2, 2.7, .4); world.add(pin);

  const clouds = [[-7, 5.2, -4, .8], [6.5, 3.2, -5, 1], [-2, 6.2, -6, .7], [7, -1.5, -3, .6]].map(([x, y, z, s], i) => { const c = cloud(rng); c.traverse(o => { if (o.isMesh) o.material = o.material.clone(); }); c.position.set(x, y, z); c.scale.setScalar(s); c.userData.v = .12 + i * .03; scene.add(c); return c; });

  const N = 70, pp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pp[i * 3] = (rng() - .5) * 13; pp[i * 3 + 1] = (rng() - .5) * 8 + 1; pp[i * 3 + 2] = (rng() - .5) * 7; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const pm = new THREE.PointsMaterial({ color: 0xd8ec6e, size: .07, transparent: true, opacity: .8, depthWrite: false });
  const fireflies = new THREE.Points(pg, pm); scene.add(fireflies);

  return {
    renderer,
    resize(w, h) {
      renderer.setSize(w, h, false);
      const aspect = w / h; camera.aspect = aspect; camera.updateProjectionMatrix();
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const dist = Math.max(5.9 / (t * aspect), 5.4 / t);
      camera.position.set(0, dist * .3, dist); camera.lookAt(0, 1.1, 0);
    },
    update(t) {
      ptr.sx += (ptr.x - ptr.sx) * .05; ptr.sy += (ptr.y - ptr.sy) * .05;
      const intro = reduced ? 1 : Math.min(1, t / 1.8), e = easeOutBack(intro);
      world.scale.setScalar(.55 + .45 * e);
      world.rotation.y = -.42 + Math.sin(t * .2) * .14 + ptr.sx * .4 + (1 - intro) * 1.4 + scrollY * .0004;
      world.rotation.x = ptr.sy * .07;
      island.position.y = Math.sin(t * .9) * .12;
      campus.position.y = 3.7 + Math.sin(t * 1.1 + 1) * .16; campus.rotation.y = Math.sin(t * .4) * .25;
      flag.rotation.y = Math.sin(t * 3) * .35;
      dots.forEach((d, i) => { d.position.copy(curve.getPoint((t * .09 + i / dots.length) % 1)); d.scale.setScalar(.7 + .5 * Math.sin(((t * .09 + i / dots.length) % 1) * Math.PI)); });
      pin.position.y = 2.7 + Math.sin(t * 2) * .1; pin.rotation.y = t * .8;
      clouds.forEach(c => { c.position.x += c.userData.v * .016; if (c.position.x > 9) c.position.x = -9; const fa = Math.min(1, Math.max(0, (8.6 - Math.abs(c.position.x)) / 2.2)); c.traverse(o => { if (o.isMesh) o.material.opacity = .92 * fa; }); });
      fireflies.rotation.y = t * .02; pm.opacity = .55 + .3 * Math.sin(t * 1.6);
    },
    draw() { renderer.render(scene, camera); }
  };
}

let t = 0, last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (!ctx || !host || !host.isConnected || !visible || document.hidden) return;
  if (reduced) { if (dirty) { ctx.update(0); ctx.draw(); dirty = false; } return; }
  t += dt; ctx.update(t); ctx.draw();
}

function fit() {
  if (!ctx || !host) return;
  const w = host.clientWidth, h = host.clientHeight;
  if (w && h) { ctx.resize(w, h); dirty = true; }
}

function attach() {
  const el = document.querySelector('.hpic .scene');
  if (!el) return;
  if (!ctx) { try { ctx = build(); } catch (e) { console.warn('WebGL tidak tersedia, memakai foto', e); return; } requestAnimationFrame(frame); }
  host = el; host.appendChild(ctx.renderer.domElement); host.parentElement.classList.add('has3d');
  if (ro) ro.disconnect(); ro = new ResizeObserver(fit); ro.observe(host);
  if (io) io.disconnect(); io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }); io.observe(host);
  fit();
}

window.addEventListener('pointermove', e => { ptr.x = (e.clientX / innerWidth - .5) * 2; ptr.y = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
A.hero3d = { attach };
attach();
