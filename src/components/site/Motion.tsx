"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

import { cn } from "@/lib/utils";

const EXPO = [0.16, 1, 0.3, 1] as const;

/** Apparition au scroll : sortie du flou + glissement. */
export function Reveal({
  children,
  className,
  delay = 0,
  from = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "up" | "left" | "right" | "zoom";
}) {
  const initial = {
    up: { opacity: 0, y: 40, filter: "blur(10px)" },
    left: { opacity: 0, x: -50, filter: "blur(10px)" },
    right: { opacity: 0, x: 50, filter: "blur(10px)" },
    zoom: { opacity: 0, scale: 0.94, filter: "blur(10px)" },
  }[from];
  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        // Retire le filtre à la fin : un filtre laissé sur un parent casse les flous d'arrière-plan.
        transitionEnd: { filter: "none" },
      }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.1, delay, ease: EXPO }}
    >
      {children}
    </motion.div>
  );
}

/** Titre qui monte mot par mot quand il entre à l'écran. */
export function SplitHeading({
  text,
  className,
  as: Tag = "h2",
  accent,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  /** Mots à mettre en italique serif (repérés tels quels dans le texte). */
  accent?: string[];
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const words = text.split(" ");
  return (
    <Tag ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-bottom -mb-[0.1em]">
          <motion.span
            className={cn("inline-block", accent?.includes(w) && "font-serif italic text-steel")}
            initial={{ y: "110%" }}
            animate={inView ? { y: 0 } : undefined}
            transition={{ duration: 1, delay: i * 0.05, ease: EXPO }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Texte dont les mots s'éclairent au fil du défilement. */
export function ScrollText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block whitespace-pre">
      {children}{" "}
    </motion.span>
  );
}

/** Nombre qui se révèle chiffre par chiffre (chaque chiffre défile jusqu'à sa valeur). */
export function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const digits = String(to).split("");
  return (
    <span ref={ref} className={cn("inline-flex overflow-hidden", className)} aria-label={String(to)}>
      {digits.map((d, i) => (
        <span key={i} className="relative inline-block h-[1em] overflow-hidden" aria-hidden>
          <motion.span
            className="flex flex-col"
            initial={{ y: "0%" }}
            animate={inView ? { y: `-${(10 + Number(d)) * 10 / 2}%` } : undefined}
            transition={{ duration: 1.6, delay: i * 0.12, ease: EXPO }}
          >
            {Array.from({ length: 20 }, (_, k) => (
              <span key={k} className="h-[1em] leading-none">
                {k % 10}
              </span>
            ))}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Carte qui s'incline en 3D sous la souris + projecteur lumineux. */
export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 18 });
  const sry = useSpring(ry, { stiffness: 180, damping: 18 });
  return (
    <motion.div
      className={cn("spotlight [transform-style:preserve-3d]", className)}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        rx.set((0.5 - py) * 9);
        ry.set((px - 0.5) * 11);
        e.currentTarget.style.setProperty("--mx", `${px * 100}%`);
        e.currentTarget.style.setProperty("--my", `${py * 100}%`);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Élément « aimanté » qui suit légèrement la souris. */
export function Magnetic({ children, strength = 0.3 }: { children: React.ReactNode; strength?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15 });
  const sy = useSpring(y, { stiffness: 220, damping: 15 });
  return (
    <motion.div
      className="inline-flex"
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Barre de progression de lecture, en haut de l'écran. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[80] h-[2px] origin-left bg-steel"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
