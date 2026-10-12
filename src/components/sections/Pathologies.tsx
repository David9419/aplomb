import { AlignVerticalSpaceAround, CloudRain, Droplets, Hammer, Layers, Wind } from "lucide-react";

import { pathologies } from "@/content/site";
import { SectionHead } from "@/components/sections/SectionHead";
import { Reveal, TiltCard } from "@/components/site/Motion";

const ICONS = [AlignVerticalSpaceAround, Droplets, CloudRain, Wind, Layers, Hammer];

export function Pathologies() {
  return (
    <section id="pathologies" className="relative overflow-hidden bg-ink py-28 text-paper sm:py-36">
      <div className="blueprint-dark absolute inset-0 [mask-image:linear-gradient(180deg,transparent,#000_30%,#000_70%,transparent)]" />
      <div className="absolute top-1/3 -right-40 size-[600px] rounded-full bg-[radial-gradient(circle,rgba(62,91,116,0.45),transparent_65%)]" />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHead
          index="02"
          eyebrow={pathologies.eyebrow}
          title={pathologies.title}
          accent={["cause."]}
          lead={pathologies.lead}
          dark
        />
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pathologies.items.map((p, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={p.title} delay={(i % 3) * 0.08}>
                <TiltCard className="group h-full rounded-[26px] border border-paper/10 bg-paper/[0.035] p-7 transition-colors duration-500 hover:border-mist/30 [&::before]:bg-[radial-gradient(380px_circle_at_var(--mx,50%)_var(--my,50%),rgba(143,178,201,0.18),transparent_65%)]">
                  <div className="flex items-start justify-between [transform:translateZ(30px)]">
                    <span className="grid size-12 place-items-center rounded-xl border border-paper/10 bg-paper/5 text-mist transition-[background-color,color] duration-500 group-hover:bg-mist group-hover:text-ink">
                      <Icon className="size-5" strokeWidth={1.5} />
                    </span>
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-mist/60">{p.code}</span>
                  </div>
                  <h3 className="mt-10 text-[1.6rem] font-medium tracking-[-0.02em] [transform:translateZ(40px)]">{p.title}</h3>
                  <p className="mt-3 text-[0.98rem] leading-[1.65] text-mist/70 [transform:translateZ(20px)]">{p.text}</p>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
