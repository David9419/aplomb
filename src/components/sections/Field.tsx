"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";

import { field } from "@/content/site";
import { cn } from "@/lib/utils";
import { SectionHead } from "@/components/sections/SectionHead";
import { Reveal } from "@/components/site/Motion";

/** Photos de chantiers : cadres qui se dévoilent, image en léger parallaxe. */
export function Field() {
  return (
    <section id="terrain" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHead index="03" eyebrow={field.eyebrow} title={field.title} accent={["concrets."]} lead={field.lead} />
        <div className="mt-16 grid gap-4 md:grid-cols-[1.45fr_1fr]">
          {field.photos.map((photo, i) => (
            <Photo key={photo.src} photo={photo} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Photo({ photo, index }: { photo: (typeof field.photos)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const landscape = photo.width > photo.height;

  return (
    <Reveal from="zoom" delay={index * 0.1} className={cn(landscape ? "md:self-end" : "")}>
      <figure className="group">
        <div
          ref={ref}
          className={cn(
            "relative overflow-hidden rounded-[28px] bg-sand",
            landscape ? "aspect-[4/3]" : "aspect-[3/4] md:aspect-[4/5]",
          )}
        >
          <motion.div className="absolute -inset-y-[8%] inset-x-0" style={{ y }}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes={landscape ? "(min-width: 768px) 700px, 100vw" : "(min-width: 768px) 480px, 100vw"}
              className="object-cover transition-transform duration-[1.6s] ease-out-expo group-hover:scale-[1.04]"
            />
          </motion.div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/45 to-transparent" />
          <figcaption className="absolute right-4 bottom-4 left-4 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-paper/90 px-3.5 py-1.5 text-[0.85rem] font-medium text-ink backdrop-blur-md">
              {photo.caption}
            </span>
            <span className="rounded-full border border-paper/30 bg-ink/30 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-paper backdrop-blur-md">
              {photo.detail}
            </span>
          </figcaption>
        </div>
      </figure>
    </Reveal>
  );
}
