"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowDown, ArrowRight, Phone } from "lucide-react";

import { contact, hero, intro } from "@/content/site";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/site/Motion";
import { atFrame, DroneStage } from "@/components/sections/DroneStage";

// Fenêtres de défilement de chaque étape, calées sur les images du plan-séquence :
// vue d'ensemble (drone en hauteur), façades (descente vers la piscine), séjour, cuisine, puis conclusion.
const WINDOWS: [number, number][] = [
  [atFrame(7), atFrame(44)],
  [atFrame(56), atFrame(106)],
  [atFrame(138), atFrame(166)],
  [atFrame(171), atFrame(192)],
  [0.872, 0.95],
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
 * Ouverture plein écran : un plan-séquence de drone piloté par le défilement
 * (vue du ciel, descente vers la piscine, entrée dans le séjour, cuisine), avec le texte qui accompagne.
 */
export function Tour() {
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.03], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.03], [0, -60]);
  const heroBlur = useTransform(scrollYProgress, [0, 0.03], ["blur(0px)", "blur(8px)"]);
  const railOpacity = useTransform(scrollYProgress, [0.04, 0.07, 0.95, 0.97], [0, 1, 1, 0]);
  const outroOpacity = useTransform(scrollYProgress, [0.955, 0.99], [0, 1]);
  const outroY = useTransform(scrollYProgress, [0.955, 0.99], [30, 0]);
  const veil = useTransform(scrollYProgress, [0.94, 1], [0, 0.7]);

  return (
    <section id="accueil" ref={section} className="relative h-[760vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Images plein écran */}
        <DroneStage progress={scrollYProgress} />
        {/* Voiles pour fondre la scène dans la page */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bone/90 to-transparent sm:h-40" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bone to-transparent" />
        <motion.div className="pointer-events-none absolute inset-0 bg-bone" style={{ opacity: veil }} />

        {/* Voile clair derrière le titre (ordinateur) pour que le texte reste lisible sur la maquette */}
        <motion.div
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[62%] bg-gradient-to-r from-bone via-bone/75 to-transparent sm:block"
          style={{ opacity: heroOpacity }}
        />
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-bone via-bone/80 to-transparent sm:hidden"
          style={{ opacity: heroOpacity }}
        />
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
                    <a href="#contact">{hero.cta}</a>
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
          {intro.note}
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
  const [active, setActive] = useState(false);
  useMotionValueEvent(progress, "change", (p) => setActive(p > a + 0.004 && p < b - 0.004));
  const words = [...step.title.split(" ").map((w) => ({ w, accent: false })), ...step.accent.split(" ").map((w) => ({ w, accent: true }))];
  const ease = [0.16, 1, 0.3, 1] as const;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-3 sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-8 sm:w-[460px] sm:-translate-y-1/2 sm:px-0 sm:pb-0 lg:left-[max(2rem,calc((100vw-1240px)/2+2rem))]"
      aria-hidden={!active}
    >
      <motion.div
        className="relative overflow-hidden rounded-[30px] border border-paper/50 bg-paper/78 p-6 shadow-[0_40px_90px_-40px_rgba(15,18,21,0.55)] backdrop-blur-2xl sm:p-9"
        initial={false}
        animate={active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 34, scale: 0.98 }}
        transition={{ duration: active ? 0.8 : 0.45, ease }}
      >
        <motion.span
          className="absolute top-0 left-0 h-[3px] bg-steel"
          initial={false}
          animate={{ width: active ? "100%" : "0%" }}
          transition={{ duration: 1.4, ease, delay: active ? 0.15 : 0 }}
        />
        <p className="flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-stone">
          <span className="rounded-full border border-ink/10 px-2 py-0.5 text-steel">{step.index}</span>
          {step.label}
        </p>
        <h2 className="mt-4 text-[clamp(2rem,3.6vw,3.1rem)] font-medium leading-[1.02] tracking-[-0.03em]">
          {words.map(({ w, accent }, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span
                className={cn("inline-block", accent && "font-serif font-normal italic text-steel")}
                initial={false}
                animate={active ? { y: "0%", opacity: 1, filter: "blur(0px)" } : { y: "110%", opacity: 0, filter: "blur(6px)" }}
                transition={{ duration: 0.75, ease, delay: active ? 0.12 + i * 0.07 : 0 }}
              >
                {w}
              </motion.span>
              {"\u00a0"}
            </span>
          ))}
        </h2>
        <motion.p
          className="mt-4 text-[1rem] leading-[1.7] text-ink-2"
          initial={false}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.7, ease, delay: active ? 0.35 + words.length * 0.05 : 0 }}
        >
          {step.text}
        </motion.p>
      </motion.div>
    </div>
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
