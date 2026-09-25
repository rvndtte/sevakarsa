/* Story 3D: alur kerja platform yang berjalan mengikuti scroll */
import * as THREE from 'three';
import { mulberry32, mat, shadowed, buildVillage, buildCampus, cloud, student } from './world3d.js';

const A = window.App;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = x => x * x * (3 - 2 * x);
const easeOutBack = x => { const c1 = 1.6, c3 = c1 + 1; return x <= 0 ? 0 : x >= 1 ? 1 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

let ctx = null, sec = null, visible = true, ro = null, io = null, lastStep = -1, ps = 0;
const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const NEEDS = [
  { t: 'Perbaikan irigasi', s: 'Butuh: Teknik Sipil, Pertanian', pos: V(-1.5, 3.9, 1.3) },
  { t: 'Air bersih', s: 'Butuh: Kesehatan Lingkungan', pos: V(-4.7, 4.3, .9) },
  { t: 'Literasi digital', s: 'Butuh: Informatika, Pendidikan', pos: V(-5.8, 2.7, 1.5) },
  { t: 'Promosi UMKM', s: 'Butuh: Manajemen, Desain', pos: V(-3.0, 5.5, .2) }
];

function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function paintCard(cv, n, state) {
  const g = cv.getContext('2d'), locked = state === 'locked', chosen = state === 'chosen';
  g.clearRect(0, 0, cv.width, cv.height);
  rr(g, 6, 6, 500, 196, 38); g.fillStyle = locked ? '#CFD5CE' : chosen ? '#F2FAC8' : '#FFFFFF'; g.fill();
  g.lineWidth = chosen ? 8 : 3; g.strokeStyle = chosen ? '#8FB51F' : locked ? '#B3BBB2' : '#E4E2D6'; g.stroke();
  const tag = locked ? 'Terkunci' : chosen ? 'Matched' : 'Available', tc = locked ? '#6E7B72' : chosen ? '#3F5A00' : '#1F5138', tb = locked ? '#E3E7E1' : chosen ? '#D8EC6E' : '#E1EEDB';
  g.font = '700 22px "Plus Jakarta Sans",system-ui,sans-serif'; const tw = g.measureText(tag).width + 32;
  rr(g, 36, 30, tw, 36, 18); g.fillStyle = tb; g.fill(); g.fillStyle = tc; g.fillText(tag, 52, 56);
  g.fillStyle = locked ? '#5E6A62' : '#16241B'; g.font = '700 44px Fraunces,Georgia,serif'; g.fillText(n.t, 36, 118);
  g.fillStyle = '#6E7B72'; g.font = '500 25px "Plus Jakarta Sans",system-ui,sans-serif'; g.fillText(n.s, 36, 165);
  if (locked) { g.fillStyle = '#6E7B72'; rr(g, 432, 40, 44, 34, 6); g.fill(); g.lineWidth = 6; g.strokeStyle = '#6E7B72'; g.beginPath(); g.arc(454, 40, 13, Math.PI, 0); g.stroke(); }
}
function textSprite(text, bg, fg, w = 512) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = 128;
  const paint = () => { const g = cv.getContext('2d'); g.clearRect(0, 0, w, 128); rr(g, 6, 20, w - 12, 88, 44); g.fillStyle = bg; g.fill(); g.fillStyle = fg; g.font = '700 42px "Plus Jakarta Sans",system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(text, w / 2, 78); };
  paint();
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); s.scale.set(w / 200, .64, 1);
  s.userData.repaint = () => { paint(); tex.needsUpdate = true; };
  return s;
}
function paperTex(accent) {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 160; const g = cv.getContext('2d');
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, 128, 160); g.fillStyle = accent; g.fillRect(0, 0, 128, 26);
  g.fillStyle = '#C9D4CC'; for (let i = 0; i < 6; i++) g.fillRect(14, 44 + i * 18, i % 3 === 2 ? 60 : 100, 7);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function photoTex(i) {
  const cv = document.createElement('canvas'); cv.width = 160; cv.height = 128; const g = cv.getContext('2d');
  const pal = [['#F4E7B0', '#9CC24E'], ['#CFE5D3', '#3F7A55'], ['#FBEFD0', '#C0583A'], ['#DDEAF3', '#2A6B4A'], ['#F3E6C8', '#86B043']][i % 5];
  const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, pal[0]); gr.addColorStop(1, '#FFFFFF'); g.fillStyle = gr; g.fillRect(0, 0, 160, 128);
  g.fillStyle = pal[1]; g.beginPath(); g.moveTo(0, 96); g.quadraticCurveTo(50, 50, 100, 84); g.quadraticCurveTo(140, 100, 160, 70); g.lineTo(160, 128); g.lineTo(0, 128); g.fill();
  g.fillStyle = '#C0583A'; g.fillRect(96, 74, 22, 14); g.beginPath(); g.moveTo(92, 74); g.lineTo(107, 62); g.lineTo(122, 74); g.fill();
  g.lineWidth = 8; g.strokeStyle = '#FFFFFF'; g.strokeRect(0, 0, 160, 128);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const KEYS = [
  [0, V(-4.4, 3.5, 8.6), V(-3.4, 1.7, 0)],
  [.25, V(-2.0, 3.8, 10.6), V(-2.0, 1.9, 0)],
  [.5, V(.5, 4.8, 13.8), V(.6, 2.3, -.4)],
  [.75, V(.2, 4.6, 13.2), V(.4, 2.1, -.4)],
  [1, V(.3, 4.1, 12.4), V(.5, 2.0, -.3)]
];

function build() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(32, 1.7, .1, 100), rng = mulberry32(5);

  scene.add(new THREE.HemisphereLight(0xdff3e6, 0x5a6b55, 1.2));
  const sun = new THREE.DirectionalLight(0xfff0cc, 2.7); sun.position.set(8, 12, 7); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 9, bottom: -9, near: 1, far: 40 }); sun.shadow.bias = -.0006; sun.shadow.radius = 4;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xd8ec6e, .8); rim.position.set(-8, 3, -6); scene.add(rim);
  const orbM = new THREE.MeshBasicMaterial({ color: '#FFF3B0' });
  const orb = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 16), orbM); orb.position.set(9, 5.6, -24);
  [[1.6, .14], [2.6, .06]].forEach(([s, o]) => orb.add(new THREE.Mesh(new THREE.SphereGeometry(1.1 * s, 24, 16), new THREE.MeshBasicMaterial({ color: '#FFF3B0', transparent: true, opacity: o, depthWrite: false }))));
  scene.add(orb);

  const village = buildVillage(rng), vg = village.island; vg.scale.setScalar(.8); vg.position.set(-3.2, 0, 0); scene.add(vg);
  const campus = buildCampus(); campus.scale.setScalar(.95); scene.add(campus);
  const CAMPUS_END = V(4.3, 2.3, -1.6), CAMPUS_START = V(15, 7, -8);
  const clouds = [[-9, 6, -6, .9], [9, 4.5, -7, 1.1], [0, 7.5, -9, .8], [-6, -1.5, -2, .6]].map(([x, y, z, s], i) => { const c = cloud(rng); c.position.set(x, y, z); c.scale.setScalar(s); c.userData.v = .1 + i * .03; scene.add(c); return c; });

  const link = new THREE.CatmullRomCurve3([V(-1.5, 1.4, .3), V(1.1, 4.7, -.4), V(3.5, 3.0, -1.4)]);
  const tubeGeo = new THREE.TubeGeometry(link, 64, .03, 6), tubeCount = tubeGeo.index.count;
  const tube = new THREE.Mesh(tubeGeo, new THREE.MeshBasicMaterial({ color: '#D8EC6E', transparent: true, opacity: .55 })); scene.add(tube);
  const mid = link.getPoint(.5);

  const beamM = new THREE.MeshBasicMaterial({ color: '#D8EC6E', transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.16, .3, 1, 16, 1, true), beamM); const beamBase = V(-4.55, .75, -.72); scene.add(beam);
  const waves = Array.from({ length: 3 }, () => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, .03, 6, 48), new THREE.MeshBasicMaterial({ color: '#D8EC6E', transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = Math.PI / 2; m.position.copy(beamBase); scene.add(m); return m; });

  const cards = NEEDS.map((n, i) => {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 208; paintCard(cv, n, 'open');
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); sp.scale.set(2.5, 1.02, 1); sp.visible = false; scene.add(sp);
    return { n, cv, tex, sp, state: 'open', seed: i * 1.7 };
  });
  const setState = (c, st) => { if (c.state !== st) { c.state = st; paintCard(c.cv, c.n, st); c.tex.needsUpdate = true; } };

  const ringGeo = new THREE.RingGeometry(1.5, 1.68, 96, 1), ringCount = ringGeo.index.count;
  const ringGrp = new THREE.Group(); ringGrp.position.copy(mid);
  const ringBg = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.68, 96, 1), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false }));
  const ringMat = new THREE.MeshBasicMaterial({ color: '#D99A21', transparent: true, side: THREE.DoubleSide, depthWrite: false });
  const ring = new THREE.Mesh(ringGeo, ringMat); ringGrp.add(ringBg, ring); ringGrp.visible = false; scene.add(ringGrp);
  const lblDisc = textSprite('Diskusi · 7 hari', '#FBEFD0', '#8A5F0A', 440), lblProp = textSprite('Proposal · 7 hari', '#DDEAF3', '#2B6388', 440);
  const lblOk = textSprite('Proposal diterima', '#D8EC6E', '#0B1F16', 460);
  [lblDisc, lblProp, lblOk].forEach(l => { l.position.copy(mid).add(V(0, -2.15, 0)); l.material.opacity = 0; l.visible = false; scene.add(l); });

  const paperT = paperTex('#D99A21'), propT = paperTex('#8FB51F');
  const papers = Array.from({ length: 4 }, () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(.5, .63), new THREE.MeshBasicMaterial({ map: paperT, side: THREE.DoubleSide, transparent: true })); m.visible = false; scene.add(m); return m; });
  const prop = new THREE.Mesh(new THREE.PlaneGeometry(.95, 1.2), new THREE.MeshBasicMaterial({ map: propT, side: THREE.DoubleSide, transparent: true })); prop.visible = false; scene.add(prop);

  const N = 150, cp = new Float32Array(N * 3), cc = new Float32Array(N * 3), vel = [], pal = ['#D8EC6E', '#FBEFD0', '#FFFFFF', '#2F8F5B', '#D99A21'].map(c => new THREE.Color(c));
  for (let i = 0; i < N; i++) { const a = rng() * Math.PI * 2, u = rng(), sp = 2 + rng() * 3.2; vel.push(V(Math.cos(a) * Math.sqrt(1 - u * u) * sp, 1.8 + u * sp * .8, Math.sin(a) * Math.sqrt(1 - u * u) * sp)); const c = pal[i % 5]; cc.set([c.r, c.g, c.b], i * 3); }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.BufferAttribute(cp, 3)); cg.setAttribute('color', new THREE.BufferAttribute(cc, 3));
  const cm = new THREE.PointsMaterial({ size: .13, vertexColors: true, transparent: true, depthWrite: false }); const confetti = new THREE.Points(cg, cm); confetti.frustumCulled = false; confetti.visible = false; scene.add(confetti);

  const bridge = new THREE.CatmullRomCurve3([V(3.1, 2.65, -1.35), V(1.7, 2.2, -1.0), V(.3, .6, -.7)]);
  const planks = Array.from({ length: 16 }, (_, i) => { const m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.62, .07, .34), mat(i % 2 ? '#C79A6A' : '#B5895A'))); const u = i / 15; m.position.copy(bridge.getPoint(u)); m.lookAt(m.position.clone().add(bridge.getTangent(u))); m.rotateY(Math.PI / 2); m.scale.setScalar(0); scene.add(m); return m; });
  const kids = ['#D99A21', '#3B7EA8', '#C9483C', '#7D5FB0', '#2F8F5B', '#F2C94C'].map((c, i) => { const s = student(c); s.scale.setScalar(1.15); s.visible = false; s.userData.end = V(-.55 + (i % 3) * .5, .4, .35 + Math.floor(i / 3) * .5); scene.add(s); return s; });

  const frames = Array.from({ length: 5 }, (_, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(.95, .76), new THREE.MeshBasicMaterial({ map: photoTex(i), side: THREE.DoubleSide, transparent: true })); m.scale.setScalar(0); scene.add(m); return m; });

  const N2 = 60, fp = new Float32Array(N2 * 3); for (let i = 0; i < N2; i++) { fp[i * 3] = (rng() - .5) * 20; fp[i * 3 + 1] = (rng() - .5) * 9 + 2; fp[i * 3 + 2] = (rng() - .5) * 8 - 1; }
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  const fm = new THREE.PointsMaterial({ color: 0xd8ec6e, size: .07, transparent: true, opacity: .7, depthWrite: false }); scene.add(new THREE.Points(fg, fm));

  const repaint = () => { cards.forEach(c => { paintCard(c.cv, c.n, c.state); c.tex.needsUpdate = true; }); [lblDisc, lblProp, lblOk].forEach(l => l.userData.repaint()); };
  document.fonts && document.fonts.ready.then(repaint);

  const warm = new THREE.Color('#FFB86B'), cool = new THREE.Color('#FFF0CC'), tmp = new THREE.Color();
  const camPos = V(0, 0, 0), camTgt = V(0, 0, 0), posA = V(0, 0, 0);

  return {
    renderer,
    resize(w, h) { renderer.setSize(w, h, false); camera.aspect = w / h; if (w / h > 1.15) camera.setViewOffset(w, h, -w * .17, h * .02, w, h); else camera.setViewOffset(w, h, 0, h * .1, w, h); camera.updateProjectionMatrix(); },
    update(p, t) {
      const s = (a, b) => seg(p, a, b);
      ptr.sx += (ptr.x - ptr.sx) * .05; ptr.sy += (ptr.y - ptr.sy) * .05;

      let k = 0; while (k < KEYS.length - 2 && p > KEYS[k + 1][0]) k++;
      const f = ease(seg(p, KEYS[k][0], KEYS[k + 1][0]));
      camTgt.lerpVectors(KEYS[k][2], KEYS[k + 1][2], f); camPos.lerpVectors(KEYS[k][1], KEYS[k + 1][1], f);
      const asp = camera.aspect, fac = asp > 1.15 ? Math.max(1, 1.75 / asp) * 1.3 : 2.5;
      camPos.sub(camTgt).multiplyScalar(fac).add(camTgt);
      const orbit = s(.8, 1) * .5; camPos.applyAxisAngle(V(0, 1, 0), 0).sub(camTgt).applyAxisAngle(V(0, 1, 0), -orbit * .6).add(camTgt);
      camera.position.copy(camPos).add(posA.set(ptr.sx * .5, -ptr.sy * .3, 0)); camera.lookAt(camTgt);

      const end = s(.75, 1);
      tmp.copy(cool).lerp(warm, end); sun.color.copy(tmp); orbM.color.copy(tmp); sun.intensity = 2.7 - end * .5;

      vg.position.y = Math.sin(t * .8) * .1;
      const bh = ease(s(0, .07)) * 7;
      beam.visible = bh > .01 && p < .5; beam.scale.set(1, Math.max(.001, bh), 1); beam.position.set(beamBase.x, beamBase.y + bh / 2, beamBase.z); beamM.opacity = .22 * (1 - s(.4, .5));
      waves.forEach((w, i) => { const u = (t * .45 + i / 3) % 1; w.visible = beam.visible; w.scale.setScalar(.3 + u * 2.6); w.material.opacity = (1 - u) * .5 * (1 - s(.4, .5)); });

      const e2 = easeOutBack(s(.22, .4)); campus.visible = p > .215;
      campus.position.lerpVectors(CAMPUS_START, CAMPUS_END, ease(s(.22, .4))); campus.position.y += Math.sin(Math.PI * s(.22, .4)) * 2 + Math.sin(t * 1.1) * .12; campus.rotation.y = (1 - e2) * -1.2 + Math.sin(t * .4) * .1; campus.userData.flag.rotation.y = Math.sin(t * 3) * .35;
      tubeGeo.setDrawRange(0, Math.floor(ease(s(.34, .44)) * (tubeCount / 36)) * 36); tube.visible = p > .34;

      const lockT = s(.43, .47), pick = ease(s(.43, .53)), toBadge = ease(s(.75, .82)), badgeSpot = V(-3.0, 5.3, .5);
      cards.forEach((c, i) => {
        const a = easeOutBack(s(.02 + i * .035, .1 + i * .035)); c.sp.visible = a > .001;
        const bob = Math.sin(t * 1.3 + c.seed) * .13;
        c.sp.position.copy(c.n.pos); c.sp.position.y += bob;
        let sc = a;
        if (i === 0) {
          c.sp.position.lerp(mid, pick); c.sp.position.lerp(badgeSpot, toBadge);
          sc *= 1 - .25 * pick + .35 * toBadge; setState(c, p > .72 ? 'chosen' : 'open');
        } else { setState(c, p > .44 ? 'locked' : 'open'); const fo = 1 - s(.78, .86); c.sp.material.opacity = (1 - .45 * lockT) * fo; if (fo <= 0) c.sp.visible = false; }
        c.sp.scale.set(2.5 * sc, 1.02 * sc, 1);
      });

      const rv = s(.5, .53) * (1 - s(.73, .76)), ph = p < .625 ? 0 : 1, frac = ph ? s(.625, .73) : s(.52, .625);
      ringGrp.visible = rv > .01; ringGrp.quaternion.copy(camera.quaternion); ring.scale.setScalar(1); ringGrp.scale.setScalar(.5 + .5 * rv);
      ringGeo.setDrawRange(0, Math.max(0, Math.floor(frac * 96)) * 6); ringMat.color.set(ph ? '#3B7EA8' : '#D99A21'); ringMat.opacity = rv;
      const showL = (l, a) => { l.visible = a > .01; l.material.opacity = a; };
      showL(lblDisc, s(.51, .54) * (1 - s(.62, .635))); showL(lblProp, s(.625, .64) * (1 - s(.72, .735))); showL(lblOk, s(.735, .75) * (1 - s(.82, .84)));
      lblOk.position.copy(mid).add(V(0, -2.15 + s(.75, .82) * 0, 0));

      papers.forEach((m, i) => { const u0 = (s(.52, .625) * 2.2 + i * .25) % 1, u = u0 < .5 ? u0 * 2 : 2 - u0 * 2, a = s(.52, .54) * (1 - s(.6, .625)); m.visible = a > .01; m.material.opacity = a; m.position.copy(link.getPoint(clamp(u, 0, 1))); m.position.y += .3 + Math.sin(u * Math.PI) * .2; m.lookAt(camera.position); m.rotateZ(Math.sin(t * 3 + i) * .2); });
      const pu = 1 - ease(s(.63, .72)) * .5, pa = s(.625, .64) * (1 - s(.72, .745)); prop.visible = pa > .01; prop.material.opacity = pa; prop.position.copy(link.getPoint(pu)); prop.position.y += .4; prop.lookAt(camera.position); prop.scale.setScalar(.9 + .3 * s(.7, .72));

      const ct = s(.75, .93); confetti.visible = ct > 0 && ct < 1; const pa2 = cg.attributes.position;
      for (let i = 0; i < N; i++) { const tau = ct * 2.6, v = vel[i]; pa2.setXYZ(i, mid.x + v.x * tau, mid.y + v.y * tau - 3.2 * tau * tau, mid.z + v.z * tau); }
      pa2.needsUpdate = true; cm.opacity = 1 - s(.88, .93);

      planks.forEach((m, i) => { m.scale.setScalar(easeOutBack(s(.76 + i * .006, .8 + i * .006))); });
      kids.forEach((m, i) => {
        const u = clamp((p - .82 - i * .012) / .12); m.visible = u > 0;
        if (u <= 0) return;
        const bp = bridge.getPoint(clamp(u)); const spot = m.userData.end, fin = seg(u, .8, 1);
        m.position.lerpVectors(bp, spot, ease(fin)); const walking = u < 1 ? 1 : 0;
        m.position.y += walking * Math.abs(Math.sin(t * 9 + i * 2)) * .05; m.lookAt(m.position.clone().add(bridge.getTangent(clamp(u)).multiplyScalar(-1).setY(0)));
        if (u >= 1) m.rotation.y = Math.PI * .5 + Math.sin(t + i) * .3;
      });
      village.windows.forEach(w => { w.emissiveIntensity = .25 + 1.6 * s(.75, .9); });
      frames.forEach((m, i) => { const a = easeOutBack(s(.86 + i * .022, .93 + i * .022)); m.scale.setScalar(a); m.position.set(-3.2 + (i - 2) * 1.15, 3.2 + Math.sin(i * 1.4) * .35 + Math.sin(t * 1.2 + i) * .08, 1.6 - Math.abs(i - 2) * .25); m.rotation.set(0, (i - 2) * -.18, Math.sin(i * 2.1) * .12); });

      clouds.forEach(c => { c.position.x += c.userData.v * .016; if (c.position.x > 12) c.position.x = -12; });
      fm.opacity = .4 + .3 * Math.sin(t * 1.5) + end * .2;
    },
    draw() { renderer.render(scene, camera); }
  };
}

let clock = 0, lastT = performance.now();
const stepEls = () => sec ? { panels: [...sec.querySelectorAll('.sp')], nodes: [...sec.querySelectorAll('.rn')], fill: sec.querySelector('.rfill'), warm: sec.querySelector('.warm'), hint: sec.querySelector('.story-hint') } : null;
let ui = null;

function progress() {
  const r = sec.getBoundingClientRect(), range = r.height - innerHeight;
  return range > 0 ? clamp(-r.top / range) : 0;
}

function frame(now) {
  requestAnimationFrame(frame);
  const rdt = (now - lastT) / 1000, dt = Math.min(.05, rdt); lastT = now;
  if (!ctx || !sec || !sec.isConnected || !visible || document.hidden) return;
  clock += reduced ? 0 : dt;
  const target = progress(); ps += (target - ps) * (reduced ? 1 : 1 - Math.exp(-Math.min(rdt, .3) * 9));
  if (Math.abs(target - ps) < .0005) ps = target;
  ctx.update(ps, clock); ctx.draw();
  if (!ui) return;
  const step = ps < .25 ? 0 : ps < .5 ? 1 : ps < .75 ? 2 : 3;
  if (step !== lastStep) { lastStep = step; ui.panels.forEach((el, i) => el.classList.toggle('on', i === step)); ui.nodes.forEach((el, i) => el.classList.toggle('on', i <= step)); ui.nodes.forEach((el, i) => el.classList.toggle('now', i === step)); }
  ui.fill.style.transform = `scaleX(${ps})`; ui.warm.style.opacity = seg(ps, .75, 1); ui.hint.style.opacity = 1 - seg(ps, 0, .04);
}

function fit() { const h = sec && sec.querySelector('.story-scene'); if (ctx && h && h.clientWidth) ctx.resize(h.clientWidth, h.clientHeight); }

function attach() {
  const el = document.querySelector('.story');
  if (!el) return;
  sec = el;
  if (!ctx) { try { ctx = build(); } catch (e) { console.warn('WebGL tidak tersedia untuk story', e); sec.classList.add('nogl'); return; } requestAnimationFrame(frame); }
  const host = sec.querySelector('.story-scene'); host.appendChild(ctx.renderer.domElement);
  ui = stepEls(); lastStep = -1;
  if (ro) ro.disconnect(); ro = new ResizeObserver(fit); ro.observe(host);
  if (io) io.disconnect(); io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }); io.observe(sec);
  fit();
}

A.acts.storyGo = d => {
  if (!sec) return;
  const r = sec.getBoundingClientRect(), range = r.height - innerHeight, top = scrollY + r.top;
  scrollTo({ top: top + range * ([.02, .27, .52, .78][+d.i] || 0), behavior: 'smooth' });
};
window.addEventListener('pointermove', e => { ptr.x = (e.clientX / innerWidth - .5) * 2; ptr.y = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
A.story3d = { attach };
attach();
