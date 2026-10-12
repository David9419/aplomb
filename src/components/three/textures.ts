import * as THREE from "three";

/*
 * Textures générées par programme (aucun fichier à télécharger) :
 * parquet chêne, ardoises, marbre, enduit, pelouse, lames de terrasse, carrelage, bardage bois, dallage.
 */

type Kind = "oak" | "slate" | "marble" | "render" | "grass" | "deck" | "tiles" | "cladding" | "paving" | "gravel" | "fabric";

let seed = 1;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

function canvas(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return [c, c.getContext("2d")!] as const;
}

function speckle(ctx: CanvasRenderingContext2D, size: number, count: number, alpha: number, light = false) {
  for (let i = 0; i < count; i++) {
    const v = light ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${rand() * alpha})`;
    ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 1.5, 1 + rand() * 1.5);
  }
}

const shade = (hex: string, amt: number) => {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, amt);
  return `#${c.getHexString()}`;
};

const painters: Record<Kind, (ctx: CanvasRenderingContext2D, s: number) => void> = {
  oak(ctx, s) {
    const rows = 6;
    const h = s / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rand() * s;
      while (x < s) {
        const len = s * (0.55 + rand() * 0.6);
        const base = shade("#c4a27a", (rand() - 0.5) * 0.08);
        ctx.fillStyle = base;
        ctx.fillRect(x, r * h, len, h);
        // veinage
        for (let g = 0; g < 14; g++) {
          ctx.strokeStyle = `rgba(110,75,40,${0.05 + rand() * 0.08})`;
          ctx.lineWidth = 0.6 + rand();
          ctx.beginPath();
          const y0 = r * h + rand() * h;
          ctx.moveTo(x, y0);
          for (let k = 0; k <= 8; k++) ctx.lineTo(x + (len * k) / 8, y0 + Math.sin(k + g) * (1 + rand() * 2));
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(60,40,20,0.35)";
        ctx.fillRect(x, r * h, 1.2, h);
        x += len;
      }
      ctx.fillStyle = "rgba(60,40,20,0.35)";
      ctx.fillRect(0, r * h, s, 1.2);
    }
  },
  slate(ctx, s) {
    ctx.fillStyle = "#4a5259";
    ctx.fillRect(0, 0, s, s);
    const rows = 12;
    const h = s / rows;
    for (let r = 0; r < rows; r++) {
      const w = s / 8;
      const off = r % 2 ? w / 2 : 0;
      for (let x = -w; x < s + w; x += w) {
        ctx.fillStyle = shade("#59626b", (rand() - 0.5) * 0.07);
        ctx.fillRect(x + off + 1, r * h + 1, w - 2, h - 1.5);
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fillRect(x + off + 1, r * h + 1, w - 2, 2);
      }
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, r * h + h - 2, s, 2);
    }
    speckle(ctx, s, 3000, 0.12, true);
  },
  marble(ctx, s) {
    ctx.fillStyle = "#f1eee9";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 26; i++) {
      ctx.strokeStyle = `rgba(${120 + rand() * 40},${115 + rand() * 30},${110 + rand() * 30},${0.08 + rand() * 0.2})`;
      ctx.lineWidth = 0.5 + rand() * 2.2;
      ctx.beginPath();
      let x = rand() * s;
      let y = rand() * s;
      ctx.moveTo(x, y);
      for (let k = 0; k < 10; k++) {
        x += (rand() - 0.3) * 90;
        y += (rand() - 0.5) * 60;
        ctx.quadraticCurveTo(x - 20, y + 15, x, y);
      }
      ctx.stroke();
    }
  },
  render(ctx, s) {
    ctx.fillStyle = "#f3f0ea";
    ctx.fillRect(0, 0, s, s);
    speckle(ctx, s, 9000, 0.05);
    speckle(ctx, s, 5000, 0.4, true);
  },
  grass(ctx, s) {
    ctx.fillStyle = "#7d9a5f";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 14000; i++) {
      const g = 110 + rand() * 70;
      ctx.strokeStyle = `rgba(${g * 0.55},${g},${g * 0.42},${0.25 + rand() * 0.4})`;
      ctx.lineWidth = 1;
      const x = rand() * s;
      const y = rand() * s;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rand() - 0.5) * 3, y - 3 - rand() * 4);
      ctx.stroke();
    }
  },
  deck(ctx, s) {
    const rows = 8;
    const h = s / rows;
    for (let r = 0; r < rows; r++) {
      ctx.fillStyle = shade("#9c7a58", (rand() - 0.5) * 0.08);
      ctx.fillRect(0, r * h, s, h);
      for (let g = 0; g < 8; g++) {
        ctx.strokeStyle = `rgba(70,45,25,${0.06 + rand() * 0.08})`;
        ctx.beginPath();
        const y = r * h + rand() * h;
        ctx.moveTo(0, y);
        ctx.lineTo(s, y + (rand() - 0.5) * 4);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(35,25,15,0.7)";
      ctx.fillRect(0, r * h, s, 3);
    }
  },
  tiles(ctx, s) {
    const n = 4;
    const w = s / n;
    ctx.fillStyle = "#c9c2b6";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        ctx.fillStyle = shade("#e2dccf", (rand() - 0.5) * 0.03);
        ctx.fillRect(i * w + 1.5, j * w + 1.5, w - 3, w - 3);
      }
    speckle(ctx, s, 4000, 0.05);
  },
  cladding(ctx, s) {
    const cols = 10;
    const w = s / cols;
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = shade("#8a6a4c", (rand() - 0.5) * 0.08);
      ctx.fillRect(c * w, 0, w, s);
      for (let g = 0; g < 6; g++) {
        ctx.strokeStyle = `rgba(50,32,18,${0.08 + rand() * 0.08})`;
        ctx.beginPath();
        const x = c * w + rand() * w;
        ctx.moveTo(x, 0);
        ctx.lineTo(x + (rand() - 0.5) * 3, s);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(25,18,10,0.6)";
      ctx.fillRect(c * w, 0, 2.5, s);
    }
  },
  paving(ctx, s) {
    ctx.fillStyle = "#b8b0a3";
    ctx.fillRect(0, 0, s, s);
    const n = 4;
    const w = s / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        ctx.fillStyle = shade("#d6cfc2", (rand() - 0.5) * 0.06);
        ctx.fillRect(i * w + 3, j * w + 3, w - 6, w - 6);
      }
    speckle(ctx, s, 6000, 0.08);
  },
  gravel(ctx, s) {
    ctx.fillStyle = "#cfc6b6";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 9000; i++) {
      const v = 150 + rand() * 90;
      ctx.fillStyle = `rgba(${v},${v * 0.96},${v * 0.9},0.8)`;
      ctx.beginPath();
      ctx.arc(rand() * s, rand() * s, 0.8 + rand() * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  fabric(ctx, s) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 2) {
      ctx.fillStyle = `rgba(0,0,0,${0.02 + rand() * 0.03})`;
      ctx.fillRect(0, y, s, 1);
    }
    for (let x = 0; x < s; x += 2) {
      ctx.fillStyle = `rgba(0,0,0,${0.015 + rand() * 0.02})`;
      ctx.fillRect(x, 0, 1, s);
    }
  },
};

const cache = new Map<Kind, THREE.CanvasTexture>();

/** Texture répétée `rx` × `ry` fois (l'image est partagée entre tous les usages). */
export function makeTexture(kind: Kind, rx = 1, ry = 1, color = true) {
  let base = cache.get(kind);
  if (!base) {
    seed = kind.length * 977 + 13;
    const [c, ctx] = canvas(kind === "grass" || kind === "gravel" ? 512 : 512);
    painters[kind](ctx, c.width);
    base = new THREE.CanvasTexture(c);
    base.wrapS = base.wrapT = THREE.RepeatWrapping;
    base.anisotropy = 8;
    if (color) base.colorSpace = THREE.SRGBColorSpace;
    cache.set(kind, base);
  }
  const t = base.clone();
  t.needsUpdate = true;
  t.repeat.set(rx, ry);
  return t;
}
