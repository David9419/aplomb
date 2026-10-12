"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";

export type V3 = [number, number, number];
export type Shared = { p: number; pointer: { x: number; y: number }; readyAt: number | null };

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
/** 0 → 1 entre a et a+f, 1 jusqu'à b-f, puis → 0 à b. */
export const windowed = (p: number, a: number, b: number, f = 0.03) =>
  Math.min(smooth(clamp01((p - a) / f)), smooth(clamp01((b - p) / f)));

/** Étiquette HTML nette, visible seulement pendant une fenêtre de défilement. */
export function Label({
  position,
  window: [a, b],
  shared,
  children,
}: {
  position: V3;
  window: [number, number];
  shared: React.RefObject<Shared>;
  children: React.ReactNode;
}) {
  const el = useRef<HTMLDivElement>(null);
  useFrame(() => {
    const o = windowed(shared.current.p, a, b);
    if (!el.current) return;
    el.current.style.opacity = String(o);
    el.current.style.transform = `translateY(${(1 - o) * 8}px)`;
    el.current.style.visibility = o < 0.01 ? "hidden" : "visible";
  });
  return (
    <Html position={position} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div ref={el} style={{ opacity: 0, visibility: "hidden" }}>
        {children}
      </div>
    </Html>
  );
}

export function Chip({ title, value, swatch }: { title: string; value?: string; swatch?: string }) {
  return (
    <div className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-ink/10 bg-paper/90 py-1.5 pr-3.5 pl-2 shadow-[0_12px_30px_-14px_rgba(15,18,21,0.45)] backdrop-blur-md">
      {swatch ? (
        <span className="size-5 rounded-full border border-ink/10" style={{ background: swatch }} />
      ) : (
        <span className="grid size-5 place-items-center rounded-full bg-steel/10">
          <span className="size-1.5 rounded-full bg-steel" />
        </span>
      )}
      <span className="text-[11px] font-medium text-ink">{title}</span>
      {value && <span className="font-mono text-[10px] text-stone">{value}</span>}
    </div>
  );
}

export function RoomTag({ name, area }: { name: string; area: string }) {
  return (
    <div className="whitespace-nowrap rounded-2xl border border-ink/10 bg-paper/88 px-3 py-1.5 text-center shadow-[0_10px_24px_-14px_rgba(15,18,21,0.5)] backdrop-blur-md">
      <p className="font-serif text-[13px] leading-none text-ink italic sm:text-[16px]">{name}</p>
      <p className="mt-1 font-mono text-[9px] tracking-[0.12em] text-steel sm:text-[10px]">{area}</p>
    </div>
  );
}

type LineRef = { material: { opacity: number } } | null;

/** Ligne de cote avec ses deux traits d'extrémité et sa valeur. */
export function Dimension({
  from,
  to,
  label,
  shared,
  win,
}: {
  from: V3;
  to: V3;
  label: string;
  shared: React.RefObject<Shared>;
  win: [number, number];
}) {
  const r0 = useRef<LineRef>(null);
  const r1 = useRef<LineRef>(null);
  const r2 = useRef<LineRef>(null);
  const horiz = from[2] === to[2];
  const tick = (p: V3): V3[] =>
    horiz ? [[p[0], p[1], p[2] - 0.35], [p[0], p[1], p[2] + 0.35]] : [[p[0] - 0.35, p[1], p[2]], [p[0] + 0.35, p[1], p[2]]];
  useFrame(() => {
    const o = windowed(shared.current.p, win[0], win[1]);
    for (const r of [r0, r1, r2]) if (r.current) r.current.material.opacity = o;
  });
  const mid: V3 = [(from[0] + to[0]) / 2, from[1], (from[2] + to[2]) / 2];
  return (
    <group>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Line ref={r0 as any} points={[from, to]} color="#3e5b74" lineWidth={1.4} transparent opacity={0} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Line ref={r1 as any} points={tick(from)} color="#3e5b74" lineWidth={1.4} transparent opacity={0} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Line ref={r2 as any} points={tick(to)} color="#3e5b74" lineWidth={1.4} transparent opacity={0} />
      <Label position={mid} window={win} shared={shared}>
        <span className="whitespace-nowrap rounded bg-steel px-1.5 py-0.5 font-mono text-[10px] text-paper">{label}</span>
      </Label>
    </group>
  );
}
