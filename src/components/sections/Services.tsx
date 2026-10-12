import { ClipboardCheck, ClipboardList, Hammer, Lightbulb, Ruler, Wrench } from "lucide-react";

import { services } from "@/content/site";
import { SectionHead } from "@/components/sections/SectionHead";
import { Reveal, TiltCard } from "@/components/site/Motion";

const ICONS = [Lightbulb, ClipboardList, Wrench, Hammer, Ruler, ClipboardCheck];

/** Les six prestations, en cartes qui s'inclinent sous la souris. */
export function Services() {
  return (
    <section id="prestations" className="relative overflow-hidden bg-ink py-28 text-paper sm:py-36">
      <div className="blueprint-dark absolute inset-0 [mask-image:linear-gradient(180deg,transparent,#000_25%,#000_75%,transparent)]" />
      <div className="absolute top-1/4 -left-40 size-[620px] rounded-full bg-[radial-gradient(circle,rgba(62,91,116,0.45),transparent_65%)]" />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHead index="02" eyebrow={services.eyebrow} title={services.title} accent={["projets", "de", "travaux."]} lead={services.lead} dark />
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.items.map((s, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={s.title} delay={(i % 3) * 0.08}>
                <TiltCard className="group flex h-full flex-col rounded-[26px] border border-paper/10 bg-paper/[0.035] p-7 transition-colors duration-500 hover:border-mist/30 sm:p-8 [&::before]:bg-[radial-gradient(380px_circle_at_var(--mx,50%)_var(--my,50%),rgba(143,178,201,0.18),transparent_65%)]">
                  <div className="flex items-start justify-between [transform:translateZ(30px)]">
                    <span className="grid size-12 place-items-center rounded-xl border border-paper/10 bg-paper/5 text-mist transition-[background-color,color] duration-500 group-hover:bg-mist group-hover:text-ink">
                      <Icon className="size-5" strokeWidth={1.5} />
                    </span>
                    <span className="font-mono text-[0.7rem] text-mist/50">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-10 text-[1.5rem] font-medium leading-[1.15] tracking-[-0.02em] [transform:translateZ(40px)]">{s.title}</h3>
                  <p className="mt-4 text-[0.98rem] leading-[1.7] text-mist/70 [transform:translateZ(20px)]">{s.text}</p>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
