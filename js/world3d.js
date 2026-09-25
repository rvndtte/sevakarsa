/* Komponen 3D bersama (pulau desa, kampus, pohon, awan) untuk hero & story */
import * as THREE from 'three';

export function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const hash = (x, y, z) => { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return s - Math.floor(s); };
export const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: .9, metalness: 0 }, o));
export const shadowed = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; return m; };

function rockyCone(r, h, seg, amp) {
  const g = new THREE.ConeGeometry(r, h, seg, 2), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), s = (y + h / 2) / h;
    p.setXYZ(i, x + (hash(x, y, z) - .5) * amp * s, y + (hash(z, x, y) - .5) * amp * .6 * s, z + (hash(y, z, x) - .5) * amp * s);
  }
  g.computeVertexNormals();
  return g;
}

export function floatingBase(r, depth, grass, amp) {
  const g = new THREE.Group();
  g.add(shadowed(new THREE.Mesh(new THREE.CylinderGeometry(r, r, .8, 32, 1), mat(grass)), false, true));
  const soil = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(r + .04, r + .04, .22, 32, 1), mat('#5B4636')), false, false);
  soil.position.y = -.3; g.add(soil);
  const cone = new THREE.Mesh(rockyCone(r + .05, depth, 10, amp), mat('#6B4F3A'));
  cone.rotation.x = Math.PI; cone.position.y = -.4 - depth / 2 + .05; g.add(cone);
  return g;
}

export function house(x, z, rot, roof, wins) {
  const g = new THREE.Group();
  const body = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.95, .6, .8), mat('#F0DCC0'))); body.position.y = .3; g.add(body);
  const r = shadowed(new THREE.Mesh(new THREE.ConeGeometry(.82, .6, 4), mat(roof)));
  r.rotation.y = Math.PI / 4; r.position.y = .9; g.add(r);
  const door = new THREE.Mesh(new THREE.BoxGeometry(.18, .32, .04), mat('#6B3E2A')); door.position.set(-.18, .16, .41); g.add(door);
  const wm = new THREE.MeshStandardMaterial({ color: '#FFE9A0', emissive: '#FFD25A', emissiveIntensity: .9 });
  const win = new THREE.Mesh(new THREE.BoxGeometry(.2, .18, .04), wm); win.position.set(.22, .34, .41); g.add(win);
  if (wins) wins.push(wm);
  g.position.set(x, .4, z); g.rotation.y = rot;
  return g;
}

export function tree(x, z, s, kind) {
  const g = new THREE.Group();
  const trunk = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.06, .09, .5, 6), mat('#6B4A33'))); trunk.position.y = .25; g.add(trunk);
  if (kind) {
    [[.42, .6, .7], [.32, .5, 1.1]].forEach(([rad, h, y]) => { const c = shadowed(new THREE.Mesh(new THREE.ConeGeometry(rad, h, 7), mat(y > .9 ? '#3F7A55' : '#2C5A41'))); c.position.y = y; g.add(c); });
  } else {
    const l = shadowed(new THREE.Mesh(new THREE.IcosahedronGeometry(.42, 0), mat('#4C8C63'))); l.position.y = .8; l.scale.set(1, .9, 1); g.add(l);
  }
  g.scale.setScalar(s); g.position.set(x, .4, z);
  return g;
}

export function cloud(rng) {
  const g = new THREE.Group(), m = mat('#FFFFFF', { emissive: '#DDE9E2', emissiveIntensity: .35, transparent: true, opacity: .92 });
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(.5 + rng() * .35, 1), m); b.position.set(i * .55 - .8, (rng() - .5) * .25, (rng() - .5) * .3); b.scale.y = .7; g.add(b); }
  return g;
}

export function buildVillage(rng) {
  const island = floatingBase(5, 3.8, '#7DB287', .9), windows = [];
  [[2.6, -2.4, 1.5], [.4, -3.4, 1.2], [-3.6, 1.9, 1.3], [-1.1, 3.4, 1.1], [3.8, 2.7, .9]].forEach(([x, z, s]) => {
    const m = shadowed(new THREE.Mesh(new THREE.SphereGeometry(1, 8, 5), mat('#6FA57E'))); m.scale.set(s, s * .32, s * .9); m.position.set(x, .4, z); island.add(m);
  });
  [['#B8D45C', 2.1], ['#9CC24E', 1.6], ['#86B043', 1.1], ['#71A03A', .65]].forEach(([c, r], i) => {
    const t = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(r, r + .08, .22, 24), mat(c)));
    t.position.set(-1.7, .4 + .11 + i * .22, -.9); island.add(t);
  });
  const houses = [[1.9, .4, .3, '#C0583A'], [3.1, -1.3, -.5, '#B24B31'], [.9, 2.3, .8, '#D06A45'], [2.9, 1.9, -.2, '#C0583A']];
  houses.forEach(h => island.add(house(h[0], h[1], h[2], h[3], windows)));
  const taken = houses.map(h => [h[0], h[1], 1.1]).concat([[-1.7, -.9, 2.5]]);
  for (let n = 0, placed = 0; n < 80 && placed < 17; n++) {
    const a = rng() * Math.PI * 2, d = Math.sqrt(rng()) * 4.5, x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (taken.some(([tx, tz, tr]) => Math.hypot(x - tx, z - tz) < tr)) continue;
    taken.push([x, z, .6]); island.add(tree(x, z, .7 + rng() * .5, placed % 3 === 0 ? 1 : 0)); placed++;
  }
  return { island, windows };
}

export function buildCampus() {
  const campus = new THREE.Group();
  campus.add(floatingBase(1.4, 1.8, '#8FC29A', .35));
  const hall = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.2, .7, .8), mat('#F6EFE0'))); hall.position.y = .75; campus.add(hall);
  const roof = shadowed(new THREE.Mesh(new THREE.ConeGeometry(.95, .55, 4), mat('#1F5138'))); roof.rotation.y = Math.PI / 4; roof.position.y = 1.36; campus.add(roof);
  for (let i = -1; i <= 1; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .6, 8), mat('#FFFFFF')); c.position.set(i * .4, .7, .43); campus.add(c); }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .8, 6), mat('#FFFFFF')); pole.position.set(0, 1.95, 0); campus.add(pole);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(.4, .24), new THREE.MeshBasicMaterial({ color: '#D8EC6E', side: THREE.DoubleSide })); flag.position.set(.2, 2.22, 0); campus.add(flag);
  campus.add(tree(.85, -.3, .55, 0));
  campus.scale.setScalar(.85); campus.userData.flag = flag;
  return campus;
}

export function student(color) {
  const g = new THREE.Group();
  const body = shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(.09, .18, 4, 8), mat(color, { flatShading: false }))); body.position.y = .2; g.add(body);
  const head = shadowed(new THREE.Mesh(new THREE.SphereGeometry(.085, 12, 10), mat('#E8B98F', { flatShading: false }))); head.position.y = .42; g.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.088, 12, 8, 0, Math.PI * 2, 0, Math.PI * .5), mat('#2B1D14', { flatShading: false })); hair.position.y = .43; g.add(hair);
  const bag = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.13, .17, .06), mat('#1F3D2C'))); bag.position.set(0, .22, -.11); g.add(bag);
  return g;
}
