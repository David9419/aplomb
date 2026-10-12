import { Building2, Home } from "lucide-react";

import { audiences } from "@/content/site";
import { SectionHead } from "@/components/sections/SectionHead";
import { Reveal } from "@/components/site/Motion";

const ICONS = [Home, Building2];

export function Audiences() {
  return (
    <section id="pour-qui" className="relative bg-sand/45 py-28 sm:py-36">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHead index="04" eyebrow={audiences.eyebrow} title={audiences.title} accent={["particulier", "professionnel"]} />
        <div className="mt-16 grid gap-px overflow-hidden rounded-[32px] border border-ink/[0.08] bg-ink/[0.08] md:grid-cols-2">
          {audiences.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={item.tag} delay={i * 0.1} className="bg-paper">
                <div className="group relative h-full p-8 transition-colors duration-500 hover:bg-[#f7f4ee] sm:p-12">
                  <div className="flex items-center gap-4">
                    <span className="grid size-12 place-items-center rounded-full border border-ink/10 text-steel transition-colors duration-500 group-hover:border-steel group-hover:bg-steel group-hover:text-paper">
                      <Icon className="size-5" strokeWidth={1.5} />
                    </span>
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-stone">{item.tag}</span>
                  </div>
                  <h3 className="mt-10 font-serif text-[clamp(2rem,3.6vw,2.9rem)] leading-[1.02]">{item.title}</h3>
                  <p className="mt-5 max-w-[30rem] text-[1.04rem] leading-[1.75] text-ink-2">{item.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
