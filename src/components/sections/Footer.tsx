import { contact, footer, nav } from "@/content/site";
import { Logo } from "@/components/Logo";
import { Separator } from "@/components/ui/separator";
import { NavLink } from "@/components/site/NavLink";

export function Footer() {
  return (
    <footer className="relative overflow-hidden pt-20">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-[22rem] text-[0.95rem] leading-[1.7] text-ink-2">{footer.tagline} Paris, 92, 93, 94, 95, 91 et alentours.</p>
          </div>
          <nav aria-label="Pied de page">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-stone">Navigation</p>
            <ul className="mt-4 grid gap-2">
              {nav.map((n) => (
                <li key={n.href}>
                  <NavLink href={n.href} className="text-ink-2 transition-colors hover:text-steel">
                    {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-stone">Contact</p>
            <a href={contact.phoneHref} className="mt-4 block text-[1.4rem] font-medium tabular-nums transition-colors hover:text-steel">
              {contact.phoneDisplay}
            </a>
          </div>
        </div>
        <Separator className="mt-14" />
        <div className="flex flex-wrap justify-between gap-3 py-6 text-[0.85rem] text-stone">
          <span>{footer.copyright}</span>
          <span>{footer.legal}</span>
        </div>
      </div>
      <p
        aria-hidden
        className="pointer-events-none -mb-[0.2em] select-none text-center text-[23vw] font-semibold uppercase leading-[0.8] tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_rgba(15,18,21,0.12)]"
      >
        Baron
      </p>
    </footer>
  );
}
