"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { markReady } from "@/lib/ready";

/**
 * Écran d'ouverture : le fil à plomb descend et oscille, le nom apparaît,
 * puis le panneau se lève et le site s'anime (data-ready sur <html>).
 */
export function Loader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, 1700 - (performance.now() - start));
      window.setTimeout(() => setShow(false), wait);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    const safety = window.setTimeout(finish, 4000);
    return () => {
      window.clearTimeout(safety);
      window.removeEventListener("load", finish);
    };
  }, []);

  useEffect(() => {
    if (show) return;
    const t = window.setTimeout(markReady, 250);
    return () => window.clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.documentElement.style.overflow = "";
      }}
    >
      {show && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] grid place-items-center bg-ink text-paper"
          initial={{ clipPath: "inset(0 0 0 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <div className="blueprint-dark absolute inset-0" />
          <div className="relative flex flex-col items-center">
            {/* Fil à plomb qui descend puis oscille */}
            <motion.svg
              viewBox="0 0 40 120"
              className="h-28 w-10 overflow-visible"
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 9, -6, 3.5, -1.5, 0] }}
              transition={{ duration: 1.8, delay: 0.5, ease: "easeInOut" }}
              style={{ originX: "50%", originY: "0%" }}
            >
              <motion.line
                x1="20" y1="0" x2="20" y2="88"
                stroke="currentColor" strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.path
                d="M20 88 L28 100 L20 118 L12 100 Z"
                fill="#8fb2c9"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.svg>
            <div className="mt-8 flex overflow-hidden text-[1.6rem] font-semibold uppercase tracking-[0.5em]">
              {"Aplomb".split("").map((l, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.35 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  {l}
                </motion.span>
              ))}
            </div>
            <motion.p
              className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.3em] text-mist/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              Conseil & expertise bâtiment
            </motion.p>
            <div className="mt-10 h-px w-44 overflow-hidden bg-paper/10">
              <motion.div
                className="h-full bg-mist"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
                style={{ originX: 0 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
