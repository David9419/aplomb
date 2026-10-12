import Image from "next/image";

import { cn } from "@/lib/utils";

// Logo officiel Baron Conseil Bâtiment (fourni par le client) :
// la maison et le « B » en image (fond transparent), le nom en texte pour rester net à toutes les tailles.
// Fichiers : public/images/logo-mark.png (clair) et logo-mark-light.png (pour fonds sombres).

export function LogoMark({ className, light = false, priority = false }: { className?: string; light?: boolean; priority?: boolean }) {
  return (
    <Image
      src={light ? "/images/logo-mark-light.png" : "/images/logo-mark.png"}
      alt=""
      width={535}
      height={385}
      priority={priority}
      className={cn("h-auto w-12 shrink-0", className)}
    />
  );
}

export function Logo({ className, light = false, compact = false }: { className?: string; light?: boolean; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <LogoMark light={light} priority className={cn("transition-[width] duration-500", compact ? "w-10" : "w-12")} />
      <span className="leading-none">
        <span className={cn("block text-[1.08rem] font-medium uppercase tracking-[0.32em]", light ? "text-paper" : "text-[#1f2b38]")}>
          Baron
        </span>
        <span
          className={cn(
            "mt-1 block overflow-hidden whitespace-nowrap text-[0.6rem] uppercase tracking-[0.26em] transition-[max-height,opacity] duration-500",
            compact ? "max-h-0 opacity-0" : "max-h-4 opacity-100",
            light ? "text-mist/75" : "text-[#3a4652]",
          )}
        >
          Conseil bâtiment
        </span>
      </span>
    </span>
  );
}
