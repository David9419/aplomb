"use client";

import dynamic from "next/dynamic";
import { ArrowDown, Phone } from "lucide-react";

import { contact, hero } from "@/content/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/site/Motion";

const BuildingScene = dynamic(() => import("@/components/three/BuildingScene"), { ssr: false });

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

export function Hero() {
  return (
    <section id="accueil" className="relative overflow-hidden">
      {/* Fond : trame de plan + halos doux */}
      <div className="blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,#000_20%,transparent_75%)]" />
      <div className="absolute -top-40 right-[-10%] size-[720px] rounded-full bg-[radial-gradient(circle,rgba(201,211,220,0.75),transparent_65%)]" />
      <div className="absolute bottom-[-30%] left-[-10%] size-[640px] rounded-full bg-[radial-gradient(circle,rgba(230,223,211,0.9),transparent_65%)]" />

      <div className="relative mx-auto grid min-h-[100svh] grid-cols-1 max-w-[1240px] items-center gap-6 px-5 pt-28 pb-16 sm:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:pt-28">
        <div className="relative z-10 min-w-0">
          <div className="intro" style={{ ["--d" as string]: 100 }}>
            <Badge className="max-w-full whitespace-normal leading-relaxed">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-steel" />
                <span className="relative inline-flex size-2 rounded-full bg-steel" />
              </span>
              {hero.badge}
            </Badge>
          </div>

          <h1 className="mt-7 text-[clamp(2.6rem,5.1vw,4.9rem)] font-medium leading-[1] tracking-[-0.035em] text-ink">
            <Words text={hero.titleStart} start={200} />
            <Words text={hero.titleAccent} start={560} className="font-serif font-normal italic tracking-[-0.01em] text-steel" />
          </h1>

          <p
            className="intro mt-7 max-w-[34rem] text-[1.12rem] leading-[1.7] text-ink-2"
            style={{ ["--d" as string]: 900 }}
          >
            {hero.lead}
          </p>

          <div className="intro mt-9 flex flex-wrap items-center gap-3" style={{ ["--d" as string]: 1050 }}>
            <Magnetic>
              <Button asChild size="lg">
                <a href={contact.phoneHref}>
                  <Phone /> {hero.ctaPrimary} · {contact.phoneDisplay}
                </a>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button asChild variant="outline" size="lg">
                <a href="#prestations">{hero.ctaSecondary}</a>
              </Button>
            </Magnetic>
          </div>

          <ul className="intro mt-12 grid max-w-[34rem] grid-cols-1 gap-x-6 sm:grid-cols-2 gap-y-3 text-[0.92rem]" style={{ ["--d" as string]: 1200 }}>
            {hero.does.map((t) => (
              <li key={t} className="flex gap-2.5 text-ink-2">
                <span className="mt-[0.55em] size-1.5 shrink-0 rotate-45 bg-steel" />
                {t}
              </li>
            ))}
            {hero.doesNot.map((t) => (
              <li key={t} className="flex gap-2.5 text-stone line-through decoration-stone/50">
                <span className="mt-[0.55em] size-1.5 shrink-0 rotate-45 border border-stone" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Maquette 3D */}
        <div className="intro relative h-[420px] sm:h-[520px] lg:h-[680px]" style={{ ["--d" as string]: 300 }}>
          <BuildingScene />
          <p className="pointer-events-none absolute right-2 bottom-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-stone">
            Maquette interactive · bougez la souris
          </p>
        </div>
      </div>

      <a
        href="#prestations"
        className="intro absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-stone lg:flex"
        style={{ ["--d" as string]: 1500 }}
      >
        Découvrir
        <span className="grid size-9 place-items-center rounded-full border border-ink/10">
          <ArrowDown className="size-4 animate-bounce" />
        </span>
      </a>
    </section>
  );
}
