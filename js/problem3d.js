/* Section Permasalahan 3D: hamparan desa, desa tertinggal, mahasiswa yang tak tersalurkan, jembatan yang putus */
import * as THREE from 'three';
import { mulberry32, mat, floatingBase, buildCampus, tree } from './world3d.js';

const A = window.App;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let ctx = null, host = null, visible = true, ro = null, io = null, dirty = true, slide = 0;
const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
const lerp = (a, b, k) => a + (b - a) * k;
const CAMS = [[0, 10.5, 17, 0, 0, 0], [6, 9, 13.5, 0, 0, 0], [-3, 7.5, 18, -2.5, 1.5, 0], [-3, 7.5, 18, -2.5, 1.5, 0]];

function build() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(32, 1, .1, 120), rng = mulberry32(7);
  scene.add(new THREE.HemisphereLight(0xdff3e6, 0x39503f, 1.3));
  const sun = new THREE.DirectionalLight(0xfff0cc, 2.6); sun.position.set(8, 14, 8); scene.add(sun);
  const rim = new THREE.DirectionalLight(0xd8ec6e, .8); rim.position.set(-8, 4, -6); scene.add(rim);

  const world = new THREE.Group(); scene.add(world);
  world.add(floatingBase(8.4, 5, '#6FA57E', 1.3));

  /* hamparan rumah (instanced) */
  const pts = [];
  for (let gx = -7; gx <= 7; gx += 1.45) for (let gz = -7; gz <= 7; gz += 1.45) {
    const x = gx + (rng() - .5) * .6, z = gz + (rng() - .5) * .6;
    if (Math.hypot(x, z) < 7.6) pts.push([x, z, rng() * Math.PI]);
  }
  const N = pts.length;
  const bodyM = new THREE.InstancedMesh(new THREE.BoxGeometry(.7, .45, .6), mat('#FFFFFF'), N);
  const roofM = new THREE.InstancedMesh(new THREE.ConeGeometry(.6, .42, 4), mat('#FFFFFF'), N);
  const flagged = new Set(); while (flagged.size < Math.round(N * .14)) flagged.add(Math.floor(rng() * N));
  const dummy = new THREE.Object3D(), cBody = new THREE.Color(), cRoof = new THREE.Color();
  const baseBody = new THREE.Color('#F0DCC0'), baseRoof = new THREE.Color('#C0583A'), dimBody = new THREE.Color('#8C8578'), dimRoof = new THREE.Color('#5E4A40');
  pts.forEach(([x, z, r], i) => {
    dummy.position.set(x, .62, z); dummy.rotation.set(0, r, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); bodyM.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, 1.05, z); dummy.rotation.set(0, r + Math.PI / 4, 0); dummy.updateMatrix(); roofM.setMatrixAt(i, dummy.matrix);
    bodyM.setColorAt(i, baseBody); roofM.setColorAt(i, baseRoof);
  });
  world.add(bodyM, roofM);
  for (let i = 0; i < 26; i++) { const a = rng() * 6.28, d = 2 + rng() * 5.5; world.add(tree(Math.cos(a) * d, Math.sin(a) * d, .6 + rng() * .4, i % 3 === 0 ? 1 : 0)); }

  /* penanda desa tertinggal */
  const beaconM = new THREE.MeshBasicMaterial({ color: '#FFB86B', transparent: true, opacity: .9 });
  const beacons = [...flagged].map(i => { const b = new THREE.Mesh(new THREE.ConeGeometry(.16, .5, 8), beaconM); b.rotation.x = Math.PI; b.position.set(pts[i][0], 2.1, pts[i][1]); b.visible = false; world.add(b); return b; });

  /* kampus + jalur ke desa */
  const campus = buildCampus(); campus.position.set(-8.6, 4.6, 1); campus.scale.setScalar(1.5); world.add(campus);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-7.4, 4, 1), new THREE.Vector3(-4.6, 6.4, 1.4), new THREE.Vector3(-1, 5, 1), new THREE.Vector3(1.6, 1.8, .6)]);
  const seg = [];
  const lineM = new THREE.MeshBasicMaterial({ color: '#D8EC6E', transparent: true, opacity: .55 });
  for (let i = 0; i < 12; i++) { const a = i / 12, b = (i + .6) / 12, pp = [0, .2, .4, .6, .8, 1].map(k => curve.getPoint(lerp(a, b, k))); const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pp), 8, .05, 6), lineM); m.userData.i = i; seg.push(m); world.add(m); }
  const cross = new THREE.Group(); const xm = new THREE.MeshBasicMaterial({ color: '#FF7A66' });
  [.7, -.7].forEach(r => { const b = new THREE.Mesh(new THREE.BoxGeometry(1.3, .18, .18), xm); b.rotation.z = r; cross.add(b); });
  cross.position.copy(curve.getPoint(.55)); cross.position.y += .1; world.add(cross);

  /* mahasiswa (partikel) */
  const P = 170, pos = new Float32Array(P * 3), col = new Float32Array(P * 3), seed = Array.from({ length: P }, () => ({ o: rng(), lost: rng() < .82, dx: (rng() - .5) * 5, dy: rng() * 4 + 1, dz: (rng() - .5) * 4 }));
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const stu = new THREE.Points(pg, new THREE.PointsMaterial({ size: .16, vertexColors: true, transparent: true, depthWrite: false })); world.add(stu);
  const tmp = new THREE.Vector3(), lime = new THREE.Color('#D8EC6E');

  /* awan-titik latar */
  const F = 60, fp = new Float32Array(F * 3); for (let i = 0; i < F; i++) { fp[i * 3] = (rng() - .5) * 30; fp[i * 3 + 1] = rng() * 10 - 1; fp[i * 3 + 2] = (rng() - .5) * 20; }
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  scene.add(new THREE.Points(fg, new THREE.PointsMaterial({ color: 0xd8ec6e, size: .07, transparent: true, opacity: .55, depthWrite: false })));

  const st = { dim: 0, stu: 0, brk: 0, cam: CAMS[0].slice(), fit: 1 }, look = new THREE.Vector3();
  const setC = (mesh, arr, i, c) => { mesh.setColorAt(i, c); };
  let lastDim = -1;

  return {
    renderer,
    resize(w, h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); st.fit = Math.max(1, 1.15 / Math.min(1.6, camera.aspect) * .9); },
    update(t) {
      ptr.sx = lerp(ptr.sx, ptr.x, .05); ptr.sy = lerp(ptr.sy, ptr.y, .05);
      const k = reduced ? 1 : .045, tgt = CAMS[slide];
      st.dim = lerp(st.dim, slide >= 1 ? 1 : 0, k); st.stu = lerp(st.stu, slide >= 2 ? 1 : 0, k); st.brk = lerp(st.brk, slide === 3 ? 1 : 0, k);
      for (let i = 0; i < 6; i++) st.cam[i] = lerp(st.cam[i], tgt[i], k);
      camera.position.set(st.cam[0] * st.fit + ptr.sx * .8, st.cam[1] * st.fit - ptr.sy * .5, st.cam[2] * st.fit); look.set(st.cam[3], st.cam[4], st.cam[5]); camera.lookAt(look);
      world.rotation.y = reduced ? 0 : Math.sin(t * .12) * .18 + t * .015;

      if (Math.abs(st.dim - lastDim) > .004) {
        lastDim = st.dim;
        pts.forEach((_, i) => { const f = flagged.has(i) ? st.dim : 0; bodyM.setColorAt(i, cBody.copy(baseBody).lerp(dimBody, f)); roofM.setColorAt(i, cRoof.copy(baseRoof).lerp(dimRoof, f)); });
        bodyM.instanceColor.needsUpdate = true; roofM.instanceColor.needsUpdate = true;
      }
      beacons.forEach((b, i) => { b.visible = st.dim > .3; b.scale.setScalar(st.dim * (.85 + .25 * Math.sin(t * 3 + i))); b.position.y = 2.1 + Math.sin(t * 2.4 + i) * .15; });
      campus.visible = st.stu > .02; campus.scale.setScalar(1.5 * st.stu); campus.position.y = 4.6 + Math.sin(t * 1.1) * .2; campus.rotation.y = Math.sin(t * .4) * .3;
      seg.forEach(m => { const gap = st.brk > .5 && m.userData.i >= 5 && m.userData.i <= 7; m.visible = st.stu > .05 && !gap; });
      lineM.opacity = .55 * st.stu;
      cross.visible = st.brk > .3; cross.scale.setScalar(st.brk * (1 + .12 * Math.sin(t * 5))); cross.rotation.y = t;
      /* mahasiswa mengalir; sebagian besar menyimpang & memudar (tak tersalurkan) */
      for (let i = 0; i < P; i++) {
        const s = seed[i], p = (t * .07 + s.o) % 1, drift = s.lost ? Math.max(0, p - .4) / .6 : 0;
        curve.getPoint(Math.min(1, s.lost ? p * .75 : p), tmp);
        pos[i * 3] = tmp.x + s.dx * drift * drift; pos[i * 3 + 1] = tmp.y + s.dy * drift * drift; pos[i * 3 + 2] = tmp.z + s.dz * drift;
        const vis = st.stu * (s.lost ? (1 - drift) : 1) * (st.brk > .5 && p > .48 && p < .62 ? .2 : 1);
        col[i * 3] = lime.r * vis; col[i * 3 + 1] = lime.g * vis; col[i * 3 + 2] = lime.b * vis;
      }
      pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true;
    },
    draw() { renderer.render(scene, camera); }
  };
}

let t = 0, last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (!ctx || !host || !host.isConnected || !visible || document.hidden) return;
  if (reduced) { if (dirty) { for (let i = 0; i < 60; i++) ctx.update(0); ctx.draw(); dirty = false; } return; }
  t += dt; ctx.update(t); ctx.draw();
}
function fit() { if (!ctx || !host) return; const w = host.clientWidth, h = host.clientHeight; if (w && h) { ctx.resize(w, h); dirty = true; } }

function attach() {
  const el = document.querySelector('.p3d');
  if (!el) return;
  if (!ctx) { try { ctx = build(); } catch (e) { console.warn('WebGL tidak tersedia untuk section masalah', e); return; } requestAnimationFrame(frame); }
  host = el; host.appendChild(ctx.renderer.domElement);
  if (ro) ro.disconnect(); ro = new ResizeObserver(fit); ro.observe(host);
  if (io) io.disconnect(); io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }); io.observe(host);
  fit();
}
window.addEventListener('pointermove', e => { ptr.x = (e.clientX / innerWidth - .5) * 2; ptr.y = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
A.prob3d = { attach, set(i) { slide = i; dirty = true; } };
attach();
