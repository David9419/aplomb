import { cn } from "@/lib/utils";

// Logo Aplomb : un « A » dont la barre est remplacée par un fil à plomb.
// Le fil à plomb est l'outil qui vérifie qu'un mur est droit : la vérité du bâtiment.
export function LogoMark({ className, bob = "var(--color-steel)" }: { className?: string; bob?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M7 44 L24 5 L41 44" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="square" />
      <line x1="24" y1="5" x2="24" y2="27" stroke="currentColor" strokeWidth="1.3" />
      <path d="M24 27 L29 33 L24 42 L19 33 Z" fill={bob} />
    </svg>
  );
}

export function Logo({ className, light = false, compact = false }: { className?: string; light?: boolean; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <LogoMark className={cn("size-9 shrink-0", light ? "text-paper" : "text-ink")} bob={light ? "#8fb2c9" : undefined} />
      <span className="leading-none">
        <span className={cn("block text-[1.05rem] font-semibold uppercase tracking-[0.28em]", light ? "text-paper" : "text-ink")}>
          Aplomb
        </span>
        <span
          className={cn(
            "mt-1 block overflow-hidden whitespace-nowrap font-mono text-[0.58rem] uppercase tracking-[0.18em] transition-[max-height,opacity] duration-500",
            compact ? "max-h-0 opacity-0" : "max-h-4 opacity-100",
            light ? "text-mist/70" : "text-stone",
          )}
        >
          Conseil & expertise bâtiment
        </span>
      </span>
    </span>
  );
}
