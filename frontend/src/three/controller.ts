import * as THREE from "three";

/** Kontrak antara scene Three.js dan komponen React <ThreeCanvas>. */
export interface SceneController {
  renderer: THREE.WebGLRenderer;
  /** Dipanggil saat ukuran wadah berubah. */
  resize(width: number, height: number): void;
  /** Perbarui state animasi lalu gambar satu frame. `time` dalam detik. */
  render(time: number, delta: number): void;
  /** Bebaskan geometri, material, tekstur, dan renderer. */
  dispose(): void;
}

export interface SceneOptions {
  /** Pengguna meminta gerak minimal: scene tidak beranimasi terus-menerus. */
  reducedMotion: boolean;
}

export type SceneFactory = (options: SceneOptions) => SceneController;

/** Renderer transparan yang dipakai semua scene. */
export function createRenderer(shadows: boolean): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  if (shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  return renderer;
}

/** Bebaskan semua sumber daya GPU yang dipegang scene. */
export function disposeScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Sprite) {
      if ("geometry" in object) object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((m) => {
        if (m && "map" in m && m.map) m.map.dispose();
        m?.dispose();
      });
    }
  });
  renderer.dispose();
  renderer.domElement.remove();
}

/** Posisi kursor ternormalisasi (-1..1) yang dibagi semua scene. */
export const pointer = { x: 0, y: 0 };
let pointerTracking = false;

export function trackPointer(): void {
  if (pointerTracking || typeof window === "undefined") return;
  pointerTracking = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true },
  );
}
