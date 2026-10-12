"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";

import { method } from "@/content/site";
import { cn } from "@/lib/utils";
import { SectionHead } from "@/components/sections/SectionHead";
import { Reveal } from "@/components/site/Motion";

/** Frise : la ligne centrale se trace au fil du défilement, les phases alternent de part et d'autre. */
export function Method() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });

  return (
    <section id="methode" className="relative bg-sand/45 py-28 sm:py-36">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHead index="04" eyebrow={method.eyebrow} title={method.title} accent={["quatre", "phases."]} lead={method.lead} />
        <ol ref={ref} className="relative mt-16 grid gap-14 sm:mt-24 md:gap-6">
          <span className="absolute top-0 bottom-0 left-4 w-px bg-ink/10 md:left-1/2" aria-hidden />
          <motion.span className="absolute top-0 bottom-0 left-4 w-px origin-top bg-steel md:left-1/2" style={{ scaleY }} aria-hidden />
          {method.steps.map((s, i) => {
            const right = i % 2 === 1;
            return (
              <li key={s.title} className="relative grid pl-14 md:grid-cols-2 md:pl-0">
                <span className="absolute top-0 left-4 z-10 grid size-9 -translate-x-1/2 place-items-center rounded-full border border-steel/30 bg-paper font-mono text-[0.75rem] text-steel shadow-[0_8px_20px_-10px_rgba(62,91,116,0.6)] md:left-1/2">
                  {i + 1}
                </span>
                <Reveal
                  from={right ? "right" : "left"}
                  className={cn(right ? "md:col-start-2 md:pl-16" : "md:pr-16 md:text-right")}
                >
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-stone">Phase {i + 1}</p>
                  <h3 className="mt-3 text-[clamp(1.7rem,3vw,2.4rem)] font-medium tracking-[-0.02em]">{s.title}</h3>
                  <p className={cn("mt-3 max-w-[26rem] text-[1.02rem] leading-[1.7] text-ink-2", !right && "md:ml-auto")}>{s.text}</p>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
