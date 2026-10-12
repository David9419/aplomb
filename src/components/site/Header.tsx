"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Phone } from "lucide-react";

import { contact, nav } from "@/content/site";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Magnetic } from "@/components/site/Motion";
import { NavLink, useIsActive } from "@/components/site/NavLink";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const isActive = useIsActive();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="intro fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4" style={{ ["--d" as string]: 900 }}>
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-4 rounded-full border px-3 pl-5 transition-all duration-700 ease-out-expo",
          scrolled
            ? "h-[62px] max-w-[980px] border-ink/[0.08] bg-paper/75 shadow-[0_18px_50px_-25px_rgba(15,18,21,0.35)] backdrop-blur-xl"
            : "h-[72px] max-w-[1240px] border-transparent bg-transparent",
        )}
      >
        <NavLink href="/" aria-label="Baron Conseil Bâtiment, accueil">
          <Logo compact={scrolled} />
        </NavLink>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center" onPointerLeave={() => setHovered(null)}>
            {nav.map((item) => (
              <li key={item.href} className="relative">
                <NavLink
                  href={item.href}
                  onPointerEnter={() => setHovered(item.href)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative z-10 block px-4 py-2 text-[0.92rem] transition-colors duration-300 hover:text-ink",
                    isActive(item.href) ? "text-ink" : "text-ink-2",
                  )}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-steel" />
                  )}
                </NavLink>
                {hovered === item.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-sand/80"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Magnetic strength={0.25}>
              <Button asChild size="sm" className="h-11 px-5">
                <a href={contact.phoneHref}>
                  <Phone /> {contact.phoneDisplay}
                </a>
              </Button>
            </Magnetic>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
                <span className="flex flex-col gap-[5px]">
                  <span className="block h-[1.5px] w-5 bg-ink" />
                  <span className="block h-[1.5px] w-3.5 self-end bg-ink" />
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Navigation du site Baron Conseil Bâtiment</SheetDescription>
              <div className="blueprint-dark absolute inset-0 -z-10" />
              <div className="flex items-center justify-between p-6">
                <Logo light />
                <SheetClose asChild>
                  <Button variant="ghostLight" size="icon" aria-label="Fermer le menu">
                    <span className="relative block size-4">
                      <span className="absolute top-1/2 left-0 block h-[1.5px] w-4 rotate-45 bg-paper" />
                      <span className="absolute top-1/2 left-0 block h-[1.5px] w-4 -rotate-45 bg-paper" />
                    </span>
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex-1 px-6 pt-6" aria-label="Menu mobile">
                <ul>
                  {nav.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="border-b border-paper/10"
                    >
                      <NavLink
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="group flex items-center justify-between py-5 font-serif text-[2.4rem] leading-none text-paper"
                      >
                        <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                          {item.label}
                        </span>
                        <ArrowUpRight className="size-6 text-mist/50 transition-transform duration-500 ease-out-expo group-hover:rotate-45 group-hover:text-mist" />
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <motion.div
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
              >
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-mist/60">Appelez directement</p>
                <Button asChild variant="light" size="lg" className="mt-3 w-full">
                  <a href={contact.phoneHref}>
                    <Phone /> {contact.phoneDisplay}
                  </a>
                </Button>
              </motion.div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
