import type { Metadata } from "next";
import Image from "next/image";
import { Award, CalendarClock, HardHat } from "lucide-react";

import { experience, field } from "@/content/site";
import { PageHero } from "@/components/sections/PageHero";
import { Contact } from "@/components/sections/Contact";
import { Reveal, ScrollText, SplitHeading, TiltCard } from "@/components/site/Motion";

export const metadata: Metadata = {
  title: experience.meta.title,
  description: experience.meta.description,
  alternates: { canonical: "/experience" },
};

const FACT_ICONS = [CalendarClock, HardHat, Award];

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`font-mono text-[0.7rem] uppercase tracking-[0.18em] ${dark ? "text-mist/70" : "text-stone"}`}>{children}</p>
  );
}

export default function ExperiencePage() {
  const { intro, specialty, pillars, approach, commitment } = experience;
  const photo = field.photos.find((p) => p.src.includes("vasque")) ?? field.photos[0];

  return (
    <>
      <PageHero eyebrow={experience.eyebrow} title={experience.title} accent={experience.titleAccent} tags={experience.tags} />

      {/* Parcours */}
      <section className="relative pb-28 sm:pb-36">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal from="zoom">
            <figure className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-sand lg:sticky lg:top-28">
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
              <figcaption className="absolute bottom-4 left-4 rounded-full bg-paper/90 px-3.5 py-1.5 text-[0.85rem] font-medium backdrop-blur-md">
                {photo.caption}
              </figcaption>
            </figure>
          </Reveal>
          <div>
            <Reveal>
              <Eyebrow>{intro.eyebrow}</Eyebrow>
            </Reveal>
            <SplitHeading
              text={intro.title}
              accent={["vos", "projets."]}
              className="mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)] font-medium leading-[1.02] tracking-[-0.03em]"
            />
            <div className="mt-8 grid gap-5">
              {intro.paragraphs.map((p, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <p className="text-[1.08rem] leading-[1.8] text-ink-2">{p}</p>
                </Reveal>
              ))}
            </div>
            <div className="mt-12 grid gap-3 sm:grid-cols-3">
              {intro.facts.map((f, i) => {
                const Icon = FACT_ICONS[i];
                return (
                  <Reveal key={f.label} delay={i * 0.08}>
                    <div className="h-full rounded-[22px] border border-ink/[0.08] bg-paper p-5">
                      <Icon className="size-5 text-steel" strokeWidth={1.5} />
                      <p className="mt-5 text-[1.7rem] font-medium leading-none tracking-[-0.03em]">{f.value}</p>
                      <p className="mt-2 text-[0.85rem] leading-snug text-ink-2">{f.label}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Spécialité */}
      <section className="relative overflow-hidden bg-ink py-28 text-paper sm:py-36">
        <div className="blueprint-dark absolute inset-0" />
        <div className="absolute -right-40 top-10 size-[620px] rounded-full bg-[radial-gradient(circle,rgba(62,91,116,0.5),transparent_65%)]" />
        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div>
              <Reveal>
                <Eyebrow dark>{specialty.eyebrow}</Eyebrow>
              </Reveal>
              <SplitHeading
                text={specialty.title}
                accent={["solutions."]}
                className="mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)] font-medium leading-[1.02] tracking-[-0.03em] [&_.text-steel]:text-mist"
              />
            </div>
            <div className="grid gap-5 lg:pt-12">
              {specialty.paragraphs.map((p, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <p className="text-[1.06rem] leading-[1.8] text-mist/75">{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <ol className="mt-16 grid gap-4 md:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <TiltCard className="h-full rounded-[26px] border border-paper/10 bg-paper/[0.04] p-7 sm:p-8 [&::before]:bg-[radial-gradient(380px_circle_at_var(--mx,50%)_var(--my,50%),rgba(143,178,201,0.18),transparent_65%)]">
                  <span className="font-mono text-[0.72rem] text-mist">{String(i + 1).padStart(2, "0")}</span>
                  <div className="mt-4 h-px w-full bg-paper/10">
                    <div className="h-px bg-mist" style={{ width: `${((i + 1) / pillars.length) * 100}%` }} />
                  </div>
                  <h3 className="mt-8 text-[1.55rem] font-medium leading-[1.15] tracking-[-0.02em]">{p.title}</h3>
                  <p className="mt-4 text-[0.98rem] leading-[1.7] text-mist/70">{p.text}</p>
                </TiltCard>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Approche */}
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <Reveal>
            <Eyebrow>{approach.eyebrow}</Eyebrow>
          </Reveal>
          <SplitHeading
            text={approach.title}
            accent={["vos", "besoins."]}
            className="mt-5 max-w-[900px] text-[clamp(2.2rem,4.6vw,3.8rem)] font-medium leading-[1.02] tracking-[-0.03em]"
          />
          <div className="mt-14 border-t border-ink/10">
            {approach.items.map((item, i) => (
              <Reveal key={item.q} delay={i * 0.05}>
                <div className="group grid gap-4 border-b border-ink/10 py-9 transition-colors duration-500 md:grid-cols-[auto_1fr_1fr] md:gap-10">
                  <span className="font-mono text-[0.72rem] text-steel md:pt-2">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-serif text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.1] transition-colors duration-500 group-hover:text-steel">
                    {item.q}
                  </h3>
                  <p className="text-[1.04rem] leading-[1.75] text-ink-2">{item.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement */}
      <section className="relative bg-sand/45 py-28 sm:py-36">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <Reveal>
            <Eyebrow>{commitment.eyebrow}</Eyebrow>
          </Reveal>
          <ScrollText
            text={commitment.title}
            className="mt-6 max-w-[1050px] font-serif text-[clamp(2.1rem,5vw,4.2rem)] leading-[1.08] tracking-[-0.01em]"
          />
          <Reveal className="mt-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-[36rem] text-[1.08rem] leading-[1.75] text-ink-2">{commitment.text}</p>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-steel">{commitment.signature}</p>
          </Reveal>
        </div>
      </section>

      <Contact />
    </>
  );
}
