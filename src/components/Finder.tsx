"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { finder } from "@/content/site";

export function Finder() {
  const [key, setKey] = useState(finder.options[0].key);
  const current = finder.options.find((o) => o.key === key) ?? finder.options[0];

  return (
    <div className="finder">
      <div className="finder-q" role="group" aria-label={finder.question}>
        <h3>{finder.question}</h3>
        {finder.options.map((o, i) => (
          <button
            key={o.key}
            type="button"
            className="opt"
            aria-pressed={o.key === key}
            onClick={() => setKey(o.key)}
          >
            <span className="k">{String(i + 1).padStart(2, "0")}</span>
            {o.label}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            className="finder-a"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.28 }}
          >
            <p className="mono">{current.mission}</p>
            <h4>{current.title}</h4>
            <p>{current.text}</p>
            <ol>
              {current.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <div>
              <a className="btn solid" href="#contact">
                {finder.cta}
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
