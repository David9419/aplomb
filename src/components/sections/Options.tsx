import { ArrowRight, Hammer, Users } from "lucide-react";

import { options } from "@/content/site";
import { cn } from "@/lib/utils";
import { SectionHead } from "@/components/sections/SectionHead";
import { Reveal, TiltCard } from "@/components/site/Motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ICONS = [Users, Hammer];

/** Les deux façons de travailler : accompagnement ou réalisation. */
export function Options() {
  return (
    <section id="possibilites" className="relative overflow-x-clip py-28 sm:py-36">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHead index="01" eyebrow={options.eyebrow} title={options.title} accent={["selon", "votre", "projet."]} lead={options.lead} />
        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {options.items.map((item, i) => {
            const Icon = ICONS[i];
            const dark = i === 1;
            return (
              <Reveal key={item.tag} from={i ? "right" : "left"} delay={i * 0.08}>
                <TiltCard
                  className={cn(
                    "group h-full overflow-hidden rounded-[32px] p-8 sm:p-11",
                    dark
                      ? "bg-ink text-paper [&::before]:bg-[radial-gradient(420px_circle_at_var(--mx,50%)_var(--my,50%),rgba(143,178,201,0.2),transparent_65%)]"
                      : "border border-ink/[0.08] bg-paper shadow-[0_40px_80px_-50px_rgba(15,18,21,0.45)]",
                  )}
                >
                  {dark && <div className="blueprint-dark absolute inset-0 -z-10" />}
                  <div className="flex items-start justify-between">
                    <span
                      className={cn(
                        "grid size-14 place-items-center rounded-2xl transition-transform duration-700 ease-out-expo group-hover:-rotate-6",
                        dark ? "bg-paper text-ink" : "bg-ink text-paper",
                      )}
                    >
                      <Icon className="size-6" strokeWidth={1.5} />
                    </span>
                    <Badge variant={dark ? "dark" : "steel"}>{item.tag}</Badge>
                  </div>
                  <h3 className="mt-14 text-[clamp(1.9rem,3.4vw,2.8rem)] font-medium leading-[1.02] tracking-[-0.03em]">
                    {item.title}
                  </h3>
                  <p className={cn("mt-5 max-w-[30rem] text-[1.04rem] leading-[1.75]", dark ? "text-mist/75" : "text-ink-2")}>
                    {item.text}
                  </p>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="mt-10 flex justify-center">
          <Button asChild size="lg">
            <a href="#contact">
              {options.cta} <ArrowRight />
            </a>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
