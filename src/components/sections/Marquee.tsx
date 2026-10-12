import { marquee } from "@/content/site";

export function Marquee() {
  const items = [...marquee, ...marquee];
  return (
    <div className="relative z-10 -rotate-[1.2deg] bg-ink py-5 text-paper shadow-[0_30px_60px_-30px_rgba(15,18,21,0.6)]" aria-hidden>
      <div className="fade-x overflow-hidden">
        <div className="flex w-max animate-marquee items-center hover:[animation-play-state:paused]">
          {items.map((t, i) => (
            <span key={i} className="flex items-center gap-8 pr-8 font-serif text-[clamp(1.6rem,3vw,2.4rem)] italic leading-none">
              {t}
              <svg viewBox="0 0 12 12" className="size-3 text-mist" aria-hidden>
                <path d="M6 0 L12 6 L6 12 L0 6 Z" fill="currentColor" />
              </svg>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
