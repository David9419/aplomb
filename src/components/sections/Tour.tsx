"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowDown, ArrowRight, Phone } from "lucide-react";

import { contact, hero, intro } from "@/content/site";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/site/Motion";
import type { TourState } from "@/components/three/HouseScene";

const HouseScene = dynamic(() => import("@/components/three/HouseScene"), { ssr: false });

// Fenêtres de défilement de chaque étape (doivent correspondre à la caméra de HouseScene).
const WINDOWS: [number, number][] = [
  [0.14, 0.34],
  [0.39, 0.56],
  [0.59, 0.74],
  [0.79, 0.95],
];

function Words({ text, start, className }: { text: string; start: number; className?: string }) {
  return text.split(" ").map((w, i) => (
    <span key={i} className="word">
      <span className={className} style={{ ["--d" as string]: start + i * 60 }}>
        {w}
      </span>
      {" "}
    </span>
  ));
}

/**
 * Ouverture plein écran : une visite 3D de maison pilotée par le défilement
 * (plan, séjour, cuisine, fondations et charpente), avec le texte qui accompagne.
 */
export function Tour() {
  const section = useRef<HTMLElement>(null);
  const tour = useRef<TourState>({ progress: 0 });
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    tour.current.progress = v;
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.07], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.07], [0, -60]);
  const heroBlur = useTransform(scrollYProgress, [0, 0.07], ["blur(0px)", "blur(8px)"]);
  const railOpacity = useTransform(scrollYProgress, [0.1, 0.14, 0.95, 0.97], [0, 1, 1, 0]);
  const outroOpacity = useTransform(scrollYProgress, [0.955, 0.99], [0, 1]);
  const outroY = useTransform(scrollYProgress, [0.955, 0.99], [30, 0]);
  const veil = useTransform(scrollYProgress, [0.94, 1], [0, 0.7]);

  return (
    <section id="accueil" ref={section} className="relative h-[620vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Scène 3D plein écran */}
        <div className="intro absolute inset-0" style={{ ["--d" as string]: 0 }}>
          <HouseScene tour={tour} />
        </div>
        {/* Voiles pour fondre la scène dans la page */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bone/90 to-transparent sm:h-40" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bone to-transparent" />
        <motion.div className="pointer-events-none absolute inset-0 bg-bone" style={{ opacity: veil }} />

        {/* ----- Accueil ----- */}
        <motion.div
          className="absolute inset-0 flex items-end pb-[14svh] sm:items-center sm:pb-0"
          style={{ opacity: heroOpacity, y: heroY, filter: heroBlur }}
        >
          <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
            <div className="max-w-[640px] rounded-[32px] sm:rounded-none">
              <div className="intro hidden sm:block" style={{ ["--d" as string]: 100 }}>
                <Badge className="max-w-full whitespace-normal leading-relaxed">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-steel" />
                    <span className="relative inline-flex size-2 rounded-full bg-steel" />
                  </span>
                  {hero.badge}
                </Badge>
              </div>
              <h1 className="text-[clamp(2.3rem,5.6vw,5rem)] sm:mt-6 font-medium leading-[1] tracking-[-0.035em] text-ink">
                <Words text={hero.titleStart} start={200} />
                <Words text={hero.titleAccent} start={560} className="font-serif font-normal italic tracking-[-0.01em] text-steel" />
              </h1>
              <p className="intro mt-5 max-w-[30rem] text-[1rem] leading-[1.65] text-ink-2 sm:mt-6 sm:text-[1.12rem]" style={{ ["--d" as string]: 900 }}>
                {hero.lead}
              </p>
              <div className="intro mt-7 flex flex-wrap items-center gap-3 sm:mt-8" style={{ ["--d" as string]: 1050 }}>
                <Magnetic>
                  <Button asChild size="lg">
                    <a href={contact.phoneHref}>
                      <Phone /> {contact.phoneDisplay}
                    </a>
                  </Button>
                </Magnetic>
                <Magnetic>
                  <Button asChild variant="outline" size="lg">
                    <a href="#prestations">{hero.ctaSecondary}</a>
                  </Button>
                </Magnetic>
              </div>
            </div>
          </div>
          <div
            className="intro absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-stone sm:flex"
            style={{ ["--d" as string]: 1500 }}
          >
            {intro.scrollHint}
            <span className="grid size-9 place-items-center rounded-full border border-ink/10 bg-paper/60 backdrop-blur">
              <ArrowDown className="size-4 animate-bounce" />
            </span>
          </div>
        </motion.div>

        {/* ----- Étapes de la visite ----- */}
        {intro.steps.map((step, i) => (
          <StepPanel key={step.key} step={step} win={WINDOWS[i]} progress={scrollYProgress} />
        ))}

        {/* ----- Repères de progression ----- */}
        <motion.ol
          className="absolute top-1/2 right-5 hidden -translate-y-1/2 flex-col gap-4 sm:right-8 md:flex"
          style={{ opacity: railOpacity }}
          aria-hidden
        >
          {intro.steps.map((step, i) => (
            <RailItem key={step.key} label={step.label} index={step.index} win={WINDOWS[i]} progress={scrollYProgress} />
          ))}
        </motion.ol>

        <motion.p
          className="absolute bottom-6 left-5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-stone sm:left-8"
          style={{ opacity: railOpacity }}
        >
          {intro.note} · 12 × 8 m
        </motion.p>

        {/* ----- Fin de la visite ----- */}
        <motion.div
          className="absolute inset-0 grid place-items-center px-5 text-center"
          style={{ opacity: outroOpacity, y: outroY }}
        >
          <div>
            <h2 className="text-[clamp(2.4rem,6vw,5rem)] font-medium leading-[1] tracking-[-0.035em]">
              {intro.outro.title} <span className="font-serif font-normal italic text-steel">{intro.outro.accent}</span>
            </h2>
            <Button asChild size="lg" className="mt-8">
              <a href="#prestations">
                {intro.outro.cta} <ArrowRight />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StepPanel({
  step,
  win,
  progress,
}: {
  step: (typeof intro.steps)[number];
  win: [number, number];
  progress: MotionValue<number>;
}) {
  const [a, b] = win;
  const opacity = useTransform(progress, [a - 0.02, a + 0.02, b - 0.03, b], [0, 1, 1, 0]);
  const y = useTransform(progress, [a - 0.02, a + 0.02, b - 0.03, b], [40, 0, 0, -30]);
  const pointer = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));
  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 px-3 pb-3 sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-8 sm:max-w-[440px] sm:-translate-y-1/2 sm:px-0 sm:pb-0 lg:left-[max(2rem,calc((100vw-1240px)/2+2rem))]"
      style={{ opacity, y, pointerEvents: pointer }}
    >
      <div className="rounded-[28px] border border-ink/[0.07] bg-paper/80 p-6 shadow-[0_30px_70px_-40px_rgba(15,18,21,0.5)] backdrop-blur-xl sm:p-8">
        <p className="flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-stone">
          <span className="rounded-full border border-ink/10 px-2 py-0.5 text-steel">{step.index}</span>
          {step.label}
        </p>
        <h2 className="mt-4 text-[clamp(1.9rem,3.4vw,2.9rem)] font-medium leading-[1.02] tracking-[-0.03em]">
          {step.title} <span className="font-serif font-normal italic text-steel">{step.accent}</span>
        </h2>
        <p className="mt-4 text-[1rem] leading-[1.7] text-ink-2">{step.text}</p>
      </div>
    </motion.div>
  );
}

function RailItem({
  label,
  index,
  win,
  progress,
}: {
  label: string;
  index: string;
  win: [number, number];
  progress: MotionValue<number>;
}) {
  const [a, b] = win;
  const active = useTransform(progress, [a - 0.03, a, b, b + 0.03], [0, 1, 1, 0]);
  const width = useTransform(active, [0, 1], [10, 34]);
  const color = useTransform(active, [0, 1], ["rgba(15,18,21,0.25)", "rgba(62,91,116,1)"]);
  const textOpacity = useTransform(active, [0, 1], [0, 1]);
  return (
    <li className="flex items-center justify-end gap-3">
      <motion.span className={cn("font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink")} style={{ opacity: textOpacity }}>
        {label}
      </motion.span>
      <span className="font-mono text-[0.62rem] text-stone">{index}</span>
      <motion.span className="h-[2px] rounded-full" style={{ width, backgroundColor: color }} />
    </li>
  );
}
