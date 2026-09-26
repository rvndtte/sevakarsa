/* Tekstur kanvas 2D untuk scene story: kartu kebutuhan, label, kertas, dan foto. */
import * as THREE from "three";

export interface NeedCard {
  title: string;
  subtitle: string;
}
export type CardState = "open" | "locked" | "chosen";

const SANS = '"Plus Jakarta Sans",system-ui,sans-serif';
const SERIF = "Fraunces,Georgia,serif";

function roundedRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

const makeCanvas = (w: number, h: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return canvas;
};

const toTexture = (canvas: HTMLCanvasElement, anisotropy = 1) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  return texture;
};

export function paintCard(canvas: HTMLCanvasElement, need: NeedCard, state: CardState) {
  const g = canvas.getContext("2d");
  if (!g) return;
  const locked = state === "locked";
  const chosen = state === "chosen";
  g.clearRect(0, 0, canvas.width, canvas.height);
  roundedRect(g, 6, 6, 500, 196, 38);
  g.fillStyle = locked ? "#CFD5CE" : chosen ? "#F2FAC8" : "#FFFFFF";
  g.fill();
  g.lineWidth = chosen ? 8 : 3;
  g.strokeStyle = chosen ? "#8FB51F" : locked ? "#B3BBB2" : "#E4E2D6";
  g.stroke();

  const tag = locked ? "Terkunci" : chosen ? "Aktif" : "Available";
  const tagColor = locked ? "#6E7B72" : chosen ? "#3F5A00" : "#1F5138";
  const tagBg = locked ? "#E3E7E1" : chosen ? "#D8EC6E" : "#E1EEDB";
  g.font = `700 22px ${SANS}`;
  const tagWidth = g.measureText(tag).width + 32;
  roundedRect(g, 36, 30, tagWidth, 36, 18);
  g.fillStyle = tagBg;
  g.fill();
  g.fillStyle = tagColor;
  g.fillText(tag, 52, 56);

  g.fillStyle = locked ? "#5E6A62" : "#16241B";
  g.font = `700 44px ${SERIF}`;
  g.fillText(need.title, 36, 118);
  g.fillStyle = "#6E7B72";
  g.font = `500 25px ${SANS}`;
  g.fillText(need.subtitle, 36, 165);

  if (locked) {
    g.fillStyle = "#6E7B72";
    roundedRect(g, 432, 40, 44, 34, 6);
    g.fill();
    g.lineWidth = 6;
    g.strokeStyle = "#6E7B72";
    g.beginPath();
    g.arc(454, 40, 13, Math.PI, 0);
    g.stroke();
  }
}

export interface Card {
  need: NeedCard;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  sprite: THREE.Sprite;
  state: CardState;
  seed: number;
}

export function createCard(need: NeedCard, seed: number): Card {
  const canvas = makeCanvas(512, 208);
  paintCard(canvas, need, "open");
  const texture = toTexture(canvas, 4);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }));
  sprite.scale.set(2.5, 1.02, 1);
  sprite.visible = false;
  return { need, canvas, texture, sprite, state: "open", seed };
}

export function setCardState(card: Card, state: CardState) {
  if (card.state === state) return;
  card.state = state;
  paintCard(card.canvas, card.need, state);
  card.texture.needsUpdate = true;
}

export function repaintCard(card: Card) {
  paintCard(card.canvas, card.need, card.state);
  card.texture.needsUpdate = true;
}

export interface LabelSprite {
  sprite: THREE.Sprite;
  repaint: () => void;
}

/** Label pil di tengah jalur (kontak, kesepakatan, dst). */
export function createLabel(text: string, background: string, color: string, width = 512): LabelSprite {
  const canvas = makeCanvas(width, 128);
  const paint = () => {
    const g = canvas.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, width, 128);
    roundedRect(g, 6, 20, width - 12, 88, 44);
    g.fillStyle = background;
    g.fill();
    g.fillStyle = color;
    g.font = `700 42px ${SANS}`;
    g.textAlign = "center";
    g.fillText(text, width / 2, 78);
  };
  paint();
  const texture = toTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }));
  sprite.scale.set(width / 200, 0.64, 1);
  return {
    sprite,
    repaint: () => {
      paint();
      texture.needsUpdate = true;
    },
  };
}

export function paperTexture(accent: string): THREE.CanvasTexture {
  const canvas = makeCanvas(128, 160);
  const g = canvas.getContext("2d");
  if (g) {
    g.fillStyle = "#FFFFFF";
    g.fillRect(0, 0, 128, 160);
    g.fillStyle = accent;
    g.fillRect(0, 0, 128, 26);
    g.fillStyle = "#C9D4CC";
    for (let i = 0; i < 6; i++) g.fillRect(14, 44 + i * 18, i % 3 === 2 ? 60 : 100, 7);
  }
  return toTexture(canvas);
}

export function photoTexture(index: number): THREE.CanvasTexture {
  const canvas = makeCanvas(160, 128);
  const g = canvas.getContext("2d");
  if (g) {
    const palette = [
      ["#F4E7B0", "#9CC24E"],
      ["#CFE5D3", "#3F7A55"],
      ["#FBEFD0", "#C0583A"],
      ["#DDEAF3", "#2A6B4A"],
      ["#F3E6C8", "#86B043"],
    ][index % 5];
    const gradient = g.createLinearGradient(0, 0, 0, 128);
    gradient.addColorStop(0, palette[0]);
    gradient.addColorStop(1, "#FFFFFF");
    g.fillStyle = gradient;
    g.fillRect(0, 0, 160, 128);
    g.fillStyle = palette[1];
    g.beginPath();
    g.moveTo(0, 96);
    g.quadraticCurveTo(50, 50, 100, 84);
    g.quadraticCurveTo(140, 100, 160, 70);
    g.lineTo(160, 128);
    g.lineTo(0, 128);
    g.fill();
    g.fillStyle = "#C0583A";
    g.fillRect(96, 74, 22, 14);
    g.beginPath();
    g.moveTo(92, 74);
    g.lineTo(107, 62);
    g.lineTo(122, 74);
    g.fill();
    g.lineWidth = 8;
    g.strokeStyle = "#FFFFFF";
    g.strokeRect(0, 0, 160, 128);
  }
  return toTexture(canvas);
}
