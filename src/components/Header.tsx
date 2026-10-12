"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { contact, nav } from "@/content/site";
import { Logo } from "@/components/Logo";
import { PhoneIcon } from "@/components/icons";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`top${scrolled || open ? " scrolled" : ""}`}>
      <div className="wrap nav">
        <a href="#accueil" aria-label="Aplomb, retour en haut" onClick={() => setOpen(false)}>
          <Logo />
        </a>
        <ul className="nav-links">
          {nav.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <a className="btn solid" href={contact.phoneHref}>
            <PhoneIcon /> {contact.phoneDisplay}
          </a>
          <button
            type="button"
            className="burger"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="menu-mobile"
            className="mobile-menu"
            aria-label="Menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <ul className="wrap">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
