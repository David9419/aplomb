"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

import { onReady } from "@/lib/ready";

/** Défilement fluide et amorti ; les liens « #section » glissent jusqu'à leur cible. */
export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      anchors: { offset: -88, duration: 1.4 },
      prevent: (node) => !!node.closest?.("[role='dialog']"),
    });
    lenisRef.current = lenis;
    lenis.stop();
    const off = onReady(() => lenis.start());
    return () => {
      off();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Changement de page : retour en haut, ou glissement vers la section demandée (« /#contact »).
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    const hash = window.location.hash;
    if (hash) {
      const t = window.setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) lenis.scrollTo(el as HTMLElement, { offset: -88, duration: 1.4, force: true });
      }, 120);
      return () => window.clearTimeout(t);
    }
    lenis.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
