"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, type MotionValue } from "motion/react";

/** Plan-séquence de drone : images calculées une par une, jouées au défilement (comme une vidéo). */
export const FRAME_COUNT = 200;
/** Part du défilement consacrée au film ; au-delà, la dernière image reste à l'écran. */
export const FILM_END = 0.9;

/** Écran en hauteur (téléphone) → film cadré en portrait ; sinon film paysage. */
const folder = () => (window.matchMedia("(max-aspect-ratio: 9/10)").matches ? "seq-m" : "seq");
const src = (dir: string, i: number) => `/tour/${dir}/f${String(i + 1).padStart(4, "0")}.webp`;

/** Position (0 → 1) dans le défilement qui correspond à une image du film (1 → FRAME_COUNT). */
export const atFrame = (f: number) => ((f - 1) / (FRAME_COUNT - 1)) * FILM_END;

function signalReady() {
  const w = window as Window & { __sceneReady?: boolean };
  if (w.__sceneReady) return;
  w.__sceneReady = true;
  window.dispatchEvent(new Event("scene:ready"));
}

export function DroneStage({ progress }: { progress: MotionValue<number> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frames = useRef<(HTMLImageElement | null)[]>([]);
  const target = useRef(0);
  const shown = useRef(-1);
  const current = useRef(0);

  useEffect(() => {
    const imgs: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    frames.current = imgs;
    let cancelled = false;
    let dir = folder();
    // ordre de chargement : 1re image, puis une image sur 8, sur 4, sur 2, puis toutes
    const order: number[] = [];
    const seen = new Set<number>();
    for (const step of [FRAME_COUNT, 8, 4, 2, 1]) {
      for (let i = 0; i < FRAME_COUNT; i += step) {
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
      }
    }
    if (!seen.has(FRAME_COUNT - 1)) order.push(FRAME_COUNT - 1);
    const firstPass = Math.ceil(FRAME_COUNT / 8) + 1;
    let loaded = 0;
    let next = 0;
    const PARALLEL = 6;
    const pump = () => {
      if (cancelled || next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => {
        if (cancelled) return;
        if (img.naturalWidth) imgs[i] = img;
        loaded++;
        if (loaded === 1) draw(true);
        if (loaded >= firstPass) signalReady();
        pump();
      };
      img.src = src(dir, i);
    };
    const start = () => {
      for (let k = 0; k < PARALLEL; k++) pump();
    };
    if (dir === "seq") start();
    else {
      // film portrait absent → on retombe sur le film paysage
      const probe = new Image();
      probe.onload = start;
      probe.onerror = () => {
        dir = "seq";
        start();
      };
      probe.src = src(dir, 0);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // image la plus proche déjà chargée
  const nearest = (i: number) => {
    const imgs = frames.current;
    for (let d = 0; d < FRAME_COUNT; d++) {
      if (imgs[i - d]) return i - d;
      if (imgs[i + d]) return i + d;
    }
    return -1;
  };

  const paint = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) => {
    const sc = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const w = img.naturalWidth * sc;
    const h = img.naturalHeight * sc;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  };

  /** Dessine l'image correspondant à la position courante (une seule image, toujours nette). */
  function draw(force = false) {
    const c = canvas.current;
    if (!c) return;
    const idx = nearest(Math.round(current.current));
    if (idx < 0 || (idx === shown.current && !force)) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingQuality = "high";
    paint(ctx, frames.current[idx]!, c.width, c.height);
    shown.current = idx;
  }

  // taille du canvas = écran × densité de pixels (plafonnée)
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      draw(true);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // le film suit le défilement avec un léger amorti (mouvement de caméra fluide)
  useMotionValueEvent(progress, "change", (p) => {
    target.current = Math.min(1, p / FILM_END) * (FRAME_COUNT - 1);
  });
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const d = target.current - current.current;
      current.current += Math.abs(d) < 0.01 ? d : d * 0.14;
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 bg-bone">
      <canvas
        ref={canvas}
        className="absolute inset-0 size-full"
        role="img"
        aria-label="Vol de drone au-dessus d'une villa contemporaine avec piscine, puis entrée dans le séjour et la cuisine"
      />
    </div>
  );
}
