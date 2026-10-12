"use client";

import { motion } from "motion/react";
import { MapPin } from "lucide-react";

import { area } from "@/content/site";
import { SectionHead } from "@/components/sections/SectionHead";
import { CountUp, Reveal } from "@/components/site/Motion";

// Schéma (pas une carte exacte) : Paris au centre, les départements autour selon leur direction.
const POINTS = [
  { code: "75", x: 200, y: 170, main: true },
  { code: "95", x: 186, y: 58 },
  { code: "93", x: 286, y: 118 },
  { code: "92", x: 108, y: 168 },
  { code: "94", x: 288, y: 224 },
  { code: "91", x: 192, y: 312 },
];

export function Area() {
  return (
    <section id="secteur" className="relative overflow-hidden py-28 sm:py-36">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHead index="06" eyebrow={area.eyebrow} title={area.title} accent={["Paris", "l'Île-de-France"]} lead={area.lead} />

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal from="zoom">
            <div className="relative mx-auto aspect-square w-full max-w-[460px]">
              <svg viewBox="0 0 400 400" className="size-full" aria-label="Schéma du secteur : Paris, Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne, Val-d'Oise, Essonne">
                {[60, 120, 180].map((r, i) => (
                  <motion.circle
                    key={r}
                    cx="200"
                    cy="170"
                    r={r}
                    fill="none"
                    stroke="var(--color-steel)"
                    strokeOpacity={0.22 - i * 0.05}
                    strokeDasharray="3 6"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.6, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
                <line x1="200" y1="0" x2="200" y2="400" stroke="var(--color-ink)" strokeOpacity="0.06" />
                <line x1="0" y1="170" x2="400" y2="170" stroke="var(--color-ink)" strokeOpacity="0.06" />
                {POINTS.filter((p) => !p.main).map((p, i) => (
                  <motion.line
                    key={p.code}
                    x1="200"
                    y1="170"
                    x2={p.x}
                    y2={p.y}
                    stroke="var(--color-steel)"
                    strokeWidth="1.2"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                  />
                ))}
                {POINTS.map((p, i) => (
                  <motion.g
                    key={p.code}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 260, damping: 18 }}
                    style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                  >
                    {p.main && (
                      <circle cx={p.x} cy={p.y} r="34" fill="var(--color-steel)" opacity="0.12">
                        <animate attributeName="r" values="26;46;26" dur="3.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.18;0;0.18" dur="3.2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={p.x} cy={p.y} r={p.main ? 26 : 21} fill={p.main ? "var(--color-ink)" : "var(--color-paper)"} stroke="var(--color-ink)" strokeOpacity="0.15" />
                    <text
                      x={p.x}
                      y={p.y + 5}
                      textAnchor="middle"
                      className="font-mono"
                      fontSize="14"
                      fill={p.main ? "var(--color-paper)" : "var(--color-ink)"}
                    >
                      {p.code}
                    </text>
                  </motion.g>
                ))}
              </svg>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {area.zones.map((z, i) => (
              <Reveal key={z.code} delay={i * 0.08}>
                <div className="group h-full rounded-[24px] border border-ink/[0.08] bg-paper p-5 transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-[0_30px_60px_-35px_rgba(15,18,21,0.45)] sm:p-8">
                  <CountUp to={Number(z.code)} className="block text-[clamp(2.6rem,5vw,4rem)] font-medium leading-none tracking-[-0.04em] tabular-nums transition-colors duration-500 group-hover:text-steel" />
                  <p className="mt-3 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-stone">
                    <MapPin className="size-3.5" /> {z.name}
                  </p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.35} className="col-span-full">
              <p className="rounded-[24px] border border-dashed border-ink/15 px-6 py-5 text-center font-serif text-[1.5rem] italic text-ink-2">
                {area.more}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
