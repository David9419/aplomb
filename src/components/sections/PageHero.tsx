"use client";

import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";

const EXPO = [0.16, 1, 0.3, 1] as const;

/** En-tête des pages intérieures : grand titre mot par mot sur trame de plan. */
export function PageHero({
  eyebrow,
  title,
  accent,
  lead,
  tags,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  lead?: string;
  tags?: string[];
  children?: React.ReactNode;
}) {
  const words = [...title.split(" ").map((w) => ({ w, a: false })), ...accent.split(" ").map((w) => ({ w, a: true }))];
  return (
    <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28">
      <div className="blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_at_30%_20%,#000_25%,transparent_75%)]" />
      <div className="absolute -top-40 right-[-10%] size-[640px] rounded-full bg-[radial-gradient(circle,rgba(201,211,220,0.8),transparent_65%)]" />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EXPO }}>
          <Badge>
            <span className="size-1.5 rounded-full bg-steel" />
            {eyebrow}
          </Badge>
        </motion.div>
        <h1 className="mt-7 max-w-[1000px] text-[clamp(2.7rem,7vw,6.2rem)] font-medium leading-[0.98] tracking-[-0.04em]">
          {words.map(({ w, a }, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-bottom -mb-[0.1em]">
              <motion.span
                className={a ? "inline-block font-serif font-normal italic tracking-[-0.01em] text-steel" : "inline-block"}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.1 + i * 0.06, ease: EXPO }}
              >
                {w}
                {" "}
              </motion.span>
            </span>
          ))}
        </h1>
        {lead && (
          <motion.p
            className="mt-7 max-w-[36rem] text-[1.12rem] leading-[1.7] text-ink-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: EXPO }}
          >
            {lead}
          </motion.p>
        )}
        {tags && (
          <motion.ul className="mt-9 flex flex-wrap gap-2" initial="h" animate="v" variants={{ v: { transition: { staggerChildren: 0.06, delayChildren: 0.6 } } }}>
            {tags.map((t) => (
              <motion.li
                key={t}
                variants={{ h: { opacity: 0, y: 12 }, v: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.6, ease: EXPO }}
                className="rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-[0.9rem] text-ink-2 backdrop-blur"
              >
                {t}
              </motion.li>
            ))}
          </motion.ul>
        )}
        {children}
      </div>
    </section>
  );
}
