"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ClipboardCheck, HardHat, Ruler, ScanSearch } from "lucide-react";

import { services } from "@/content/site";
import { SectionHead } from "@/components/sections/SectionHead";
import { Badge } from "@/components/ui/badge";

const ICONS = [Ruler, ScanSearch, HardHat, ClipboardCheck];
const TONES = ["bg-paper", "bg-[#f6f2ea]", "bg-[#eef1f3]", "bg-[#f1ece3]"];

/** Cartes qui s'empilent au défilement (chaque carte se fige puis rétrécit sous la suivante). */
export function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = services.items.length;

  return (
    <section id="prestations" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHead
          index="01"
          eyebrow={services.eyebrow}
          title={services.title}
          accent={["sain", "bien", "construit."]}
          lead={services.lead}
        />
        <div ref={ref} className="relative mt-16 sm:mt-20">
          {services.items.map((s, i) => (
            <StackCard key={s.ref} i={i} n={n} progress={scrollYProgress}>
              <article
                className={`grid gap-8 overflow-hidden rounded-[32px] border border-ink/[0.08] p-7 shadow-[0_40px_80px_-50px_rgba(15,18,21,0.5)] sm:p-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 ${TONES[i]}`}
              >
                <div className="flex flex-col justify-between gap-10">
                  <div className="flex items-center justify-between">
                    <Badge variant="steel">{s.ref}</Badge>
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-stone">{s.tag}</span>
                  </div>
                  <div>
                    <IconTile i={i} />
                    <h3 className="mt-8 text-[clamp(2rem,4vw,3.3rem)] font-medium leading-[1] tracking-[-0.03em]">
                      {s.title}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-8">
                  <p className="font-serif text-[clamp(1.4rem,2.4vw,1.9rem)] leading-[1.25] text-ink">{s.text}</p>
                  <ul className="divide-y divide-ink/10 border-y border-ink/10">
                    {s.points.map((p, k) => (
                      <li key={p} className="flex items-center gap-4 py-4 text-[1rem] text-ink-2">
                        <span className="font-mono text-[0.7rem] text-steel">0{k + 1}</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </StackCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function IconTile({ i }: { i: number }) {
  const Icon = ICONS[i];
  return (
    <span className="grid size-16 place-items-center rounded-2xl bg-ink text-paper shadow-[0_14px_30px_-14px_rgba(15,18,21,0.6)]">
      <Icon className="size-7" strokeWidth={1.4} />
    </span>
  );
}

function StackCard({
  i,
  n,
  progress,
  children,
}: {
  i: number;
  n: number;
  progress: MotionValue<number>;
  children: React.ReactNode;
}) {
  const start = i / n;
  const scale = useTransform(progress, [start, 1], [1, 1 - (n - 1 - i) * 0.045]);
  const opacity = useTransform(progress, [start + 0.15, 1], [1, i === n - 1 ? 1 : 0.55]);
  return (
    <div className="sticky mb-8 last:mb-0" style={{ top: `calc(100px + ${i * 22}px)` }}>
      <motion.div style={{ scale, opacity, transformOrigin: "top center" }}>{children}</motion.div>
    </div>
  );
}
