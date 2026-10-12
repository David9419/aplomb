"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { onReady } from "@/lib/ready";

/** Défilement fluide et amorti ; les liens « #section » glissent jusqu'à leur cible. */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      anchors: { offset: -88, duration: 1.4 },
      prevent: (node) => !!node.closest?.("[role='dialog']"),
    });
    lenis.stop();
    const off = onReady(() => lenis.start());
    return () => {
      off();
      lenis.destroy();
    };
  }, []);
  return null;
}
