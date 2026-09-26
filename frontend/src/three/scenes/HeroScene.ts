/* Hero: pulau desa low-poly melayang dan jalur kolaborasi ke kampus. */
import * as THREE from "three";
import { createRenderer, disposeScene, pointer, type SceneController, type SceneOptions } from "../controller";
import { easeOutBack, lerp, mulberry32 } from "../math";
import { buildCampus, buildVillage, cloud } from "../primitives";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export function createHeroScene({ reducedMotion }: SceneOptions): SceneController {
  const renderer = createRenderer(true);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const rng = mulberry32(11);
  const smooth = { x: 0, y: 0 };

  /* pencahayaan */
  scene.add(new THREE.HemisphereLight(0xdff3e6, 0x5a6b55, 1.25));
  const sun = new THREE.DirectionalLight(0xfff0cc, 2.8);
  sun.position.set(7, 11, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
  sun.shadow.bias = -0.0006;
  sun.shadow.radius = 4;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xd8ec6e, 0.9);
  rim.position.set(-7, 3, -6);
  scene.add(rim);

  /* matahari dengan halo */
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 16), new THREE.MeshBasicMaterial({ color: "#FFF3B0" }));
  orb.position.set(2.2, 4.2, -9);
  ([[1.5, 0.16], [2.3, 0.07]] as const).forEach(([scale, opacity]) => {
    orb.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.9 * scale, 24, 16),
        new THREE.MeshBasicMaterial({ color: "#FFF3B0", transparent: true, opacity, depthWrite: false }),
      ),
    );
  });
  scene.add(orb);

  /* dunia: pulau desa + kampus */
  const world = new THREE.Group();
  scene.add(world);
  const island = buildVillage(rng).island;
  world.add(island);
  const campus = buildCampus();
  campus.group.position.set(-4.7, 3.7, -1.2);
  world.add(campus.group);

  /* jalur kolaborasi + titik yang mengalir */
  const curve = new THREE.CatmullRomCurve3([V(2.0, 1.8, 0.4), V(-0.6, 4.9, 0.3), V(-3.9, 3.9, -1.0)]);
  world.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(curve, 60, 0.022, 6),
      new THREE.MeshBasicMaterial({ color: "#D8EC6E", transparent: true, opacity: 0.4 }),
    ),
  );
  const dotMaterial = new THREE.MeshBasicMaterial({ color: "#D8EC6E" });
  const dotGeometry = new THREE.SphereGeometry(0.085, 10, 8);
  const dots = Array.from({ length: 9 }, () => {
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    world.add(dot);
    return dot;
  });

  /* pin lokasi di desa */
  const pin = new THREE.Group();
  pin.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), dotMaterial));
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.34, 12), dotMaterial);
  tip.rotation.x = Math.PI;
  tip.position.y = -0.26;
  pin.add(tip);
  pin.position.set(2.2, 2.7, 0.4);
  world.add(pin);

  /* awan yang berjalan dan memudar di tepi */
  const clouds = ([[-7, 5.2, -4, 0.8], [6.5, 3.2, -5, 1], [-2, 6.2, -6, 0.7], [7, -1.5, -3, 0.6]] as const).map(
    ([x, y, z, s], i) => {
      const c = cloud(rng);
      c.traverse((o) => {
        if (o instanceof THREE.Mesh) o.material = (o.material as THREE.Material).clone();
      });
      c.position.set(x, y, z);
      c.scale.setScalar(s);
      scene.add(c);
      return { group: c, speed: 0.12 + i * 0.03 };
    },
  );

  /* kunang-kunang */
  const count = 70;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rng() - 0.5) * 13;
    positions[i * 3 + 1] = (rng() - 0.5) * 8 + 1;
    positions[i * 3 + 2] = (rng() - 0.5) * 7;
  }
  const flyGeometry = new THREE.BufferGeometry();
  flyGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const flyMaterial = new THREE.PointsMaterial({ color: 0xd8ec6e, size: 0.07, transparent: true, opacity: 0.8, depthWrite: false });
  const fireflies = new THREE.Points(flyGeometry, flyMaterial);
  scene.add(fireflies);

  return {
    renderer,
    resize(w, h) {
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const dist = Math.max(5.9 / (t * aspect), 5.4 / t);
      camera.position.set(0, dist * 0.3, dist);
      camera.lookAt(0, 1.1, 0);
    },
    render(t) {
      smooth.x = lerp(smooth.x, pointer.x, 0.05);
      smooth.y = lerp(smooth.y, pointer.y, 0.05);
      const intro = reducedMotion ? 1 : Math.min(1, t / 1.8);
      world.scale.setScalar(0.55 + 0.45 * easeOutBack(intro, 1.5));
      world.rotation.y = -0.42 + Math.sin(t * 0.2) * 0.14 + smooth.x * 0.4 + (1 - intro) * 1.4 + window.scrollY * 0.0004;
      world.rotation.x = smooth.y * 0.07;
      island.position.y = Math.sin(t * 0.9) * 0.12;
      campus.group.position.y = 3.7 + Math.sin(t * 1.1 + 1) * 0.16;
      campus.group.rotation.y = Math.sin(t * 0.4) * 0.25;
      campus.flag.rotation.y = Math.sin(t * 3) * 0.35;
      dots.forEach((dot, i) => {
        const u = (t * 0.09 + i / dots.length) % 1;
        dot.position.copy(curve.getPoint(u));
        dot.scale.setScalar(0.7 + 0.5 * Math.sin(u * Math.PI));
      });
      pin.position.y = 2.7 + Math.sin(t * 2) * 0.1;
      pin.rotation.y = t * 0.8;
      clouds.forEach(({ group, speed }) => {
        group.position.x += speed * 0.016;
        if (group.position.x > 9) group.position.x = -9;
        const fade = Math.min(1, Math.max(0, (8.6 - Math.abs(group.position.x)) / 2.2));
        group.traverse((o) => {
          if (o instanceof THREE.Mesh) (o.material as THREE.MeshStandardMaterial).opacity = 0.92 * fade;
        });
      });
      fireflies.rotation.y = t * 0.02;
      flyMaterial.opacity = 0.55 + 0.3 * Math.sin(t * 1.6);
      renderer.render(scene, camera);
    },
    dispose: () => disposeScene(scene, renderer),
  };
}
