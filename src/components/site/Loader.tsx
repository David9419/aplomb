"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { animate, AnimatePresence, motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";

import { markReady } from "@/lib/ready";

const EXPO = [0.16, 1, 0.3, 1] as const;
const MIN_TIME = 2600;
const MAX_TIME = 8000;

/**
 * Écran d'ouverture :
 * trame de plan, cotes qui se tracent, logo qui se révèle du bas vers le haut, compteur 0 → 100 %.
 * Sur l'accueil, il attend que la maison 3D soit réellement prête (événement « scene:ready »),
 * puis s'ouvre en deux volets sur la scène.
 */
export function Loader() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"loading" | "opening" | "done">("loading");
  const progress = useMotionValue(0);
  const [pct, setPct] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setPct(Math.round(v)));
  const waitScene = useRef(pathname === "/");

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    // Montée régulière jusqu'à 86 %, le reste quand tout est prêt.
    const climb = animate(progress, 86, { duration: MIN_TIME / 1000, ease: [0.4, 0, 0.2, 1] });
    let pageLoaded = document.readyState === "complete";
    let sceneReady = !waitScene.current;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(0, MIN_TIME - (performance.now() - start));
      window.setTimeout(() => {
        climb.stop();
        animate(progress, 100, { duration: 0.5, ease: EXPO }).then(() =>
          window.setTimeout(() => {
            setPhase("opening");
            markReady();
          }, 250),
        );
      }, wait);
    };
    const check = () => {
      if (pageLoaded && sceneReady) finish();
    };
    const onLoad = () => {
      pageLoaded = true;
      check();
    };
    const onScene = () => {
      sceneReady = true;
      check();
    };
    window.addEventListener("load", onLoad);
    window.addEventListener("scene:ready", onScene);
    check();
    const safety = window.setTimeout(finish, MAX_TIME);
    // Filet de sécurité : le site ne reste jamais bloqué derrière l'écran d'ouverture.
    const hardStop = window.setTimeout(() => {
      markReady();
      document.documentElement.style.overflow = "";
      setPhase("done");
    }, MAX_TIME + 4000);
    return () => {
      window.removeEventListener("load", onLoad);
      window.removeEventListener("scene:ready", onScene);
      window.clearTimeout(safety);
      window.clearTimeout(hardStop);
      climb.stop();
    };
  }, [progress]);

  const barScale = useTransform(progress, [0, 100], [0, 1]);
  const reveal = useTransform(progress, [0, 70], ["inset(100% 0 0 0)", "inset(0% 0 0 0)"]);

  if (phase === "done") return null;

  return (
    <div className="fixed inset-0 z-[100]" aria-hidden>
      {/* Deux volets qui s'ouvrent sur le site */}
      {(["top", "bottom"] as const).map((side) => (
        <motion.div
          key={side}
          className={`absolute inset-x-0 h-1/2 overflow-hidden bg-bone ${side === "top" ? "top-0" : "bottom-0"}`}
          animate={phase === "opening" ? { y: side === "top" ? "-100%" : "100%" } : { y: 0 }}
          transition={{ duration: 1.15, ease: [0.76, 0, 0.24, 1], delay: 0.25 }}
          onAnimationComplete={() => {
            if (phase === "opening" && side === "bottom") {
              document.documentElement.style.overflow = "";
              setPhase("done");
            }
          }}
        >
          <div className={`blueprint absolute inset-x-0 h-[100vh] opacity-70 ${side === "top" ? "top-0" : "bottom-0"}`} />
        </motion.div>
      ))}

      <AnimatePresence>
        {phase === "loading" && (
          <motion.div
            key="content"
            className="absolute inset-0 grid place-items-center"
            exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: EXPO }}
          >
            <div className="relative flex flex-col items-center px-6">
              {/* cotes architecturales autour du logo */}
              <svg className="pointer-events-none absolute -inset-x-16 -inset-y-10 h-[calc(100%+5rem)] w-[calc(100%+8rem)] overflow-visible text-steel/50" aria-hidden>
                <motion.line x1="0%" y1="6%" x2="100%" y2="6%" stroke="currentColor" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: EXPO, delay: 0.2 }} />
                <motion.line x1="3%" y1="0%" x2="3%" y2="100%" stroke="currentColor" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: EXPO, delay: 0.35 }} />
                <motion.line x1="97%" y1="0%" x2="97%" y2="100%" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: EXPO, delay: 0.5 }} />
                <motion.line x1="0%" y1="94%" x2="100%" y2="94%" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: EXPO, delay: 0.6 }} />
              </svg>
              <motion.span
                className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.6rem] tracking-[0.2em] text-steel/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                ⟷ CONSEIL · SUIVI · TRAVAUX
              </motion.span>

              <motion.div
                style={{ clipPath: reveal }}
                initial={{ scale: 0.94, filter: "blur(6px)" }}
                animate={{ scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.6, ease: EXPO }}
              >
                <Image src="/images/logo-mark.png" alt="" width={535} height={385} priority className="h-auto w-[150px] sm:w-[190px]" />
              </motion.div>

              <div className="mt-6 flex overflow-hidden text-[1.9rem] font-medium uppercase tracking-[0.42em] text-[#1f2b38] sm:text-[2.3rem]">
                {"Baron".split("").map((l, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1, delay: 0.55 + i * 0.07, ease: EXPO }}
                  >
                    {l}
                  </motion.span>
                ))}
              </div>
              <motion.p
                className="mt-2 text-[0.72rem] uppercase text-[#3a4652]"
                initial={{ opacity: 0, letterSpacing: "0.1em" }}
                animate={{ opacity: 1, letterSpacing: "0.38em" }}
                transition={{ delay: 0.95, duration: 1.4, ease: EXPO }}
              >
                Conseil bâtiment
              </motion.p>
            </div>

            {/* bas de l'écran : statut + compteur */}
            <div className="absolute inset-x-5 bottom-6 flex items-end justify-between gap-6 sm:inset-x-10 sm:bottom-9">
              <motion.p
                className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-stone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {pathname === "/" ? "Préparation de la maquette 3D" : "Chargement"}
              </motion.p>
              <p className="text-[clamp(2.8rem,7vw,5rem)] font-medium leading-none tracking-[-0.04em] text-ink tabular-nums">
                {String(pct).padStart(3, "0")}
                <span className="text-[0.4em] text-steel">%</span>
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-ink/5">
              <motion.div className="h-full origin-left bg-steel" style={{ scaleX: barScale }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
