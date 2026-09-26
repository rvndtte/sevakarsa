/**
 * Masukan dari React ke scene 3D. Komponen menulis nilainya (di effect),
 * scene membacanya setiap frame. Dipisah dari React agar scene tidak perlu
 * dibuat ulang saat nilai berubah.
 */
export const sceneInputs = {
  /** Slide aktif pada carousel permasalahan (0–3). */
  problemSlide: 0,
  /** Progres scroll section story (0–1), sudah dihaluskan. */
  storyProgress: 0,
};
