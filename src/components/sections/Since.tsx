"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";

import { since } from "@/content/site";
import { Reveal, SplitHeading } from "@/components/site/Motion";
import { Button } from "@/components/ui/button";

/** « Depuis 2005 » : grande date en contour qui glisse au défilement. */
export function Since() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["8%", "-12%"]);

  return (
    <section ref={ref} id="depuis-2005" className="relative overflow-hidden py-28 sm:py-40">
      <motion.p
        aria-hidden
        style={{ x }}
        className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 select-none whitespace-nowrap text-[38vw] font-semibold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1.5px_rgba(62,91,116,0.16)] md:text-[30vw]"
      >
        2005
      </motion.p>
      <div className="relative mx-auto grid max-w-[1240px] gap-10 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <Reveal>
            <p className="flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-stone">
              <span className="rounded-full border border-ink/10 px-2 py-0.5">05</span>
              {since.eyebrow}
            </p>
          </Reveal>
          <SplitHeading
            text={since.title}
            accent={["terrain"]}
            className="mt-6 text-[clamp(2.4rem,5.4vw,4.6rem)] font-medium leading-[1] tracking-[-0.035em]"
          />
        </div>
        <Reveal delay={0.15}>
          <p className="text-[1.08rem] leading-[1.75] text-ink-2">{since.text}</p>
          <Button asChild variant="outline" size="lg" className="mt-8">
            <Link href="/experience">
              {since.cta} <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
