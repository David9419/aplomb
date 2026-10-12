"use client";

import { motion } from "motion/react";
import { Phone } from "lucide-react";

import { contact } from "@/content/site";

/** Bouton d'appel toujours visible sur téléphone. */
export function CallFloat() {
  return (
    <motion.a
      href={contact.phoneHref}
      aria-label={`Appeler le ${contact.phoneDisplay}`}
      className="fixed right-4 bottom-[calc(16px+env(safe-area-inset-bottom,0px))] z-40 flex items-center gap-2 rounded-full bg-steel py-3.5 pr-5 pl-4 font-medium text-paper shadow-[0_18px_40px_-14px_rgba(62,91,116,0.9)] sm:hidden"
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2.6, type: "spring", stiffness: 200, damping: 20 }}
      whileTap={{ scale: 0.92 }}
    >
      <span className="relative grid size-6 place-items-center">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-paper/40" />
        <Phone className="relative size-4" />
      </span>
      Appeler
    </motion.a>
  );
}
