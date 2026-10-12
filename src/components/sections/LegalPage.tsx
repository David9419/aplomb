import { Fragment } from "react";

import { PageHero } from "@/components/sections/PageHero";
import { Reveal } from "@/components/site/Motion";

type Legal = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  updated: string;
  sections: { title: string; paragraphs: string[] }[];
};

/** Met en évidence les informations encore à fournir, écrites entre crochets. */
function withPlaceholders(text: string) {
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    part.startsWith("[") ? (
      <mark key={i} className="rounded bg-steel/10 px-1 text-steel">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

const slug = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Mise en page commune des pages légales : sommaire collant + sections numérotées. */
export function LegalPage({ content }: { content: Legal }) {
  return (
    <>
      <PageHero eyebrow={content.eyebrow} title={content.title} accent={content.titleAccent} lead={content.updated} />
      <section className="relative pb-28 sm:pb-36">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[260px_1fr] lg:gap-20">
          <nav aria-label="Sommaire" className="hidden lg:block">
            <ol className="sticky top-32 grid gap-2 border-l border-ink/10 pl-5">
              {content.sections.map((s, i) => (
                <li key={s.title}>
                  <a href={`#${slug(s.title)}`} className="flex gap-3 text-[0.92rem] text-ink-2 transition-colors hover:text-steel">
                    <span className="font-mono text-[0.7rem] text-stone tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="max-w-[760px]">
            {content.sections.map((s, i) => (
              <Reveal key={s.title}>
                <article id={slug(s.title)} className="scroll-mt-32 border-t border-ink/10 py-9 first:border-t-0 first:pt-0">
                  <h2 className="flex items-baseline gap-4 text-[1.6rem] font-medium tracking-[-0.02em]">
                    <span className="font-mono text-[0.75rem] text-steel tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </h2>
                  <div className="mt-4 grid gap-3">
                    {s.paragraphs.map((p, k) => (
                      <p key={k} className="text-[1.02rem] leading-[1.8] text-ink-2">
                        {withPlaceholders(p)}
                      </p>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
