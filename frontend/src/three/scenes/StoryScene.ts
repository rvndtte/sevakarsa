/**
 * Story: alur kerja platform yang berjalan mengikuti scroll (progress 0–1).
 * 0–.25 kebutuhan desa muncul · .25–.5 kampus datang & mengajukan · .5–.75 kontak dan
 * kesepakatan · .75–1 kerja sama aktif, jembatan terbentuk, dokumentasi.
 */
import * as THREE from "three";
import { createRenderer, disposeScene, pointer, type SceneController, type SceneFactory } from "../controller";
import { clamp, ease, easeOutBack, mulberry32, seg } from "../math";
import { buildCampus, buildVillage, cloud, mat, shadowed, student } from "../primitives";
import {
  createCard,
  createLabel,
  paperTexture,
  photoTexture,
  repaintCard,
  setCardState,
  type NeedCard,
} from "./story/textures";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const NEEDS: (NeedCard & { pos: THREE.Vector3 })[] = [
  { title: "Perbaikan irigasi", subtitle: "Butuh: Teknik Sipil, Pertanian", pos: V(-1.5, 3.9, 1.3) },
  { title: "Air bersih", subtitle: "Butuh: Kesehatan Lingkungan", pos: V(-4.7, 4.3, 0.9) },
  { title: "Literasi digital", subtitle: "Butuh: Informatika, Pendidikan", pos: V(-5.8, 2.7, 1.5) },
  { title: "Promosi UMKM", subtitle: "Butuh: Manajemen, Desain", pos: V(-3.0, 5.5, 0.2) },
];

/** [progress, posisi kamera, target kamera] */
const CAMERA_KEYS: readonly [number, THREE.Vector3, THREE.Vector3][] = [
  [0, V(-4.4, 3.5, 8.6), V(-3.4, 1.7, 0)],
  [0.25, V(-2.0, 3.8, 10.6), V(-2.0, 1.9, 0)],
  [0.5, V(0.5, 4.8, 13.8), V(0.6, 2.3, -0.4)],
  [0.75, V(0.2, 4.6, 13.2), V(0.4, 2.1, -0.4)],
  [1, V(0.3, 4.1, 12.4), V(0.5, 2.0, -0.3)],
];

const CONFETTI_COUNT = 150;

/** @param getProgress membaca progres scroll (0–1) yang sudah dihaluskan. */
export function createStoryScene(getProgress: () => number): SceneFactory {
  return (): SceneController => {
    const renderer = createRenderer(true);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1.7, 0.1, 100);
    const rng = mulberry32(5);
    const smooth = { x: 0, y: 0 };

    /* cahaya & matahari */
    scene.add(new THREE.HemisphereLight(0xdff3e6, 0x5a6b55, 1.2));
    const sun = new THREE.DirectionalLight(0xfff0cc, 2.7);
    sun.position.set(8, 12, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 9, bottom: -9, near: 1, far: 40 });
    sun.shadow.bias = -0.0006;
    sun.shadow.radius = 4;
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xd8ec6e, 0.8);
    rim.position.set(-8, 3, -6);
    scene.add(rim);
    const orbMaterial = new THREE.MeshBasicMaterial({ color: "#FFF3B0" });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 16), orbMaterial);
    orb.position.set(9, 5.6, -24);
    ([[1.6, 0.14], [2.6, 0.06]] as const).forEach(([scale, opacity]) =>
      orb.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(1.1 * scale, 24, 16),
          new THREE.MeshBasicMaterial({ color: "#FFF3B0", transparent: true, opacity, depthWrite: false }),
        ),
      ),
    );
    scene.add(orb);

    /* desa & kampus */
    const village = buildVillage(rng);
    const island = village.island;
    island.scale.setScalar(0.8);
    island.position.set(-3.2, 0, 0);
    scene.add(island);
    const campus = buildCampus();
    campus.group.scale.setScalar(0.95);
    scene.add(campus.group);
    const CAMPUS_END = V(4.3, 2.3, -1.6);
    const CAMPUS_START = V(15, 7, -8);
    const clouds = ([[-9, 6, -6, 0.9], [9, 4.5, -7, 1.1], [0, 7.5, -9, 0.8], [-6, -1.5, -2, 0.6]] as const).map(([x, y, z, s], i) => {
      const c = cloud(rng);
      c.position.set(x, y, z);
      c.scale.setScalar(s);
      scene.add(c);
      return { group: c, speed: 0.1 + i * 0.03 };
    });

    /* jalur penghubung yang tergambar bertahap */
    const link = new THREE.CatmullRomCurve3([V(-1.5, 1.4, 0.3), V(1.1, 4.7, -0.4), V(3.5, 3.0, -1.4)]);
    const tubeGeometry = new THREE.TubeGeometry(link, 64, 0.03, 6);
    const tubeIndexCount = tubeGeometry.index?.count ?? 0;
    const tube = new THREE.Mesh(tubeGeometry, new THREE.MeshBasicMaterial({ color: "#D8EC6E", transparent: true, opacity: 0.55 }));
    scene.add(tube);
    const mid = link.getPoint(0.5);

    /* sinyal dari desa: pancaran + gelombang */
    const beamMaterial = new THREE.MeshBasicMaterial({ color: "#D8EC6E", transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 1, 16, 1, true), beamMaterial);
    const beamBase = V(-4.55, 0.75, -0.72);
    scene.add(beam);
    const waves = Array.from({ length: 3 }, () => {
      const wave = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.03, 6, 48),
        new THREE.MeshBasicMaterial({ color: "#D8EC6E", transparent: true, opacity: 0, depthWrite: false }),
      );
      wave.rotation.x = Math.PI / 2;
      wave.position.copy(beamBase);
      scene.add(wave);
      return wave;
    });

    /* kartu kebutuhan */
    const cards = NEEDS.map((need, i) => {
      const card = createCard(need, i * 1.7);
      scene.add(card.sprite);
      return card;
    });

    /* cincin hitung mundur + label tahap */
    const ringGeometry = new THREE.RingGeometry(1.5, 1.68, 96, 1);
    const ringGroup = new THREE.Group();
    ringGroup.position.copy(mid);
    const ringBackground = new THREE.Mesh(
      new THREE.RingGeometry(1.5, 1.68, 96, 1),
      new THREE.MeshBasicMaterial({ color: "#FFFFFF", transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }),
    );
    const ringMaterial = new THREE.MeshBasicMaterial({ color: "#D99A21", transparent: true, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ringGroup.add(ringBackground, ring);
    ringGroup.visible = false;
    scene.add(ringGroup);

    const labels = [
      createLabel("Kontak · WhatsApp", "#FBEFD0", "#8A5F0A", 440),
      createLabel("Kesepakatan koordinator", "#DDEAF3", "#2B6388", 440),
      createLabel("Kesepakatan sesuai", "#D8EC6E", "#0B1F16", 460),
    ];
    const [labelContact, labelAgreement, labelOk] = labels;
    labels.forEach(({ sprite }) => {
      sprite.position.copy(mid).add(V(0, -2.15, 0));
      sprite.material.opacity = 0;
      sprite.visible = false;
      scene.add(sprite);
    });

    /* kertas & dokumen kesepakatan yang berpindah di jalur */
    const paperMap = paperTexture("#D99A21");
    const agreementMap = paperTexture("#8FB51F");
    const papers = Array.from({ length: 4 }, () => {
      const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.63), new THREE.MeshBasicMaterial({ map: paperMap, side: THREE.DoubleSide, transparent: true, toneMapped: false }));
      paper.visible = false;
      scene.add(paper);
      return paper;
    });
    const agreement = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.2), new THREE.MeshBasicMaterial({ map: agreementMap, side: THREE.DoubleSide, transparent: true, toneMapped: false }));
    agreement.visible = false;
    scene.add(agreement);

    /* konfeti perayaan */
    const cPos = new Float32Array(CONFETTI_COUNT * 3);
    const cCol = new Float32Array(CONFETTI_COUNT * 3);
    const cVel: THREE.Vector3[] = [];
    const palette = ["#D8EC6E", "#FBEFD0", "#FFFFFF", "#2F8F5B", "#D99A21"].map((c) => new THREE.Color(c));
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const angle = rng() * Math.PI * 2;
      const u = rng();
      const speed = 2 + rng() * 3.2;
      cVel.push(V(Math.cos(angle) * Math.sqrt(1 - u * u) * speed, 1.8 + u * speed * 0.8, Math.sin(angle) * Math.sqrt(1 - u * u) * speed));
      const c = palette[i % 5];
      cCol.set([c.r, c.g, c.b], i * 3);
    }
    const confettiGeometry = new THREE.BufferGeometry();
    confettiGeometry.setAttribute("position", new THREE.BufferAttribute(cPos, 3));
    confettiGeometry.setAttribute("color", new THREE.BufferAttribute(cCol, 3));
    const confettiMaterial = new THREE.PointsMaterial({ size: 0.13, vertexColors: true, transparent: true, depthWrite: false });
    const confetti = new THREE.Points(confettiGeometry, confettiMaterial);
    confetti.frustumCulled = false;
    confetti.visible = false;
    scene.add(confetti);

    /* jembatan, mahasiswa yang menyeberang, dan bingkai dokumentasi */
    const bridge = new THREE.CatmullRomCurve3([V(3.1, 2.65, -1.35), V(1.7, 2.2, -1.0), V(0.3, 0.6, -0.7)]);
    const planks = Array.from({ length: 16 }, (_, i) => {
      const plank = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.07, 0.34), mat(i % 2 ? "#C79A6A" : "#B5895A")));
      const u = i / 15;
      plank.position.copy(bridge.getPoint(u));
      plank.lookAt(plank.position.clone().add(bridge.getTangent(u)));
      plank.rotateY(Math.PI / 2);
      plank.scale.setScalar(0);
      scene.add(plank);
      return plank;
    });
    const kids = ["#D99A21", "#3B7EA8", "#C9483C", "#7D5FB0", "#2F8F5B", "#F2C94C"].map((color, i) => {
      const group = student(color);
      group.scale.setScalar(1.15);
      group.visible = false;
      scene.add(group);
      return { group, end: V(-0.55 + (i % 3) * 0.5, 0.4, 0.35 + Math.floor(i / 3) * 0.5) };
    });
    const frames = Array.from({ length: 5 }, (_, i) => {
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.76), new THREE.MeshBasicMaterial({ map: photoTexture(i), side: THREE.DoubleSide, transparent: true, toneMapped: false }));
      frame.scale.setScalar(0);
      scene.add(frame);
      return frame;
    });

    /* kunang-kunang */
    const dustCount = 60;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (rng() - 0.5) * 20;
      dustPos[i * 3 + 1] = (rng() - 0.5) * 9 + 2;
      dustPos[i * 3 + 2] = (rng() - 0.5) * 8 - 1;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMaterial = new THREE.PointsMaterial({ color: 0xd8ec6e, size: 0.07, transparent: true, opacity: 0.7, depthWrite: false });
    scene.add(new THREE.Points(dustGeometry, dustMaterial));

    /* font ditunggu dulu agar teks kartu tidak berganti gaya */
    document.fonts?.ready.then(() => {
      cards.forEach(repaintCard);
      labels.forEach((l) => l.repaint());
    });

    const warm = new THREE.Color("#FFB86B");
    const cool = new THREE.Color("#FFF0CC");
    const tint = new THREE.Color();
    const camPos = V(0, 0, 0);
    const camTarget = V(0, 0, 0);
    const parallax = V(0, 0, 0);
    const badgeSpot = V(-3.0, 5.3, 0.5);

    const showLabel = (l: typeof labelOk, alpha: number) => {
      l.sprite.visible = alpha > 0.01;
      l.sprite.material.opacity = alpha;
    };

    return {
      renderer,
      resize(w, h) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        if (w / h > 1.15) camera.setViewOffset(w, h, -w * 0.17, h * 0.02, w, h);
        else camera.setViewOffset(w, h, 0, h * 0.1, w, h);
        camera.updateProjectionMatrix();
      },
      render(t) {
        const p = getProgress();
        const s = (a: number, b: number) => seg(p, a, b);
        smooth.x += (pointer.x - smooth.x) * 0.05;
        smooth.y += (pointer.y - smooth.y) * 0.05;

        /* kamera menyusuri keyframe */
        let k = 0;
        while (k < CAMERA_KEYS.length - 2 && p > CAMERA_KEYS[k + 1][0]) k++;
        const f = ease(seg(p, CAMERA_KEYS[k][0], CAMERA_KEYS[k + 1][0]));
        camTarget.lerpVectors(CAMERA_KEYS[k][2], CAMERA_KEYS[k + 1][2], f);
        camPos.lerpVectors(CAMERA_KEYS[k][1], CAMERA_KEYS[k + 1][1], f);
        const factor = camera.aspect > 1.15 ? Math.max(1, 1.75 / camera.aspect) * 1.3 : 2.5;
        camPos.sub(camTarget).multiplyScalar(factor).add(camTarget);
        const orbit = s(0.8, 1) * 0.5;
        camPos.sub(camTarget).applyAxisAngle(V(0, 1, 0), -orbit * 0.6).add(camTarget);
        camera.position.copy(camPos).add(parallax.set(smooth.x * 0.5, -smooth.y * 0.3, 0));
        camera.lookAt(camTarget);

        /* langit menghangat di akhir */
        const end = s(0.75, 1);
        tint.copy(cool).lerp(warm, end);
        sun.color.copy(tint);
        orbMaterial.color.copy(tint);
        sun.intensity = 2.7 - end * 0.5;

        island.position.y = Math.sin(t * 0.8) * 0.1;

        /* 1: sinyal dari desa */
        const beamHeight = ease(s(0, 0.07)) * 7;
        beam.visible = beamHeight > 0.01 && p < 0.5;
        beam.scale.set(1, Math.max(0.001, beamHeight), 1);
        beam.position.set(beamBase.x, beamBase.y + beamHeight / 2, beamBase.z);
        beamMaterial.opacity = 0.22 * (1 - s(0.4, 0.5));
        waves.forEach((wave, i) => {
          const u = (t * 0.45 + i / 3) % 1;
          wave.visible = beam.visible;
          wave.scale.setScalar(0.3 + u * 2.6);
          (wave.material as THREE.MeshBasicMaterial).opacity = (1 - u) * 0.5 * (1 - s(0.4, 0.5));
        });

        /* 2: kampus terbang datang, jalur tergambar */
        const arrive = easeOutBack(s(0.22, 0.4));
        campus.group.visible = p > 0.215;
        campus.group.position.lerpVectors(CAMPUS_START, CAMPUS_END, ease(s(0.22, 0.4)));
        campus.group.position.y += Math.sin(Math.PI * s(0.22, 0.4)) * 2 + Math.sin(t * 1.1) * 0.12;
        campus.group.rotation.y = (1 - arrive) * -1.2 + Math.sin(t * 0.4) * 0.1;
        campus.flag.rotation.y = Math.sin(t * 3) * 0.35;
        tubeGeometry.setDrawRange(0, Math.floor(ease(s(0.34, 0.44)) * (tubeIndexCount / 36)) * 36);
        tube.visible = p > 0.34;

        /* kartu: satu dipilih, lainnya terkunci lalu memudar */
        const lockT = s(0.43, 0.47);
        const pick = ease(s(0.43, 0.53));
        const toBadge = ease(s(0.75, 0.82));
        cards.forEach((card, i) => {
          const appear = easeOutBack(s(0.02 + i * 0.035, 0.1 + i * 0.035));
          card.sprite.visible = appear > 0.001;
          card.sprite.position.copy(NEEDS[i].pos);
          card.sprite.position.y += Math.sin(t * 1.3 + card.seed) * 0.13;
          let scale = appear;
          const material = card.sprite.material;
          if (i === 0) {
            card.sprite.position.lerp(mid, pick);
            card.sprite.position.lerp(badgeSpot, toBadge);
            scale *= 1 - 0.25 * pick + 0.35 * toBadge;
            setCardState(card, p > 0.72 ? "chosen" : "open");
          } else {
            setCardState(card, p > 0.44 ? "locked" : "open");
            const fadeOut = 1 - s(0.78, 0.86);
            material.opacity = (1 - 0.45 * lockT) * fadeOut;
            if (fadeOut <= 0) card.sprite.visible = false;
          }
          card.sprite.scale.set(2.5 * scale, 1.02 * scale, 1);
        });

        /* 3: kontak (WhatsApp) lalu kesepakatan; cincin melengkapi bertahap */
        const ringVisible = s(0.5, 0.53) * (1 - s(0.73, 0.76));
        const phaseTwo = p >= 0.625;
        const fraction = phaseTwo ? s(0.625, 0.73) : s(0.52, 0.625);
        ringGroup.visible = ringVisible > 0.01;
        ringGroup.quaternion.copy(camera.quaternion);
        ringGroup.scale.setScalar(0.5 + 0.5 * ringVisible);
        ringGeometry.setDrawRange(0, Math.max(0, Math.floor(fraction * 96)) * 6);
        ringMaterial.color.set(phaseTwo ? "#3B7EA8" : "#D99A21");
        ringMaterial.opacity = ringVisible;
        showLabel(labelContact, s(0.51, 0.54) * (1 - s(0.62, 0.635)));
        showLabel(labelAgreement, s(0.625, 0.64) * (1 - s(0.72, 0.735)));
        showLabel(labelOk, s(0.735, 0.75) * (1 - s(0.82, 0.84)));
        labelOk.sprite.position.copy(mid).add(V(0, -2.15, 0));

        papers.forEach((paper, i) => {
          const raw = (s(0.52, 0.625) * 2.2 + i * 0.25) % 1;
          const u = raw < 0.5 ? raw * 2 : 2 - raw * 2;
          const alpha = s(0.52, 0.54) * (1 - s(0.6, 0.625));
          paper.visible = alpha > 0.01;
          (paper.material as THREE.MeshBasicMaterial).opacity = alpha;
          paper.position.copy(link.getPoint(clamp(u)));
          paper.position.y += 0.3 + Math.sin(u * Math.PI) * 0.2;
          paper.lookAt(camera.position);
          paper.rotateZ(Math.sin(t * 3 + i) * 0.2);
        });
        const agreementU = 1 - ease(s(0.63, 0.72)) * 0.5;
        const agreementAlpha = s(0.625, 0.64) * (1 - s(0.72, 0.745));
        agreement.visible = agreementAlpha > 0.01;
        (agreement.material as THREE.MeshBasicMaterial).opacity = agreementAlpha;
        agreement.position.copy(link.getPoint(agreementU));
        agreement.position.y += 0.4;
        agreement.lookAt(camera.position);
        agreement.scale.setScalar(0.9 + 0.3 * s(0.7, 0.72));

        /* 4: konfeti, jembatan, mahasiswa menyeberang, dokumentasi */
        const confettiT = s(0.75, 0.93);
        confetti.visible = confettiT > 0 && confettiT < 1;
        const tau = confettiT * 2.6;
        for (let i = 0; i < CONFETTI_COUNT; i++) {
          const v = cVel[i];
          confettiGeometry.attributes.position.setXYZ(i, mid.x + v.x * tau, mid.y + v.y * tau - 3.2 * tau * tau, mid.z + v.z * tau);
        }
        confettiGeometry.attributes.position.needsUpdate = true;
        confettiMaterial.opacity = 1 - s(0.88, 0.93);

        planks.forEach((plank, i) => plank.scale.setScalar(easeOutBack(s(0.76 + i * 0.006, 0.8 + i * 0.006))));
        kids.forEach(({ group, end: spot }, i) => {
          const u = clamp((p - 0.82 - i * 0.012) / 0.12);
          group.visible = u > 0;
          if (u <= 0) return;
          group.position.lerpVectors(bridge.getPoint(u), spot, ease(seg(u, 0.8, 1)));
          if (u < 1) group.position.y += Math.abs(Math.sin(t * 9 + i * 2)) * 0.05;
          group.lookAt(group.position.clone().add(bridge.getTangent(u).multiplyScalar(-1).setY(0)));
          if (u >= 1) group.rotation.y = Math.PI * 0.5 + Math.sin(t + i) * 0.3;
        });
        village.windows.forEach((w) => {
          w.emissiveIntensity = 0.25 + 1.6 * s(0.75, 0.9);
        });
        frames.forEach((frame, i) => {
          frame.scale.setScalar(easeOutBack(s(0.86 + i * 0.022, 0.93 + i * 0.022)));
          frame.position.set(-3.2 + (i - 2) * 1.15, 3.2 + Math.sin(i * 1.4) * 0.35 + Math.sin(t * 1.2 + i) * 0.08, 1.6 - Math.abs(i - 2) * 0.25);
          frame.rotation.set(0, (i - 2) * -0.18, Math.sin(i * 2.1) * 0.12);
        });

        clouds.forEach(({ group, speed }) => {
          group.position.x += speed * 0.016;
          if (group.position.x > 12) group.position.x = -12;
        });
        dustMaterial.opacity = 0.4 + 0.3 * Math.sin(t * 1.5) + end * 0.2;
        renderer.render(scene, camera);
      },
      dispose: () => disposeScene(scene, renderer),
    };

  };
}
