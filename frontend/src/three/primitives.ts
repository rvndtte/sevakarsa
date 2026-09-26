/* Objek 3D bersama: pulau melayang, rumah, pohon, awan, kampus, mahasiswa. */
import * as THREE from "three";
import { hash } from "./math";

type Rng = () => number;

export const mat = (
  color: THREE.ColorRepresentation,
  options: THREE.MeshStandardMaterialParameters = {},
) =>
  new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.9,
    metalness: 0,
    ...options,
  });

export function shadowed<T extends THREE.Mesh>(mesh: T, cast = true, receive = true): T {
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  return mesh;
}

/** Kerucut terbalik dengan permukaan bergelombang untuk dasar batu pulau. */
function rockyCone(radius: number, height: number, segments: number, amplitude: number) {
  const geometry = new THREE.ConeGeometry(radius, height, segments, 2);
  const p = geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const s = (y + height / 2) / height;
    p.setXYZ(
      i,
      x + (hash(x, y, z) - 0.5) * amplitude * s,
      y + (hash(z, x, y) - 0.5) * amplitude * 0.6 * s,
      z + (hash(y, z, x) - 0.5) * amplitude * s,
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function floatingBase(radius: number, depth: number, grass: string, amplitude: number) {
  const group = new THREE.Group();
  group.add(shadowed(new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.8, 32, 1), mat(grass)), false, true));
  const soil = shadowed(
    new THREE.Mesh(new THREE.CylinderGeometry(radius + 0.04, radius + 0.04, 0.22, 32, 1), mat("#5B4636")),
    false,
    false,
  );
  soil.position.y = -0.3;
  group.add(soil);
  const cone = new THREE.Mesh(rockyCone(radius + 0.05, depth, 10, amplitude), mat("#6B4F3A"));
  cone.rotation.x = Math.PI;
  cone.position.y = -0.4 - depth / 2 + 0.05;
  group.add(cone);
  return group;
}

export function house(x: number, z: number, rotation: number, roofColor: string, windows?: THREE.MeshStandardMaterial[]) {
  const group = new THREE.Group();
  const body = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.6, 0.8), mat("#F0DCC0")));
  body.position.y = 0.3;
  group.add(body);
  const roof = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.82, 0.6, 4), mat(roofColor)));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 0.9;
  group.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.04), mat("#6B3E2A"));
  door.position.set(-0.18, 0.16, 0.41);
  group.add(door);
  const windowMaterial = new THREE.MeshStandardMaterial({ color: "#FFE9A0", emissive: "#FFD25A", emissiveIntensity: 0.9 });
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.04), windowMaterial);
  win.position.set(0.22, 0.34, 0.41);
  group.add(win);
  windows?.push(windowMaterial);
  group.position.set(x, 0.4, z);
  group.rotation.y = rotation;
  return group;
}

export function tree(x: number, z: number, scale: number, conifer: boolean) {
  const group = new THREE.Group();
  const trunk = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.5, 6), mat("#6B4A33")));
  trunk.position.y = 0.25;
  group.add(trunk);
  if (conifer) {
    ([[0.42, 0.6, 0.7], [0.32, 0.5, 1.1]] as const).forEach(([radius, height, y]) => {
      const cone = shadowed(new THREE.Mesh(new THREE.ConeGeometry(radius, height, 7), mat(y > 0.9 ? "#3F7A55" : "#2C5A41")));
      cone.position.y = y;
      group.add(cone);
    });
  } else {
    const leaves = shadowed(new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), mat("#4C8C63")));
    leaves.position.y = 0.8;
    leaves.scale.set(1, 0.9, 1);
    group.add(leaves);
  }
  group.scale.setScalar(scale);
  group.position.set(x, 0.4, z);
  return group;
}

export function cloud(rng: Rng) {
  const group = new THREE.Group();
  const material = mat("#FFFFFF", { emissive: "#DDE9E2", emissiveIntensity: 0.35, transparent: true, opacity: 0.92 });
  for (let i = 0; i < 4; i++) {
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5 + rng() * 0.35, 1), material);
    blob.position.set(i * 0.55 - 0.8, (rng() - 0.5) * 0.25, (rng() - 0.5) * 0.3);
    blob.scale.y = 0.7;
    group.add(blob);
  }
  return group;
}

export function buildVillage(rng: Rng) {
  const island = floatingBase(5, 3.8, "#7DB287", 0.9);
  const windows: THREE.MeshStandardMaterial[] = [];

  ([[2.6, -2.4, 1.5], [0.4, -3.4, 1.2], [-3.6, 1.9, 1.3], [-1.1, 3.4, 1.1], [3.8, 2.7, 0.9]] as const).forEach(([x, z, s]) => {
    const mound = shadowed(new THREE.Mesh(new THREE.SphereGeometry(1, 8, 5), mat("#6FA57E")));
    mound.scale.set(s, s * 0.32, s * 0.9);
    mound.position.set(x, 0.4, z);
    island.add(mound);
  });

  // sawah berundak
  ([["#B8D45C", 2.1], ["#9CC24E", 1.6], ["#86B043", 1.1], ["#71A03A", 0.65]] as const).forEach(([color, radius], i) => {
    const terrace = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(radius, radius + 0.08, 0.22, 24), mat(color)));
    terrace.position.set(-1.7, 0.4 + 0.11 + i * 0.22, -0.9);
    island.add(terrace);
  });

  const houses = [
    [1.9, 0.4, 0.3, "#C0583A"],
    [3.1, -1.3, -0.5, "#B24B31"],
    [0.9, 2.3, 0.8, "#D06A45"],
    [2.9, 1.9, -0.2, "#C0583A"],
  ] as const;
  houses.forEach(([x, z, rotation, roof]) => island.add(house(x, z, rotation, roof, windows)));

  // pohon di area yang tidak menabrak rumah/sawah
  const taken: [number, number, number][] = houses.map(([x, z]) => [x, z, 1.1]);
  taken.push([-1.7, -0.9, 2.5]);
  for (let attempt = 0, placed = 0; attempt < 80 && placed < 17; attempt++) {
    const angle = rng() * Math.PI * 2;
    const distance = Math.sqrt(rng()) * 4.5;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    if (taken.some(([tx, tz, tr]) => Math.hypot(x - tx, z - tz) < tr)) continue;
    taken.push([x, z, 0.6]);
    island.add(tree(x, z, 0.7 + rng() * 0.5, placed % 3 === 0));
    placed++;
  }
  return { island, windows };
}

export function buildCampus() {
  const group = new THREE.Group();
  group.add(floatingBase(1.4, 1.8, "#8FC29A", 0.35));
  const hall = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.8), mat("#F6EFE0")));
  hall.position.y = 0.75;
  group.add(hall);
  const roof = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.55, 4), mat("#1F5138")));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 1.36;
  group.add(roof);
  for (let i = -1; i <= 1; i++) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8), mat("#FFFFFF"));
    column.position.set(i * 0.4, 0.7, 0.43);
    group.add(column);
  }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6), mat("#FFFFFF"));
  pole.position.set(0, 1.95, 0);
  group.add(pole);
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.24),
    new THREE.MeshBasicMaterial({ color: "#D8EC6E", side: THREE.DoubleSide }),
  );
  flag.position.set(0.2, 2.22, 0);
  group.add(flag);
  group.add(tree(0.85, -0.3, 0.55, false));
  group.scale.setScalar(0.85);
  return { group, flag };
}

export function student(color: string) {
  const group = new THREE.Group();
  const body = shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.18, 4, 8), mat(color, { flatShading: false })));
  body.position.y = 0.2;
  group.add(body);
  const head = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), mat("#E8B98F", { flatShading: false })));
  head.position.y = 0.42;
  group.add(head);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.088, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
    mat("#2B1D14", { flatShading: false }),
  );
  hair.position.y = 0.43;
  group.add(hair);
  const bag = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.17, 0.06), mat("#1F3D2C")));
  bag.position.set(0, 0.22, -0.11);
  group.add(bag);
  return group;
}
