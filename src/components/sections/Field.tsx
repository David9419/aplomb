"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { field } from "@/content/site";
import { cn } from "@/lib/utils";
import { SectionHead } from "@/components/sections/SectionHead";
import { Reveal } from "@/components/site/Motion";

type Photo = (typeof field.photos)[number];
const isLandscape = (p: Photo) => p.width > p.height;

// Trois colonnes qui défilent à l'infini : gauche vers le bas, milieu vers le haut, droite vers le bas.
// Chaque colonne commence à une photo différente pour ne jamais montrer la même image côte à côte.
const COLUMNS = [
  { dir: "down" as const, offset: 0, duration: 46 },
  { dir: "up" as const, offset: 2, duration: 38 },
  { dir: "down" as const, offset: 4, duration: 52 },
];

/**
 * Galerie de chantiers : trois colonnes de photos en défilement continu (pause au survol),
 * et visionneuse plein écran au clic (flèches, clavier, glisser).
 */
export function Field() {
  const [open, setOpen] = useState<number | null>(null);
  const photos = field.photos;

  return (
    <section id="terrain" className="relative overflow-hidden py-28 sm:py-36">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHead index="03" eyebrow={field.eyebrow} title={field.title} accent={["concrets."]} lead={field.lead} />
        <Reveal from="zoom" className="mt-16">
          <div className="columns fade-y relative grid h-[560px] grid-cols-3 gap-2.5 overflow-hidden sm:h-[720px] sm:gap-4 lg:h-[820px]">
            {COLUMNS.map((col, c) => {
              const shifted = photos.map((_, i) => photos[(i + col.offset) % photos.length]);
              // La colonne du milieu défile dans l'ordre inverse : jamais deux photos identiques côte à côte.
              const ordered = col.dir === "up" ? [...shifted].reverse() : shifted;
              const track = [...ordered, ...ordered];
              return (
                <div key={c} className="relative min-w-0 overflow-hidden">
                  <div
                    className="column-track flex flex-col"
                    style={{
                      animationName: col.dir === "up" ? "column-up" : "column-down",
                      animationDuration: `${col.duration}s`,
                    }}
                  >
                    {track.map((photo, k) => (
                      <Tile
                        key={`${photo.src}-${k}`}
                        photo={photo}
                        hidden={k >= ordered.length}
                        onOpen={() => setOpen(photos.indexOf(photo))}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
      <Lightbox photos={photos} index={open} onChange={setOpen} />
    </section>
  );
}

function Tile({ photo, hidden, onOpen }: { photo: Photo; hidden: boolean; onOpen: () => void }) {
  const landscape = isLandscape(photo);
  return (
    <button
      type="button"
      onClick={onOpen}
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden || undefined}
      aria-label={`Agrandir la photo : ${photo.caption}`}
      className={cn(
        "group relative mb-2.5 block w-full shrink-0 cursor-zoom-in overflow-hidden rounded-[18px] bg-sand text-left sm:mb-4 sm:rounded-[24px]",
        landscape ? "aspect-[4/3]" : "aspect-[3/4]",
      )}
    >
      <Image
        src={photo.src}
        alt={hidden ? "" : photo.alt}
        fill
        sizes="(min-width: 1024px) 400px, 33vw"
        className="object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.06]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/0 to-ink/0 opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="absolute top-3 right-3 hidden size-9 scale-75 place-items-center rounded-full bg-paper/90 text-ink opacity-0 backdrop-blur-md transition-all duration-500 ease-out-expo group-hover:scale-100 group-hover:opacity-100 sm:grid">
        <Expand className="size-4" />
      </span>
      <span className="absolute right-2 bottom-2 left-2 flex flex-col items-start gap-1.5 sm:right-4 sm:bottom-4 sm:left-4">
        <span className="max-w-full truncate rounded-full bg-paper/90 px-2.5 py-1 text-[0.7rem] font-medium text-ink backdrop-blur-md sm:px-3 sm:text-[0.85rem]">
          {photo.caption}
        </span>
        <span className="hidden translate-y-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-paper opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100 lg:block">
          {photo.detail}
        </span>
      </span>
    </button>
  );
}

function Lightbox({
  photos,
  index,
  onChange,
}: {
  photos: readonly Photo[];
  index: number | null;
  onChange: (i: number | null) => void;
}) {
  const [dir, setDir] = useState(0);
  const go = useCallback(
    (step: number) => {
      if (index === null) return;
      setDir(step);
      onChange((index + step + photos.length) % photos.length);
    },
    [index, onChange, photos.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  const photo = index === null ? null : photos[index];

  return (
    <DialogPrimitive.Root open={index !== null} onOpenChange={(o) => !o && onChange(null)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-ink/92 backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content className="fixed inset-0 z-[91] flex flex-col text-paper outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0">
          <DialogPrimitive.Title className="sr-only">{photo?.caption ?? "Photo"}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{photo?.alt ?? ""}</DialogPrimitive.Description>

          <div className="flex items-center justify-between gap-4 px-4 pt-[calc(16px+env(safe-area-inset-top,0px))] sm:px-8">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-mist/70 tabular-nums">
              {index !== null && `${String(index + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`}
            </p>
            <DialogPrimitive.Close
              aria-label="Fermer"
              className="grid size-11 cursor-pointer place-items-center rounded-full border border-paper/20 transition-colors hover:bg-paper hover:text-ink"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-24">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              {photo && (
                <motion.div
                  key={photo.src}
                  custom={dir}
                  className="relative size-full"
                  initial={{ opacity: 0, x: dir * 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -80 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -70) go(1);
                    else if (info.offset.x > 70) go(-1);
                  }}
                >
                  <Image src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-contain" draggable={false} />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Photo précédente"
              className="absolute left-3 grid size-12 cursor-pointer place-items-center rounded-full border border-paper/20 bg-ink/40 backdrop-blur transition-colors hover:bg-paper hover:text-ink sm:left-8"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Photo suivante"
              className="absolute right-3 grid size-12 cursor-pointer place-items-center rounded-full border border-paper/20 bg-ink/40 backdrop-blur transition-colors hover:bg-paper hover:text-ink sm:right-8"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="px-4 pb-[calc(20px+env(safe-area-inset-bottom,0px))] text-center sm:px-8">
            <p className="font-serif text-[1.6rem] leading-tight">{photo?.caption}</p>
            <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-mist/70">{photo?.detail}</p>
            <div className="mt-4 flex justify-center gap-1.5">
              {photos.map((p, i) => (
                <button
                  key={p.src}
                  type="button"
                  onClick={() => {
                    setDir(index !== null && i < index ? -1 : 1);
                    onChange(i);
                  }}
                  aria-label={`Voir la photo ${i + 1}`}
                  className={cn(
                    "h-1.5 cursor-pointer rounded-full transition-all duration-500",
                    i === index ? "w-8 bg-paper" : "w-1.5 bg-paper/30 hover:bg-paper/60",
                  )}
                />
              ))}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
