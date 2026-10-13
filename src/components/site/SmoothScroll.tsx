"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

import { onReady } from "@/lib/ready";

const OFFSET = -88;

/**
 * Défilement fluide et amorti. Les liens « #section » glissent jusqu'à leur cible ;
 * pour un long trajet (par ex. traverser tout le film d'accueil), un court fondu remplace
 * le défilement : plus net et sans saccade.
 */
export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const veil = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const goTo = (el: HTMLElement, smoothOnly = false) => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    const top = el.getBoundingClientRect().top + window.scrollY + OFFSET;
    const far = Math.abs(top - window.scrollY) > window.innerHeight * 2.5;
    if (!far || smoothOnly || !veil.current) {
      lenis.scrollTo(top, { duration: 1.2, force: true });
      return;
    }
    const v = veil.current;
    v.style.transition = "opacity 260ms cubic-bezier(0.4, 0, 0.2, 1)";
    v.style.opacity = "1";
    window.setTimeout(() => {
      lenis.scrollTo(top, { immediate: true, force: true });
      requestAnimationFrame(() => {
        v.style.transition = "opacity 520ms cubic-bezier(0.16, 1, 0.3, 1)";
        v.style.opacity = "0";
      });
    }, 280);
  };

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      prevent: (node) => !!node.closest?.("[role='dialog']"),
    });
    lenisRef.current = lenis;
    lenis.stop();
    const off = onReady(() => lenis.start());

    // liens internes « #section »
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!;
      const el = id.length > 1 ? (document.querySelector(id) as HTMLElement | null) : null;
      if (!el) return;
      e.preventDefault();
      history.replaceState(null, "", id);
      // laisse le menu mobile se refermer avant de partir
      window.setTimeout(() => goTo(el), a.closest("[role='dialog']") ? 320 : 0);
    };
    document.addEventListener("click", onClick);

    return () => {
      off();
      document.removeEventListener("click", onClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Changement de page : retour en haut, ou arrivée sur la section demandée (« /#contact »).
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    const hash = window.location.hash;
    if (hash) {
      const t = window.setTimeout(() => {
        const el = document.querySelector(hash) as HTMLElement | null;
        if (el) lenis.scrollTo(el.getBoundingClientRect().top + window.scrollY + OFFSET, { immediate: true, force: true });
      }, 120);
      return () => window.clearTimeout(t);
    }
    lenis.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return <div ref={veil} aria-hidden className="pointer-events-none fixed inset-0 z-[60] bg-bone opacity-0" />;
}
