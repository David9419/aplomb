"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { finder } from "@/content/site";
import { cn } from "@/lib/utils";
import { SectionHead } from "@/components/sections/SectionHead";
import { Reveal } from "@/components/site/Motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Finder() {
  const [value, setValue] = useState(finder.options[0].key);

  return (
    <section id="orienteur" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHead index="03" eyebrow={finder.eyebrow} title={finder.question} accent={["situation"]} />
        <Reveal className="mt-14">
          <Tabs value={value} onValueChange={setValue} orientation="vertical" className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <TabsList aria-label={finder.question}>
              {finder.options.map((o, i) => {
                const active = o.key === value;
                return (
                  <TabsTrigger
                    key={o.key}
                    value={o.key}
                    className={cn(
                      "group flex items-center gap-5 rounded-2xl px-5 py-5 transition-colors duration-500 sm:px-6",
                      active ? "text-paper" : "text-ink hover:bg-sand/60",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="finder-pill"
                        className="absolute inset-0 -z-0 rounded-2xl bg-ink"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className={cn("relative font-mono text-[0.72rem]", active ? "text-mist" : "text-stone")}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative flex-1 text-[1.05rem] leading-snug sm:text-[1.12rem]">{o.label}</span>
                    <ArrowRight
                      className={cn(
                        "relative size-5 shrink-0 transition-all duration-500 ease-out-expo",
                        active ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50",
                      )}
                    />
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="relative min-h-[420px] overflow-hidden rounded-[32px] border border-ink/[0.08] bg-paper p-8 shadow-[0_40px_80px_-50px_rgba(15,18,21,0.45)] sm:p-12">
              <div className="blueprint absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_100%_0%,#000,transparent_60%)]" />
              <AnimatePresence mode="wait">
                {finder.options
                  .filter((o) => o.key === value)
                  .map((o) => (
                    <TabsContent key={o.key} value={o.key} forceMount asChild>
                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-steel">{o.mission}</p>
                        <h3 className="mt-5 font-serif text-[clamp(2.4rem,4.4vw,3.6rem)] leading-[1]">{o.title}</h3>
                        <p className="mt-5 max-w-[30rem] text-[1.06rem] leading-[1.7] text-ink-2">{o.text}</p>
                        <ol className="mt-8 grid gap-3">
                          {o.steps.map((s, k) => (
                            <motion.li
                              key={s}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15 + k * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                              className="flex items-center gap-4 rounded-xl border border-ink/[0.07] bg-bone/70 px-4 py-3.5"
                            >
                              <span className="grid size-7 place-items-center rounded-full bg-steel font-mono text-[0.7rem] text-paper">
                                {k + 1}
                              </span>
                              {s}
                            </motion.li>
                          ))}
                        </ol>
                        <Button asChild className="mt-9">
                          <a href="#contact">
                            {finder.cta} <ArrowRight />
                          </a>
                        </Button>
                      </motion.div>
                    </TabsContent>
                  ))}
              </AnimatePresence>
            </div>
          </Tabs>
        </Reveal>
      </div>
    </section>
  );
}
