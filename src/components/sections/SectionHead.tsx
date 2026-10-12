import { cn } from "@/lib/utils";
import { Reveal, SplitHeading } from "@/components/site/Motion";

/** En-tête de section : numéro, sur-titre, grand titre mot par mot, chapeau. */
export function SectionHead({
  index,
  eyebrow,
  title,
  accent,
  lead,
  dark = false,
  className,
}: {
  index: string;
  eyebrow: string;
  title: string;
  accent?: string[];
  lead?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end", className)}>
      <div>
        <Reveal>
          <p className={cn("flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.18em]", dark ? "text-mist/70" : "text-stone")}>
            <span className={cn("rounded-full border px-2 py-0.5", dark ? "border-paper/15" : "border-ink/10")}>{index}</span>
            {eyebrow}
          </p>
        </Reveal>
        <SplitHeading
          text={title}
          accent={accent}
          className={cn(
            "mt-6 text-[clamp(2.2rem,4.8vw,4rem)] font-medium leading-[1.02] tracking-[-0.03em]",
            dark ? "text-paper [&_.text-steel]:text-mist" : "text-ink",
          )}
        />
      </div>
      {lead && (
        <Reveal delay={0.15}>
          <p className={cn("max-w-[30rem] text-[1.06rem] leading-[1.7]", dark ? "text-mist/75" : "text-ink-2")}>{lead}</p>
        </Reveal>
      )}
    </div>
  );
}
