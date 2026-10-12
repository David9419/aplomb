"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MapPin } from "lucide-react";

import { pricing } from "@/content/site";
import { cn } from "@/lib/utils";

const HOURLY = pricing.hourly.price;
const TRAVEL = pricing.travel.price;

/** Règles du client : minimum 1 h, puis décompte à la minute ; déplacement offert dès 3 h sur site. */
export function computePrice(minutes: number, withTravel: boolean) {
  const billedMinutes = Math.max(60, minutes);
  const labour = Math.round(((billedMinutes * HOURLY) / 60) * 100) / 100;
  const travelOffered = minutes >= 180;
  const travel = withTravel && !travelOffered ? TRAVEL : 0;
  return { labour, travel, travelOffered, total: Math.round((labour + travel) * 100) / 100 };
}

const euro = (v: number) =>
  v.toLocaleString("fr-FR", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " € HT";

function formatDuration(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (!h) return `${min} min`;
  return min ? `${h} h ${String(min).padStart(2, "0")}` : `${h} h`;
}

export function PriceCalculator() {
  const [minutes, setMinutes] = useState(90);
  const [withTravel, setWithTravel] = useState(true);
  const id = useId();
  const r = computePrice(minutes, withTravel);
  const pct = ((minutes - 15) / (480 - 15)) * 100;

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-ink p-7 text-paper sm:p-10">
      <div className="blueprint-dark absolute inset-0" />
      <div className="relative">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-mist/70">{pricing.calculator.title}</p>

        <div className="mt-8 flex items-end justify-between gap-4">
          <label htmlFor={`${id}-d`} className="text-[0.95rem] text-mist/80">
            Durée sur site
          </label>
          <span className="text-[2rem] font-medium leading-none tabular-nums">{formatDuration(minutes)}</span>
        </div>
        <input
          id={`${id}-d`}
          type="range"
          min={15}
          max={480}
          step={15}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-paper/15 accent-mist [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-paper [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_#c9d3dc]"
          style={{ background: `linear-gradient(90deg, #c9d3dc ${pct}%, rgba(251,250,247,0.15) ${pct}%)` }}
        />
        <div className="mt-2 flex justify-between font-mono text-[0.62rem] text-mist/50">
          <span>15 min</span>
          <span>3 h</span>
          <span>8 h</span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={withTravel}
          onClick={() => setWithTravel((v) => !v)}
          className="mt-7 flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-paper/10 bg-paper/5 px-4 py-3.5 text-left transition-colors hover:border-paper/25"
        >
          <span className="flex items-center gap-3 text-[0.95rem]">
            <MapPin className="size-4 text-mist" /> Déplacement sur site en Île-de-France
          </span>
          <span className={cn("relative h-6 w-11 rounded-full transition-colors duration-300", withTravel ? "bg-mist" : "bg-paper/20")}>
            <motion.span
              className="absolute top-1 size-4 rounded-full bg-ink"
              animate={{ left: withTravel ? 24 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          </span>
        </button>

        <dl className="mt-8 grid gap-3 border-t border-paper/10 pt-6 text-[0.98rem]">
          <div className="flex justify-between gap-4">
            <dt className="text-mist/75">
              Intervention{minutes < 60 ? " (minimum 1 h)" : ""}
            </dt>
            <dd className="tabular-nums">{euro(r.labour)}</dd>
          </div>
          {withTravel && (
            <div className="flex justify-between gap-4">
              <dt className="text-mist/75">Déplacement</dt>
              <dd className="tabular-nums">{r.travelOffered ? <span className="text-mist">Offert (3 h et plus)</span> : euro(r.travel)}</dd>
            </div>
          )}
        </dl>
        <div className="mt-6 flex items-end justify-between gap-4 border-t border-paper/10 pt-6">
          <span className="text-[0.95rem] text-mist/75">Total estimé</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={r.total}
              className="text-[clamp(2.2rem,5vw,3rem)] font-medium leading-none tracking-[-0.03em] tabular-nums"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {euro(r.total)}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="mt-6 text-[0.8rem] leading-relaxed text-mist/55">{pricing.calculator.note}</p>
      </div>
    </div>
  );
}
