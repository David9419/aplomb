import type { Metadata } from "next";
import { Check, Clock, FileText, Hammer, Handshake, MapPin, Search } from "lucide-react";

import { pricing } from "@/content/site";
import { PageHero } from "@/components/sections/PageHero";
import { PriceCalculator } from "@/components/sections/PriceCalculator";
import { Contact } from "@/components/sections/Contact";
import { CountUp, Reveal, SplitHeading } from "@/components/site/Motion";

export const metadata: Metadata = {
  title: pricing.meta.title,
  description: pricing.meta.description,
  alternates: { canonical: "/tarifs" },
};

const OTHER_ICONS = [Search, FileText, Hammer, Handshake];

export default function TarifsPage() {
  const { hourly, travel, minimum, others } = pricing;

  return (
    <>
      <PageHero eyebrow={pricing.eyebrow} title={pricing.title} accent={pricing.titleAccent} lead={pricing.lead} />

      {/* Tarif horaire + déplacement + minimum */}
      <section className="relative pb-24 sm:pb-32">
        <div className="mx-auto grid max-w-[1240px] gap-4 px-5 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal from="left">
            <div className="h-full rounded-[32px] border border-ink/[0.08] bg-paper p-8 shadow-[0_40px_80px_-50px_rgba(15,18,21,0.45)] sm:p-11">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-stone">{hourly.label}</p>
              <p className="mt-6 flex items-end gap-3">
                <CountUp to={hourly.price} className="text-[clamp(5rem,12vw,8.5rem)] font-medium leading-[0.85] tracking-[-0.05em] tabular-nums" />
                <span className="pb-2 font-serif text-[clamp(1.4rem,2.6vw,2rem)] italic text-steel">{hourly.unit}</span>
              </p>
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-steel/10 px-3.5 py-1.5 text-[0.9rem] font-medium text-steel">
                <Clock className="size-4" strokeWidth={1.8} /> {hourly.reducedNote}
              </p>
              <p className="mt-10 text-[1rem] text-ink-2">{hourly.intro}</p>
              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {hourly.items.map((item) => (
                  <li key={item} className="flex gap-3 text-[0.98rem] leading-snug">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-steel/10 text-steel">
                      <Check className="size-3" strokeWidth={2.5} />
                    </span>
                    {item.replace(/\.$/, "")}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <div className="grid gap-4">
            <Reveal from="right" delay={0.08}>
              <div className="h-full rounded-[32px] bg-steel p-8 text-paper shadow-[0_40px_80px_-40px_rgba(62,91,116,0.8)] sm:p-10">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-mist">{travel.label}</p>
                  <MapPin className="size-5 text-mist" strokeWidth={1.5} />
                </div>
                <p className="mt-6 flex items-end gap-3">
                  <span className="text-[clamp(3.6rem,7vw,5rem)] font-medium leading-[0.85] tracking-[-0.05em] tabular-nums">{travel.price}</span>
                  <span className="pb-1 font-serif text-[1.3rem] italic text-mist">{travel.unit}</span>
                </p>
                <p className="mt-6 text-[0.98rem] leading-[1.7] text-paper/85">{travel.note}</p>
              </div>
            </Reveal>
            <Reveal from="right" delay={0.16}>
              <div className="h-full rounded-[32px] border border-ink/[0.08] bg-paper p-8 sm:p-10">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-stone">{minimum.label}</p>
                  <Clock className="size-5 text-steel" strokeWidth={1.5} />
                </div>
                <p className="mt-5 text-[1rem] leading-[1.7] text-ink-2">{minimum.text}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Décompte à la minute + simulateur */}
      <section className="relative bg-sand/45 py-24 sm:py-32">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-stone">Décompte du temps</p>
            </Reveal>
            <SplitHeading
              text="Après la première heure, chaque minute compte."
              accent={["minute", "compte."]}
              className="mt-5 text-[clamp(2.1rem,4.2vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.03em]"
            />
            <Reveal delay={0.1}>
              <p className="mt-6 text-[1.04rem] leading-[1.75] text-ink-2">{minimum.detail}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <table className="mt-8 w-full border-collapse text-left">
                <caption className="sr-only">Exemples de facturation</caption>
                <thead>
                  <tr className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-stone">
                    <th scope="col" className="border-b border-ink/10 pb-3 font-normal">Durée</th>
                    <th scope="col" className="border-b border-ink/10 pb-3 font-normal">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {minimum.examples.map((ex) => (
                    <tr key={ex.duration} className="group">
                      <td className="border-b border-ink/10 py-3.5 text-[1rem] tabular-nums">{ex.duration}</td>
                      <td className="border-b border-ink/10 py-3.5 text-[1rem] font-medium tabular-nums transition-colors group-hover:text-steel">
                        {ex.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          </div>
          <Reveal from="right" delay={0.1}>
            <PriceCalculator />
          </Reveal>
        </div>
      </section>

      {/* Autres prestations */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <Reveal>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-stone">Autres prestations</p>
          </Reveal>
          <SplitHeading
            text="Recherches, plans et travaux, sur devis."
            accent={["devis."]}
            className="mt-5 max-w-[900px] text-[clamp(2.1rem,4.2vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.03em]"
          />
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {others.map((o, i) => {
              const Icon = OTHER_ICONS[i];
              return (
                <Reveal key={o.title} delay={(i % 2) * 0.08}>
                  <article className="group h-full rounded-[28px] border border-ink/[0.08] bg-paper p-8 transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-[0_30px_60px_-35px_rgba(15,18,21,0.45)] sm:p-10">
                    <span className="grid size-12 place-items-center rounded-xl bg-ink text-paper transition-colors duration-500 group-hover:bg-steel">
                      <Icon className="size-5" strokeWidth={1.5} />
                    </span>
                    <h3 className="mt-8 text-[1.55rem] font-medium leading-[1.15] tracking-[-0.02em]">{o.title}</h3>
                    <div className="mt-4 grid gap-3">
                      {o.paragraphs.map((p, k) => (
                        <p key={k} className="text-[0.98rem] leading-[1.75] text-ink-2">
                          {p}
                        </p>
                      ))}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Contact title={pricing.cta.title} lead={pricing.cta.text} />
    </>
  );
}
