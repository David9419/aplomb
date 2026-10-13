"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Phone } from "lucide-react";

import { contact } from "@/content/site";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

/**
 * Boutons flottants en bas à droite : WhatsApp (toujours visible, disponibilité au survol)
 * et, sur téléphone, un bouton d'appel.
 */
export function CallFloat() {
  const [hover, setHover] = useState(false);
  // sur téléphone (pas de survol), la disponibilité s'affiche quelques secondes à l'arrivée
  const [hint, setHint] = useState(false);
  useEffect(() => {
    const show = window.setTimeout(() => setHint(true), 4200);
    const hide = window.setTimeout(() => setHint(false), 8700);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);
  const open = hover || hint;

  return (
    <motion.div
      className="fixed right-4 bottom-[calc(16px+env(safe-area-inset-bottom,0px))] z-40 flex items-center gap-3 sm:right-6 sm:bottom-6"
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2.6, type: "spring", stiffness: 200, damping: 20 }}
    >
      <motion.a
        href={contact.phoneHref}
        aria-label={`Appeler le ${contact.phoneDisplay}`}
        className="flex items-center gap-2 rounded-full bg-steel py-3.5 pr-5 pl-4 font-medium text-paper shadow-[0_18px_40px_-14px_rgba(62,91,116,0.9)] sm:hidden"
        whileTap={{ scale: 0.92 }}
      >
        <Phone className="size-4" />
        Appeler
      </motion.a>

      <div className="relative" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <AnimatePresence>
          {open && (
            <motion.div
              className="pointer-events-none absolute right-0 bottom-full mb-3 flex items-center gap-2 whitespace-nowrap rounded-2xl border border-ink/10 bg-paper/95 px-4 py-2.5 shadow-[0_18px_40px_-18px_rgba(15,18,21,0.5)] backdrop-blur-md sm:right-full sm:bottom-auto sm:top-1/2 sm:mr-3 sm:mb-0 sm:-translate-y-1/2"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#25D366]/70" />
                <span className="relative inline-flex size-2 rounded-full bg-[#25D366]" />
              </span>
              <span className="text-[0.86rem] font-medium text-ink">{contact.whatsappAvailability}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.a
          href={contact.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${contact.whatsappLabel} — ${contact.whatsappAvailability}`}
          className="relative grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_-12px_rgba(37,211,102,0.75)]"
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-[#25D366]/45" />
          <WhatsAppIcon className="relative size-7" />
        </motion.a>
      </div>
    </motion.div>
  );
}
