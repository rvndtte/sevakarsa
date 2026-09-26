/* Section Permasalahan: hamparan desa, desa tertinggal, mahasiswa tak tersalurkan, jembatan putus. */
import * as THREE from "three";
import { createRenderer, disposeScene, pointer, type SceneController, type SceneFactory } from "../controller";
import { lerp, mulberry32 } from "../math";
import { buildCampus, floatingBase, mat, tree } from "../primitives";

/** Posisi kamera [x, y, z, targetX, targetY, targetZ] untuk tiap slide. */
const CAMERAS: readonly number[][] = [
  [0, 10.5, 17, 0, 0, 0],
  [6, 9, 13.5, 0, 0, 0],
  [-3, 7.5, 18, -2.5, 1.5, 0],
  [-3, 7.5, 18, -2.5, 1.5, 0],
];

/** @param getSlide membaca slide aktif (0–3) yang diubah oleh carousel. */
export function createProblemScene(getSlide: () => number): SceneFactory {
  return ({ reducedMotion }): SceneController => {
    const renderer = createRenderer(false);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 120);
    const rng = mulberry32(7);
    const smooth = { x: 0, y: 0 };

    scene.add(new THREE.HemisphereLight(0xdff3e6, 0x39503f, 1.3));
    const sun = new THREE.DirectionalLight(0xfff0cc, 2.6);
    sun.position.set(8, 14, 8);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xd8ec6e, 0.8);
    rim.position.set(-8, 4, -6);
    scene.add(rim);

    const world = new THREE.Group();
    scene.add(world);
    world.add(floatingBase(8.4, 5, "#6FA57E", 1.3));

    /* hamparan rumah (instanced) */
    const points: [number, number, number][] = [];
    for (let gx = -7; gx <= 7; gx += 1.45) {
      for (let gz = -7; gz <= 7; gz += 1.45) {
        const x = gx + (rng() - 0.5) * 0.6;
        const z = gz + (rng() - 0.5) * 0.6;
        if (Math.hypot(x, z) < 7.6) points.push([x, z, rng() * Math.PI]);
      }
    }
    const count = points.length;
    const bodyMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.45, 0.6), mat("#FFFFFF"), count);
    const roofMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(0.6, 0.42, 4), mat("#FFFFFF"), count);
    const flagged = new Set<number>();
    while (flagged.size < Math.round(count * 0.14)) flagged.add(Math.floor(rng() * count));

    const dummy = new THREE.Object3D();
    const bodyColor = new THREE.Color();
    const roofColor = new THREE.Color();
    const baseBody = new THREE.Color("#F0DCC0");
    const baseRoof = new THREE.Color("#C0583A");
    const dimBody = new THREE.Color("#8C8578");
    const dimRoof = new THREE.Color("#5E4A40");
    points.forEach(([x, z, r], i) => {
      dummy.position.set(x, 0.62, z);
      dummy.rotation.set(0, r, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      bodyMesh.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 1.05, z);
      dummy.rotation.set(0, r + Math.PI / 4, 0);
      dummy.updateMatrix();
      roofMesh.setMatrixAt(i, dummy.matrix);
      bodyMesh.setColorAt(i, baseBody);
      roofMesh.setColorAt(i, baseRoof);
    });
    world.add(bodyMesh, roofMesh);
    for (let i = 0; i < 26; i++) {
      const a = rng() * 6.28;
      const d = 2 + rng() * 5.5;
      world.add(tree(Math.cos(a) * d, Math.sin(a) * d, 0.6 + rng() * 0.4, i % 3 === 0));
    }

    /* penanda desa tertinggal */
    const beaconMaterial = new THREE.MeshBasicMaterial({ color: "#FFB86B", transparent: true, opacity: 0.9 });
    const beaconGeometry = new THREE.ConeGeometry(0.16, 0.5, 8);
    const beacons = [...flagged].map((i) => {
      const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial);
      beacon.rotation.x = Math.PI;
      beacon.position.set(points[i][0], 2.1, points[i][1]);
      beacon.visible = false;
      world.add(beacon);
      return beacon;
    });

    /* kampus + jalur ke desa (bersegmen agar bisa "putus") */
    const campus = buildCampus();
    campus.group.position.set(-8.6, 4.6, 1);
    campus.group.scale.setScalar(1.5);
    world.add(campus.group);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-7.4, 4, 1),
      new THREE.Vector3(-4.6, 6.4, 1.4),
      new THREE.Vector3(-1, 5, 1),
      new THREE.Vector3(1.6, 1.8, 0.6),
    ]);
    const lineMaterial = new THREE.MeshBasicMaterial({ color: "#D8EC6E", transparent: true, opacity: 0.55 });
    const segments = Array.from({ length: 12 }, (_, i) => {
      const a = i / 12;
      const b = (i + 0.6) / 12;
      const pts = [0, 0.2, 0.4, 0.6, 0.8, 1].map((k) => curve.getPoint(lerp(a, b, k)));
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.05, 6), lineMaterial);
      world.add(mesh);
      return { mesh, index: i };
    });
    const cross = new THREE.Group();
    const crossMaterial = new THREE.MeshBasicMaterial({ color: "#FF7A66" });
    [0.7, -0.7].forEach((rotation) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.18, 0.18), crossMaterial);
      bar.rotation.z = rotation;
      cross.add(bar);
    });
    cross.position.copy(curve.getPoint(0.55));
    cross.position.y += 0.1;
    world.add(cross);

    /* mahasiswa (partikel): sebagian besar menyimpang dan memudar */
    const P = 170;
    const studentPos = new Float32Array(P * 3);
    const studentCol = new Float32Array(P * 3);
    const seeds = Array.from({ length: P }, () => ({
      offset: rng(),
      lost: rng() < 0.82,
      dx: (rng() - 0.5) * 5,
      dy: rng() * 4 + 1,
      dz: (rng() - 0.5) * 4,
    }));
    const studentGeometry = new THREE.BufferGeometry();
    studentGeometry.setAttribute("position", new THREE.BufferAttribute(studentPos, 3));
    studentGeometry.setAttribute("color", new THREE.BufferAttribute(studentCol, 3));
    world.add(
      new THREE.Points(
        studentGeometry,
        new THREE.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, depthWrite: false }),
      ),
    );
    const tmp = new THREE.Vector3();
    const lime = new THREE.Color("#D8EC6E");

    /* debu cahaya latar */
    const F = 60;
    const dustPos = new Float32Array(F * 3);
    for (let i = 0; i < F; i++) {
      dustPos[i * 3] = (rng() - 0.5) * 30;
      dustPos[i * 3 + 1] = rng() * 10 - 1;
      dustPos[i * 3 + 2] = (rng() - 0.5) * 20;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    scene.add(
      new THREE.Points(
        dustGeometry,
        new THREE.PointsMaterial({ color: 0xd8ec6e, size: 0.07, transparent: true, opacity: 0.55, depthWrite: false }),
      ),
    );

    const state = { dim: 0, students: 0, broken: 0, cam: [...CAMERAS[0]], fit: 1 };
    const look = new THREE.Vector3();
    let lastDim = -1;

    return {
      renderer,
      resize(w, h) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        state.fit = Math.max(1, (1.15 / Math.min(1.6, camera.aspect)) * 0.9);
      },
      render(t) {
        const slide = getSlide();
        smooth.x = lerp(smooth.x, pointer.x, 0.05);
        smooth.y = lerp(smooth.y, pointer.y, 0.05);
        const k = reducedMotion ? 1 : 0.045;
        const target = CAMERAS[slide];
        state.dim = lerp(state.dim, slide >= 1 ? 1 : 0, k);
        state.students = lerp(state.students, slide >= 2 ? 1 : 0, k);
        state.broken = lerp(state.broken, slide === 3 ? 1 : 0, k);
        for (let i = 0; i < 6; i++) state.cam[i] = lerp(state.cam[i], target[i], k);
        camera.position.set(state.cam[0] * state.fit + smooth.x * 0.8, state.cam[1] * state.fit - smooth.y * 0.5, state.cam[2] * state.fit);
        look.set(state.cam[3], state.cam[4], state.cam[5]);
        camera.lookAt(look);
        world.rotation.y = reducedMotion ? 0 : Math.sin(t * 0.12) * 0.18 + t * 0.015;

        if (Math.abs(state.dim - lastDim) > 0.004) {
          lastDim = state.dim;
          points.forEach((_, i) => {
            const f = flagged.has(i) ? state.dim : 0;
            bodyMesh.setColorAt(i, bodyColor.copy(baseBody).lerp(dimBody, f));
            roofMesh.setColorAt(i, roofColor.copy(baseRoof).lerp(dimRoof, f));
          });
          if (bodyMesh.instanceColor) bodyMesh.instanceColor.needsUpdate = true;
          if (roofMesh.instanceColor) roofMesh.instanceColor.needsUpdate = true;
        }
        beacons.forEach((b, i) => {
          b.visible = state.dim > 0.3;
          b.scale.setScalar(state.dim * (0.85 + 0.25 * Math.sin(t * 3 + i)));
          b.position.y = 2.1 + Math.sin(t * 2.4 + i) * 0.15;
        });
        campus.group.visible = state.students > 0.02;
        campus.group.scale.setScalar(1.5 * state.students);
        campus.group.position.y = 4.6 + Math.sin(t * 1.1) * 0.2;
        campus.group.rotation.y = Math.sin(t * 0.4) * 0.3;
        segments.forEach(({ mesh, index }) => {
          const gap = state.broken > 0.5 && index >= 5 && index <= 7;
          mesh.visible = state.students > 0.05 && !gap;
        });
        lineMaterial.opacity = 0.55 * state.students;
        cross.visible = state.broken > 0.3;
        cross.scale.setScalar(state.broken * (1 + 0.12 * Math.sin(t * 5)));
        cross.rotation.y = t;

        for (let i = 0; i < P; i++) {
          const s = seeds[i];
          const p = (t * 0.07 + s.offset) % 1;
          const drift = s.lost ? Math.max(0, p - 0.4) / 0.6 : 0;
          curve.getPoint(Math.min(1, s.lost ? p * 0.75 : p), tmp);
          studentPos[i * 3] = tmp.x + s.dx * drift * drift;
          studentPos[i * 3 + 1] = tmp.y + s.dy * drift * drift;
          studentPos[i * 3 + 2] = tmp.z + s.dz * drift;
          const visibility = state.students * (s.lost ? 1 - drift : 1) * (state.broken > 0.5 && p > 0.48 && p < 0.62 ? 0.2 : 1);
          studentCol[i * 3] = lime.r * visibility;
          studentCol[i * 3 + 1] = lime.g * visibility;
          studentCol[i * 3 + 2] = lime.b * visibility;
        }
        studentGeometry.attributes.position.needsUpdate = true;
        studentGeometry.attributes.color.needsUpdate = true;
        renderer.render(scene, camera);
      },
      dispose: () => disposeScene(scene, renderer),
    };
  };
}
