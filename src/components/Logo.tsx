import { cn } from "@/lib/utils";

// Logo Baron Conseil Bâtiment : un « B » tracé comme un plan (deux pièces),
// avec un fil à plomb suspendu dans la pièce du bas — l'outil qui vérifie qu'un ouvrage est droit.
export function LogoMark({ className, bob = "var(--color-steel)" }: { className?: string; bob?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M11 5 V43 M11 5 H27 A8.5 8.5 0 0 1 27 22 H11 M11 22 H29 A10.5 10.5 0 0 1 29 43 H11"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <line x1="25" y1="22" x2="25" y2="29.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M25 29.5 L28.4 33.6 L25 39.5 L21.6 33.6 Z" fill={bob} />
    </svg>
  );
}

export function Logo({ className, light = false, compact = false }: { className?: string; light?: boolean; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <LogoMark className={cn("size-9 shrink-0", light ? "text-paper" : "text-ink")} bob={light ? "#8fb2c9" : undefined} />
      <span className="leading-none">
        <span className={cn("block text-[1.05rem] font-semibold uppercase tracking-[0.3em]", light ? "text-paper" : "text-ink")}>
          Baron
        </span>
        <span
          className={cn(
            "mt-1 block overflow-hidden whitespace-nowrap font-mono text-[0.58rem] uppercase tracking-[0.18em] transition-[max-height,opacity] duration-500",
            compact ? "max-h-0 opacity-0" : "max-h-4 opacity-100",
            light ? "text-mist/70" : "text-stone",
          )}
        >
          Conseil bâtiment
        </span>
      </span>
    </span>
  );
}
