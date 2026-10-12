import { Check, Minus } from "lucide-react";

import { independence } from "@/content/site";
import { Reveal, ScrollText } from "@/components/site/Motion";
import { LogoMark } from "@/components/Logo";

export function Independence() {
  return (
    <section id="independance" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <p className="flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-stone">
            <span className="rounded-full border border-ink/10 px-2 py-0.5">05</span>
            {independence.eyebrow}
          </p>
        </Reveal>
        <ScrollText
          text={`« ${independence.quote} »`}
          className="mt-8 max-w-[1000px] font-serif text-[clamp(2.1rem,5vw,4.4rem)] leading-[1.08] tracking-[-0.01em]"
        />

        <div className="mt-20 grid gap-4 md:grid-cols-2">
          <Reveal from="left">
            <div className="h-full rounded-[28px] border border-ink/[0.08] bg-paper/50 p-8 sm:p-10">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-stone">{independence.columns[1]}</p>
              <ul className="mt-8 grid gap-6">
                {independence.rows.map((r) => (
                  <li key={r.q} className="grid gap-1.5">
                    <span className="text-[0.85rem] text-stone">{r.q}</span>
                    <span className="flex items-center gap-3 text-[1.1rem] text-ink-2">
                      <Minus className="size-4 shrink-0 text-stone" /> {r.them}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal from="right" delay={0.1}>
            <div className="relative h-full overflow-hidden rounded-[28px] bg-steel p-8 text-paper shadow-[0_40px_80px_-40px_rgba(62,91,116,0.8)] sm:p-10">
              <LogoMark className="absolute -right-8 -bottom-10 size-56 text-paper/[0.07]" bob="rgba(251,250,247,0.07)" />
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-mist">{independence.columns[2]} · Aplomb</p>
              <ul className="relative mt-8 grid gap-6">
                {independence.rows.map((r) => (
                  <li key={r.q} className="grid gap-1.5">
                    <span className="text-[0.85rem] text-mist/80">{r.q}</span>
                    <span className="flex items-center gap-3 text-[1.1rem]">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-paper text-steel">
                        <Check className="size-3.5" strokeWidth={2.5} />
                      </span>
                      <span>
                        <b className="font-semibold">{r.us}</b>
                        {r.usRest}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
