"use client";

import { useEffect, useRef } from "react";
import { getImageProps } from "next/image";
import { motion, useTransform, type MotionValue } from "motion/react";

import { intro } from "@/content/site";
import points from "@/content/tour-points.json";

export type TourView = keyof typeof intro.labels;

/** Images de la visite, dans l'ordre, avec la fenêtre de défilement où chacune est à l'écran. */
export const TOUR_VIEWS: { key: TourView; win: [number, number]; alt: string; zoom: [number, number] }[] = [
  { key: "hero", win: [0, 0.05], alt: "Villa contemporaine au coucher du soleil, vue depuis la pelouse au-delà de la piscine", zoom: [1, 1.07] },
  { key: "facades", win: [0.05, 0.15], alt: "Façades de la villa : toiture en tuiles, balcon, baies vitrées et piscine", zoom: [1.1, 1] },
  { key: "plan", win: [0.18, 0.34], alt: "Vue aérienne du rez-de-chaussée sans toiture : séjour, cuisine et terrasse", zoom: [1.04, 1.12] },
  { key: "sejour", win: [0.4, 0.53], alt: "Séjour lumineux : parquet chêne, canapé velours, cheminée et grandes baies", zoom: [1.1, 1] },
  { key: "cuisine", win: [0.57, 0.69], alt: "Cuisine ouverte avec îlot en marbre, suspensions et table en chêne", zoom: [1, 1.08] },
  { key: "coupe", win: [0.79, 0.94], alt: "Coupe de la maison : charpente, isolation, planchers, murs et fondations", zoom: [1.1, 1] },
];

type Pt = [number, number, number];
const PTS = points as unknown as Record<TourView, { wide: Record<string, Pt>; tall: Record<string, Pt> }>;

const FADE = 0.035;

function signalReady() {
  const w = window as Window & { __sceneReady?: boolean };
  if (w.__sceneReady) return;
  w.__sceneReady = true;
  window.dispatchEvent(new Event("scene:ready"));
}

function ViewImage({ view, index, progress }: { view: (typeof TOUR_VIEWS)[number]; index: number; progress: MotionValue<number> }) {
  const [a, b] = view.win;
  const opacity = useTransform(progress, index === 0 ? [0, 1] : [a - FADE, a + 0.005], index === 0 ? [1, 1] : [0, 1]);
  const range = index === 0 ? [0, b + 0.02] : [a - FADE, b + 0.04];
  const scale = useTransform(progress, range, view.zoom);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (index === 0 && imgRef.current?.complete) signalReady();
  }, [index]);

  const common = { alt: view.alt, sizes: "100vw" };
  const {
    props: { srcSet: tallSet },
  } = getImageProps({ ...common, src: `/tour/${view.key}-tall.webp`, width: 900, height: 1600 });
  const {
    props: { srcSet: wideSet, ...rest },
  } = getImageProps({ ...common, src: `/tour/${view.key}-wide.webp`, width: 1600, height: 1000, priority: index === 0 });

  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      <motion.div className="tour-frame" style={{ scale }}>
        <picture>
          <source media="(max-aspect-ratio: 9/10)" srcSet={tallSet} />
          <img
            {...rest}
            alt={view.alt}
            ref={imgRef}
            srcSet={wideSet}
            className="absolute inset-0 size-full object-cover"
            onLoad={index === 0 ? signalReady : undefined}
            draggable={false}
          />
        </picture>
        <Labels view={view} progress={progress} variant="wide" />
        <Labels view={view} progress={progress} variant="tall" />
      </motion.div>
    </motion.div>
  );
}

function Labels({ view, progress, variant }: { view: (typeof TOUR_VIEWS)[number]; progress: MotionValue<number>; variant: "wide" | "tall" }) {
  const pts = PTS[view.key]?.[variant] ?? {};
  const items = intro.labels[view.key].filter(({ id }) => {
    const p = pts[id];
    return p && p[2] > 0 && p[0] > 4 && p[0] < 96 && p[1] > 8 && p[1] < 92;
  });
  return (
    <div className={variant === "wide" ? "tour-wide" : "tour-tall"} aria-hidden>
      {items.map((item, i) => (
        <Label key={item.id} item={item} at={pts[item.id]} index={i} win={view.win} progress={progress} />
      ))}
    </div>
  );
}

function Label({
  item,
  at,
  index,
  win,
  progress,
}: {
  item: { title: string; value: string };
  at: Pt;
  index: number;
  win: [number, number];
  progress: MotionValue<number>;
}) {
  const a = win[0] + 0.012 + index * 0.009;
  const b = win[1] - 0.012;
  const opacity = useTransform(progress, [a, a + 0.02, b - 0.015, b], [0, 1, 1, 0]);
  const y = useTransform(progress, [a, a + 0.02], [10, 0]);
  const left = at[0] > 66;
  return (
    <motion.div className="absolute" style={{ left: `${at[0]}%`, top: `${at[1]}%`, opacity }}>
      <span className="absolute -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 animate-ping rounded-full bg-paper/70" />
        <span className="relative block size-3 rounded-full border-2 border-paper bg-steel shadow-[0_0_0_4px_rgba(251,250,247,0.25)]" />
      </span>
      <motion.div
        className={`absolute top-0 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-ink/10 bg-paper/92 py-1.5 pr-3.5 pl-3 shadow-[0_14px_34px_-14px_rgba(15,18,21,0.55)] ${left ? "right-4" : "left-4"}`}
        style={{ y }}
      >
        <span className="text-[11px] font-medium text-ink sm:text-[12px]">{item.title}</span>
        <span className="font-mono text-[10px] text-stone sm:text-[11px]">{item.value}</span>
      </motion.div>
    </motion.div>
  );
}

/** Pile d'images plein écran pilotée par le défilement (fondus enchaînés + lent travelling). */
export function TourStage({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-bone">
      {TOUR_VIEWS.map((view, i) => (
        <ViewImage key={view.key} view={view} index={i} progress={progress} />
      ))}
    </div>
  );
}
