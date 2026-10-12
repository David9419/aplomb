"use client";
/* eslint-disable react-hooks/immutability -- la boucle de rendu Three.js (useFrame) modifie volontairement
   des objets mutables (caméra, matériaux, état partagé) en dehors du rendu React : fonctionnement normal de R3F. */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, Line, PerformanceMonitor, RoundedBox } from "@react-three/drei";
import { EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

import { makeTexture } from "@/components/three/textures";
import { isReady, onReady } from "@/lib/ready";

/* ========================================================================== */
/*  Maison d'illustration : plain-pied 15 × 9 m (135 m²) + garage 4,5 × 6 m.   */
/*  1 unité = 1 mètre. Les surfaces affichées correspondent au modèle.        */
/* ========================================================================== */

export type TourState = { progress: number };
type V3 = [number, number, number];
type Shared = { p: number; pointer: { x: number; y: number }; readyAt: number | null };

const H = 2.8; // hauteur sous plafond
const ET = 0.3; // murs extérieurs
const IT = 0.12; // cloisons
const GROUND = -0.2;
const PITCH = THREE.MathUtils.degToRad(35);
const EAVE = 4.95;
const RISE = EAVE * Math.tan(PITCH);

/* ---------- Outils ---------- */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const windowed = (p: number, a: number, b: number, f = 0.03) =>
  Math.min(smooth(clamp01((p - a) / f)), smooth(clamp01((b - p) / f)));

/* ---------- Matériaux partagés ---------- */
function useMats() {
  return useMemo(() => {
    const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
    return {
      render: std({ color: "#f4f1eb", roughness: 0.95, map: makeTexture("render", 3, 3) }),
      wallIn: std({ color: "#f7f5f0", roughness: 0.95 }),
      accent: std({ color: "#5b7186", roughness: 0.9 }),
      oak: std({ color: "#ffffff", roughness: 0.55, map: makeTexture("oak", 4, 4) }),
      tiles: std({ color: "#ffffff", roughness: 0.35, map: makeTexture("tiles", 3, 3) }),
      bathTiles: std({ color: "#dfe6ea", roughness: 0.3, map: makeTexture("tiles", 4, 4) }),
      concrete: std({ color: "#b8b2a7", roughness: 1 }),
      slab: std({ color: "#cfc6b6", roughness: 1 }),
      stone: std({ color: "#ddd6c8", roughness: 0.85 }),
      slate: std({ color: "#ffffff", roughness: 0.7, map: makeTexture("slate", 6, 3) }),
      zinc: std({ color: "#7d8891", roughness: 0.35, metalness: 0.6 }),
      frame: std({ color: "#2b3036", roughness: 0.45, metalness: 0.4 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#dbe7ee",
        roughness: 0.03,
        metalness: 0.1,
        transparent: true,
        opacity: 0.22,
        envMapIntensity: 2,
        depthWrite: false,
      }),
      grass: std({ color: "#ffffff", roughness: 1, map: makeTexture("grass", 30, 30), transparent: true }),
      deck: std({ color: "#ffffff", roughness: 0.8, map: makeTexture("deck", 3, 3) }),
      paving: std({ color: "#ffffff", roughness: 0.9, map: makeTexture("paving", 1, 6) }),
      gravel: std({ color: "#ffffff", roughness: 1, map: makeTexture("gravel", 3, 8) }),
      cladding: std({ color: "#ffffff", roughness: 0.85, map: makeTexture("cladding", 3, 1) }),
      water: new THREE.MeshPhysicalMaterial({
        color: "#4d9cc0",
        roughness: 0.04,
        metalness: 0.1,
        clearcoat: 1,
        transparent: true,
        opacity: 0.92,
        envMapIntensity: 1.6,
      }),
      poolTile: std({ color: "#9ccbe0", roughness: 0.3 }),
      // mobilier
      linen: std({ color: "#d9d0c2", roughness: 1, map: makeTexture("fabric", 4, 4) }),
      cushionBlue: std({ color: "#5b7186", roughness: 1, map: makeTexture("fabric", 2, 2) }),
      cushionSand: std({ color: "#e8dfd0", roughness: 1, map: makeTexture("fabric", 2, 2) }),
      rug: std({ color: "#e9e2d6", roughness: 1, map: makeTexture("fabric", 6, 6) }),
      marble: std({ color: "#ffffff", roughness: 0.18, map: makeTexture("marble", 1, 1) }),
      cabinet: std({ color: "#3e5b74", roughness: 0.55 }),
      white: std({ color: "#f2efe9", roughness: 0.4 }),
      walnut: std({ color: "#6e4f37", roughness: 0.55 }),
      oakSolid: std({ color: "#b48d63", roughness: 0.6 }),
      black: std({ color: "#1d2024", roughness: 0.35, metalness: 0.5 }),
      brass: std({ color: "#b9965b", roughness: 0.3, metalness: 0.85 }),
      steel: std({ color: "#c9ced2", roughness: 0.25, metalness: 0.9 }),
      ceramic: std({ color: "#ffffff", roughness: 0.15 }),
      screen: std({ color: "#0d0f12", roughness: 0.15, metalness: 0.4 }),
      leaf: std({ color: "#5f7d4f", roughness: 0.9, flatShading: true }),
      leafDark: std({ color: "#4c6a40", roughness: 0.9, flatShading: true }),
      hedge: std({ color: "#55734a", roughness: 1, flatShading: true }),
      trunk: std({ color: "#6b543f", roughness: 1 }),
      pot: std({ color: "#d8cfc1", roughness: 0.8 }),
      terracotta: std({ color: "#b8775a", roughness: 0.9 }),
      lamp: std({ color: "#fff6e3", emissive: "#ffe9c2", emissiveIntensity: 1.6 }),
      bedding: std({ color: "#f5f2ec", roughness: 1, map: makeTexture("fabric", 3, 3) }),
      throw: std({ color: "#5b7186", roughness: 1 }),
      canvas: std({ color: "#efe9df", roughness: 1, side: THREE.DoubleSide }),
      wood: std({ color: "#b58d5f", roughness: 0.75 }),
      garageDoor: std({ color: "#d9dcdf", roughness: 0.5, metalness: 0.2 }),
      ceiling: std({ color: "#fbfaf7", roughness: 1, transparent: true, emissive: "#f1ece4", emissiveIntensity: 0.7 }),
      art1: std({ color: "#c9b79c", roughness: 1 }),
      art2: std({ color: "#3e5b74", roughness: 1 }),
      book: [
        std({ color: "#3e5b74", roughness: 0.9 }),
        std({ color: "#c9b79c", roughness: 0.9 }),
        std({ color: "#8a6a4c", roughness: 0.9 }),
        std({ color: "#e8e1d4", roughness: 0.9 }),
        std({ color: "#1d2024", roughness: 0.9 }),
      ],
    };
  }, []);
}
type Mats = ReturnType<typeof useMats>;

/* ---------- Boîte simple ---------- */
function B({
  p,
  s,
  m,
  r,
  cast = true,
  receive = true,
}: {
  p: V3;
  s: V3;
  m: THREE.Material;
  r?: V3;
  cast?: boolean;
  receive?: boolean;
}) {
  return (
    <mesh position={p} rotation={r} material={m} castShadow={cast} receiveShadow={receive}>
      <boxGeometry args={s} />
    </mesh>
  );
}

/* ========================================================================== */
/*  MURS : segments avec ouvertures (fenêtres, baies, portes)                   */
/* ========================================================================== */

type Opening = { from: number; to: number; sill: number; top: number; kind: "window" | "bay" | "door" | "front" | "opening"; split?: number };
type WallDef = { axis: "x" | "z"; at: number; from: number; to: number; t: number; ext?: boolean; ops?: Opening[] };

const WALLS: WallDef[] = [
  // extérieurs
  {
    axis: "x", at: -4.5, from: -7.65, to: 7.65, t: ET, ext: true,
    ops: [
      { from: -6.5, to: -2.5, sill: 0, top: 2.4, kind: "bay", split: 3 },
      { from: 0.7, to: 2.5, sill: 1.1, top: 2.2, kind: "window", split: 2 },
      { from: 4.9, to: 6.6, sill: 0, top: 2.3, kind: "bay", split: 2 },
    ],
  },
  {
    axis: "x", at: 4.5, from: -7.65, to: 7.65, t: ET, ext: true,
    ops: [
      { from: -6.4, to: -4.8, sill: 0.9, top: 2.25, kind: "window", split: 2 },
      { from: -2.7, to: -1.9, sill: 1.5, top: 2.1, kind: "window" },
      { from: -0.55, to: 0.55, sill: 0, top: 2.25, kind: "front" },
      { from: 0.7, to: 1.1, sill: 0, top: 2.25, kind: "window" },
      { from: 2.3, to: 3.1, sill: 1.2, top: 2.0, kind: "window" },
      { from: 5.0, to: 6.5, sill: 0.9, top: 2.25, kind: "window", split: 2 },
    ],
  },
  {
    axis: "z", at: -7.5, from: -4.5, to: 4.5, t: ET, ext: true,
    ops: [
      { from: -3.6, to: -0.6, sill: 0.5, top: 2.3, kind: "window", split: 3 },
      { from: 2.3, to: 3.6, sill: 0.9, top: 2.25, kind: "window", split: 2 },
    ],
  },
  { axis: "z", at: 7.5, from: -4.5, to: 4.5, t: ET, ext: true, ops: [{ from: 2.4, to: 3.6, sill: 0.9, top: 2.25, kind: "window", split: 2 }] },
  // cloisons
  {
    axis: "x", at: 1.5, from: -7.5, to: 7.5, t: IT,
    ops: [
      { from: -7.2, to: -6.4, sill: 0, top: 2.1, kind: "door" },
      { from: -0.8, to: 1.2, sill: 0, top: 2.3, kind: "opening" },
      { from: 2.4, to: 3.2, sill: 0, top: 2.1, kind: "door" },
      { from: 5.3, to: 6.1, sill: 0, top: 2.1, kind: "door" },
    ],
  },
  { axis: "z", at: -3.5, from: 1.5, to: 4.5, t: IT },
  { axis: "z", at: -1, from: 1.5, to: 4.5, t: IT, ops: [{ from: 3.6, to: 4.4, sill: 0, top: 2.1, kind: "door" }] },
  { axis: "z", at: 1.5, from: 1.5, to: 4.5, t: IT },
  { axis: "z", at: 4, from: -4.5, to: 4.5, t: IT, ops: [{ from: 0.4, to: 1.2, sill: 0, top: 2.1, kind: "door" }] },
];

function wallBoxes(w: WallDef) {
  const ops = [...(w.ops ?? [])].sort((a, b) => a.from - b.from);
  const parts: { a: number; b: number; y0: number; y1: number }[] = [];
  let cur = w.from;
  for (const o of ops) {
    if (o.from > cur) parts.push({ a: cur, b: o.from, y0: 0, y1: H });
    if (o.sill > 0) parts.push({ a: o.from, b: o.to, y0: 0, y1: o.sill });
    if (o.top < H) parts.push({ a: o.from, b: o.to, y0: o.top, y1: H });
    cur = o.to;
  }
  if (cur < w.to) parts.push({ a: cur, b: w.to, y0: 0, y1: H });
  return parts.map(({ a, b, y0, y1 }) => {
    const mid = (a + b) / 2;
    const len = b - a;
    const y = (y0 + y1) / 2;
    const h = y1 - y0;
    return w.axis === "x"
      ? { p: [mid, y, w.at] as V3, s: [len, h, w.t] as V3 }
      : { p: [w.at, y, mid] as V3, s: [w.t, h, len] as V3 };
  });
}

/** Menuiserie : cadre anthracite, montants, vitrage et appui extérieur. */
function WindowUnit({ w, o, m }: { w: WallDef; o: Opening; m: Mats }) {
  const len = o.to - o.from;
  const h = o.top - o.sill;
  const mid = (o.from + o.to) / 2;
  const yMid = o.sill + h / 2;
  const f = 0.06;
  const d = 0.08;
  const along = (pos: number, y: number, sAlong: number, sY: number, depth = d): { p: V3; s: V3 } =>
    w.axis === "x" ? { p: [pos, y, w.at], s: [sAlong, sY, depth] } : { p: [w.at, y, pos], s: [depth, sY, sAlong] };
  const pieces = [
    along(mid, o.top - f / 2, len, f),
    along(mid, o.sill + f / 2, len, f),
    along(o.from + f / 2, yMid, f, h),
    along(o.to - f / 2, yMid, f, h),
  ];
  const n = o.split ?? 1;
  for (let i = 1; i < n; i++) pieces.push(along(o.from + (len * i) / n, yMid, f * 0.8, h));
  const glass = along(mid, yMid, len - f, h - f, 0.02);
  const outward = w.at > 0 ? 1 : -1;
  const sill =
    o.sill > 0 && w.ext
      ? w.axis === "x"
        ? { p: [mid, o.sill - 0.03, w.at + outward * (ET / 2 + 0.03)] as V3, s: [len + 0.12, 0.05, 0.16] as V3 }
        : { p: [w.at + outward * (ET / 2 + 0.03), o.sill - 0.03, mid] as V3, s: [0.16, 0.05, len + 0.12] as V3 }
      : null;
  return (
    <group>
      {pieces.map((pc, i) => (
        <B key={i} p={pc.p} s={pc.s} m={m.frame} receive={false} />
      ))}
      <mesh position={glass.p} material={m.glass}>
        <boxGeometry args={glass.s} />
      </mesh>
      {sill && <B p={sill.p} s={sill.s} m={m.stone} />}
    </group>
  );
}

/** Porte d'entrée en chêne avec poignée laiton et auvent. */
function FrontDoor({ m }: { m: Mats }) {
  return (
    <group position={[0, 0, 4.5]}>
      <B p={[0, 1.125, 0]} s={[1.1, 2.25, 0.08]} m={m.oakSolid} />
      {[-0.3, -0.1, 0.1, 0.3].map((x) => (
        <B key={x} p={[x, 1.125, 0.045]} s={[0.012, 1.9, 0.01]} m={m.walnut} cast={false} />
      ))}
      <B p={[0.42, 1.05, 0.08]} s={[0.03, 0.7, 0.03]} m={m.brass} />
      <B p={[0.2, 2.55, 0.55]} s={[2.0, 0.08, 1.0]} m={m.frame} />
    </group>
  );
}

/** Porte intérieure entrouverte. */
function InteriorDoor({ w, o, m }: { w: WallDef; o: Opening; m: Mats }) {
  const len = o.to - o.from;
  const angle = 1.15;
  if (w.axis === "x") {
    return (
      <group position={[o.from, 0, w.at]} rotation={[0, -angle, 0]}>
        <B p={[len / 2, 1.04, 0]} s={[len - 0.04, 2.06, 0.04]} m={m.white} />
        <B p={[len - 0.1, 1.0, 0.04]} s={[0.1, 0.02, 0.02]} m={m.black} />
      </group>
    );
  }
  return (
    <group position={[w.at, 0, o.from]} rotation={[0, angle, 0]}>
      <B p={[0, 1.04, len / 2]} s={[0.04, 2.06, len - 0.04]} m={m.white} />
    </group>
  );
}

function Walls({ m, group }: { m: Mats; group: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={group}>
      {WALLS.map((w, wi) => (
        <group key={wi}>
          {wallBoxes(w).map((b, i) => (
            <B key={i} p={b.p} s={b.s} m={w.ext ? m.render : m.wallIn} />
          ))}
          {(w.ops ?? []).map((o, i) =>
            o.kind === "window" || o.kind === "bay" ? (
              <WindowUnit key={i} w={w} o={o} m={m} />
            ) : o.kind === "door" ? (
              <InteriorDoor key={i} w={w} o={o} m={m} />
            ) : o.kind === "front" ? (
              <FrontDoor key={i} m={m} />
            ) : null,
          )}
        </group>
      ))}
      {/* Mur d'accent bleu acier derrière la télévision */}
      <B p={[-3.5, 1.4, 1.43]} s={[2.6, 2.8, 0.02]} m={m.accent} cast={false} />
      {/* Conduit de cheminée intérieur */}
      <B p={[-5.7, 1.4, 1.2]} s={[0.9, 2.8, 0.5]} m={m.wallIn} />
    </group>
  );
}

/* ========================================================================== */
/*  SOLS, PLAFOND, STRUCTURE                                                    */
/* ========================================================================== */

const ROOMS = [
  { name: "Séjour", area: "39 m²", x: [-7.5, -1], z: [-4.5, 1.5], floor: "oak" },
  { name: "Cuisine & repas", area: "30 m²", x: [-1, 4], z: [-4.5, 1.5], floor: "oak" },
  { name: "Suite parentale", area: "21 m²", x: [4, 7.5], z: [-4.5, 1.5], floor: "oak" },
  { name: "Chambre", area: "12 m²", x: [-7.5, -3.5], z: [1.5, 4.5], floor: "oak" },
  { name: "Salle d'eau", area: "7,5 m²", x: [-3.5, -1], z: [1.5, 4.5], floor: "bath" },
  { name: "Entrée", area: "7,5 m²", x: [-1, 1.5], z: [1.5, 4.5], floor: "tiles" },
  { name: "Cellier", area: "7,5 m²", x: [1.5, 4], z: [1.5, 4.5], floor: "tiles" },
  { name: "Dressing", area: "10,5 m²", x: [4, 7.5], z: [1.5, 4.5], floor: "oak" },
  { name: "Garage", area: "27 m²", x: [7.5, 12], z: [-4.5, 1.5], floor: "concrete" },
] as const;

function Floors({ m }: { m: Mats }) {
  const mat = (f: string, w: number, d: number) => {
    const base = f === "oak" ? m.oak : f === "bath" ? m.bathTiles : f === "tiles" ? m.tiles : m.concrete;
    if (!("map" in base) || !base.map) return base;
    const c = base.clone();
    c.map = base.map.clone();
    c.map.needsUpdate = true;
    c.map.repeat.set(w / (f === "oak" ? 2.2 : 1.2), d / (f === "oak" ? 2.2 : 1.2));
    return c;
  };
  return (
    <group>
      {/* dalle + soubassement en pierre */}
      <B p={[2.25, GROUND / 2, 0]} s={[19.8, -GROUND, 9.4]} m={m.stone} />
      {ROOMS.map((r) => {
        const w = r.x[1] - r.x[0];
        const d = r.z[1] - r.z[0];
        return (
          <mesh key={r.name} position={[(r.x[0] + r.x[1]) / 2, 0.006, (r.z[0] + r.z[1]) / 2]} material={mat(r.floor, w, d)} receiveShadow>
            <boxGeometry args={[w, 0.012, d]} />
          </mesh>
        );
      })}
    </group>
  );
}

function Ceiling({ m, group }: { m: Mats; group: React.RefObject<THREE.Group | null> }) {
  const spots: V3[] = [];
  for (const x of [-6, -4, -2, 0.5, 2.5]) for (const z of [-3, -0.5]) spots.push([x, H - 0.012, z]);
  return (
    <group ref={group} visible={false}>
      <mesh position={[0, H + 0.02, 0]} material={m.ceiling}>
        <boxGeometry args={[15, 0.04, 9]} />
      </mesh>
      {spots.map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]} material={m.lamp}>
          <circleGeometry args={[0.05, 20]} />
        </mesh>
      ))}
    </group>
  );
}

function Foundations({ m }: { m: Mats }) {
  const strips: { p: V3; s: V3 }[] = [
    { p: [0, -0.65, -4.5], s: [15.6, 0.9, 0.6] },
    { p: [0, -0.65, 4.5], s: [15.6, 0.9, 0.6] },
    { p: [-7.5, -0.65, 0], s: [0.6, 0.9, 9.6] },
    { p: [7.5, -0.65, 0], s: [0.6, 0.9, 9.6] },
    { p: [12, -0.65, -1.5], s: [0.6, 0.9, 6.6] },
    { p: [9.75, -0.65, -4.5], s: [4.5, 0.9, 0.6] },
    { p: [9.75, -0.65, 1.5], s: [4.5, 0.9, 0.6] },
  ];
  return (
    <group>
      {strips.map((s, i) => (
        <B key={i} p={s.p} s={s.s} m={m.concrete} />
      ))}
    </group>
  );
}

/* ========================================================================== */
/*  TOITURE, CHARPENTE, GARAGE                                                  */
/* ========================================================================== */

function Roof({ m, group }: { m: Mats; group: React.RefObject<THREE.Group | null> }) {
  const slope = EAVE / Math.cos(PITCH);
  const gable = useMemo(() => {
    const s = new THREE.Shape();
    const half = 4.5 + ET / 2;
    const top = RISE * (half / EAVE);
    s.moveTo(-half, 0);
    s.lineTo(half, 0);
    s.lineTo(0, top);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: ET, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    return g;
  }, []);
  return (
    <group ref={group}>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            position={[0, H + RISE / 2 + 0.08, (side * EAVE) / 2]}
            rotation={[side * PITCH, 0, 0]}
            material={m.slate}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[16, 0.12, slope + 0.1]} />
          </mesh>
          {/* gouttière + rive */}
          <mesh position={[0, H + 0.02, side * (EAVE + 0.06)]} rotation={[0, 0, Math.PI / 2]} material={m.zinc}>
            <cylinderGeometry args={[0.08, 0.08, 16, 12, 1, true, 0, Math.PI]} />
          </mesh>
          {[-7.9, 7.9].map((x) => (
            <mesh key={x} position={[x, (H + GROUND) / 2, side * (EAVE + 0.06)]} material={m.zinc} castShadow>
              <cylinderGeometry args={[0.05, 0.05, H - GROUND, 10]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* faîtage */}
      <B p={[0, H + RISE + 0.12, 0]} s={[16.1, 0.12, 0.3]} m={m.zinc} />
      {/* pignons */}
      {[-7.5 - ET / 2, 7.5 - ET / 2].map((x) => (
        <mesh key={x} geometry={gable} position={[x, H, 0]} material={m.render} castShadow receiveShadow />
      ))}
      {/* cheminée */}
      <B p={[-5.7, H + RISE * 0.75, 1.2]} s={[0.8, RISE * 1.5, 0.8]} m={m.render} />
      <B p={[-5.7, H + RISE * 1.5 + 0.05, 1.2]} s={[0.95, 0.1, 0.95]} m={m.zinc} />
    </group>
  );
}

function Trusses({ m, group }: { m: Mats; group: React.RefObject<THREE.Group | null> }) {
  const slope = EAVE / Math.cos(PITCH);
  const xs = Array.from({ length: 13 }, (_, i) => -7.2 + i * 1.2);
  return (
    <group ref={group} visible={false}>
      {xs.map((x) => (
        <group key={x} position={[x, H, 0]}>
          <B p={[0, 0.07, 0]} s={[0.08, 0.14, 9.6]} m={m.wood} />
          {[-1, 1].map((side) => (
            <B key={side} p={[0, RISE / 2, (side * EAVE) / 2]} r={[side * PITCH, 0, 0]} s={[0.08, 0.16, slope]} m={m.wood} />
          ))}
          <B p={[0, RISE / 2, 0]} s={[0.08, RISE, 0.1]} m={m.wood} />
          {[-1, 1].map((side) => (
            <B key={`d${side}`} p={[0, RISE * 0.3, side * 1.3]} r={[-side * 0.95, 0, 0]} s={[0.06, 0.1, 2.4]} m={m.wood} />
          ))}
        </group>
      ))}
      <B p={[0, H + RISE - 0.05, 0]} s={[14.8, 0.18, 0.12]} m={m.wood} />
    </group>
  );
}

function Garage({ m, roofRef }: { m: Mats; roofRef: React.RefObject<THREE.Group | null> }) {
  const h = 2.7;
  return (
    <group>
      {/* murs bardés de bois */}
      <B p={[9.75, h / 2, -4.5]} s={[4.8, h, 0.25]} m={m.cladding} />
      <B p={[12, h / 2, -1.5]} s={[0.25, h, 6.25]} m={m.cladding} />
      <B p={[7.925, h / 2, 1.5]} s={[0.85, h, 0.25]} m={m.cladding} />
      <B p={[11.735, h / 2, 1.5]} s={[0.77, h, 0.25]} m={m.cladding} />
      <B p={[9.85, 2.45, 1.5]} s={[3.0, 0.5, 0.25]} m={m.cladding} />
      {/* porte sectionnelle */}
      <B p={[9.85, 1.1, 1.52]} s={[3.0, 2.2, 0.05]} m={m.garageDoor} />
      {[0.4, 0.9, 1.4, 1.9].map((y) => (
        <B key={y} p={[9.85, y, 1.56]} s={[3.0, 0.02, 0.02]} m={m.frame} cast={false} />
      ))}
      {/* établi */}
      <B p={[11.55, 0.45, -2.5]} s={[0.6, 0.9, 2.2]} m={m.wood} />
      <group ref={roofRef}>
        <B p={[9.85, h + 0.12, -1.5]} s={[4.9, 0.24, 6.4]} m={m.frame} />
      </group>
    </group>
  );
}

/* ========================================================================== */
/*  MOBILIER                                                                    */
/* ========================================================================== */

function Plant({ p, s = 1, m }: { p: V3; s?: number; m: Mats }) {
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 0.22, 0]} material={m.pot} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.44, 24]} />
      </mesh>
      {[
        [0, 0.75, 0, 0.32],
        [0.12, 1.0, 0.05, 0.24],
        [-0.1, 0.95, -0.06, 0.26],
        [0.02, 1.2, 0, 0.2],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} material={i % 2 ? m.leafDark : m.leaf} castShadow>
          <icosahedronGeometry args={[r, 1]} />
        </mesh>
      ))}
    </group>
  );
}

function Living({ m }: { m: Mats }) {
  return (
    <group>
      {/* tapis */}
      <B p={[-3.7, 0.018, -0.3]} s={[3.6, 0.012, 2.6]} m={m.rug} cast={false} />
      {/* canapé d'angle */}
      <group position={[-3.9, 0, -1.55]}>
        <RoundedBox args={[3.0, 0.42, 0.95]} radius={0.06} position={[0, 0.23, 0]} material={m.linen} castShadow receiveShadow />
        <RoundedBox args={[3.0, 0.48, 0.22]} radius={0.08} position={[0, 0.62, -0.38]} material={m.linen} castShadow />
        <RoundedBox args={[0.95, 0.42, 1.0]} radius={0.06} position={[1.98, 0.23, 0.47]} material={m.linen} castShadow />
        {[-1.1, -0.35, 0.4].map((x) => (
          <RoundedBox key={x} args={[0.7, 0.14, 0.7]} radius={0.06} position={[x, 0.5, 0.06]} material={m.linen} castShadow />
        ))}
        <RoundedBox args={[0.45, 0.4, 0.14]} radius={0.06} position={[-1.15, 0.72, -0.18]} rotation={[-0.2, 0.15, 0]} material={m.cushionBlue} castShadow />
        <RoundedBox args={[0.42, 0.38, 0.14]} radius={0.06} position={[0.5, 0.72, -0.18]} rotation={[-0.2, -0.1, 0]} material={m.cushionSand} castShadow />
        <RoundedBox args={[0.42, 0.38, 0.14]} radius={0.06} position={[1.85, 0.72, -0.18]} rotation={[-0.2, 0.2, 0]} material={m.cushionBlue} castShadow />
      </group>
      {/* table basse ronde en marbre */}
      <group position={[-3.6, 0, -0.1]}>
        <mesh position={[0, 0.38, 0]} material={m.marble} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.04, 40]} />
        </mesh>
        <mesh position={[0, 0.18, 0]} material={m.black} castShadow>
          <cylinderGeometry args={[0.18, 0.24, 0.36, 24]} />
        </mesh>
        <B p={[0.15, 0.43, 0.05]} s={[0.24, 0.05, 0.18]} m={m.book[0]} />
        <B p={[0.12, 0.47, 0.06]} s={[0.2, 0.03, 0.15]} m={m.book[3]} />
      </group>
      {/* fauteuil */}
      <group position={[-6.4, 0, -2.6]} rotation={[0, 0.7, 0]}>
        <RoundedBox args={[0.8, 0.4, 0.8]} radius={0.08} position={[0, 0.25, 0]} material={m.cushionSand} castShadow />
        <RoundedBox args={[0.8, 0.5, 0.18]} radius={0.08} position={[0, 0.6, -0.32]} material={m.cushionSand} castShadow />
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.32, 0.03, s * 0.3]} material={m.walnut}>
            <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
          </mesh>
        ))}
      </group>
      {/* meuble TV + écran */}
      <B p={[-3.5, 0.25, 1.22]} s={[2.4, 0.42, 0.42]} m={m.walnut} />
      <B p={[-3.5, 1.35, 1.4]} s={[1.45, 0.82, 0.04]} m={m.screen} />
      <Plant p={[-2.0, 0, 1.15]} s={0.9} m={m} />
      {/* poêle à bois devant le conduit */}
      <group position={[-5.7, 0, 0.75]}>
        <B p={[0, 0.03, 0]} s={[0.9, 0.06, 0.8]} m={m.stone} />
        <B p={[0, 0.5, 0]} s={[0.55, 0.85, 0.45]} m={m.black} />
        <mesh position={[0, 0.45, -0.23]} rotation={[0, Math.PI, 0]} material={m.lamp}>
          <planeGeometry args={[0.32, 0.3]} />
        </mesh>
        <mesh position={[0, 1.75, 0.1]} material={m.black}>
          <cylinderGeometry args={[0.08, 0.08, 1.7, 16]} />
        </mesh>
      </group>
      {/* lampadaire arc */}
      <group position={[-6.6, 0, -0.6]}>
        <mesh position={[0, 0.02, 0]} material={m.marble} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
        </mesh>
        <mesh position={[0.6, 1.25, 0]} rotation={[0, 0, -0.9]} material={m.black} castShadow>
          <torusGeometry args={[1.0, 0.015, 8, 30, Math.PI * 0.8]} />
        </mesh>
        <mesh position={[1.35, 1.65, 0]} material={m.lamp}>
          <sphereGeometry args={[0.18, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      </group>
      {/* bibliothèque basse sous la fenêtre du pignon */}
      <group position={[-7.15, 0, -2.1]}>
        <B p={[0, 0.25, 0]} s={[0.36, 0.5, 2.8]} m={m.white} />
        {Array.from({ length: 16 }, (_, i) => (
          <B key={i} p={[0.05, 0.62, -1.25 + i * 0.16]} s={[0.22, 0.22 + (i % 3) * 0.04, 0.05]} m={m.book[i % 5]} cast={false} />
        ))}
      </group>
      {/* tableaux */}
      <B p={[-7.33, 1.6, 1.0]} s={[0.03, 0.9, 0.7]} m={m.art1} cast={false} />
      <Plant p={[-6.9, 0, -4.05]} s={1.3} m={m} />
    </group>
  );
}

function Kitchen({ m }: { m: Mats }) {
  const fronts = [];
  for (let x = 0.0; x < 3.2; x += 0.55) fronts.push(x);
  return (
    <group>
      {/* linéaire bas le long du mur arrière */}
      <B p={[1.65, 0.44, -4.04]} s={[3.3, 0.88, 0.62]} m={m.cabinet} />
      {fronts.map((x) => (
        <B key={x} p={[x + 0.28, 0.7, -3.72]} s={[0.25, 0.015, 0.02]} m={m.brass} cast={false} />
      ))}
      <B p={[1.65, 0.9, -4.02]} s={[3.34, 0.04, 0.66]} m={m.marble} />
      {/* évier + robinet */}
      <B p={[1.6, 0.905, -3.98]} s={[0.7, 0.03, 0.42]} m={m.steel} cast={false} />
      <mesh position={[1.6, 1.12, -4.22]} material={m.black} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.42, 10]} />
      </mesh>
      <mesh position={[1.6, 1.32, -4.12]} rotation={[Math.PI / 2, 0, 0]} material={m.black}>
        <torusGeometry args={[0.1, 0.015, 8, 16, Math.PI]} />
      </mesh>
      {/* colonne four + réfrigérateur */}
      <B p={[3.65, 1.1, -3.4]} s={[0.62, 2.2, 1.9]} m={m.cabinet} />
      <B p={[3.33, 1.15, -3.85]} s={[0.02, 0.55, 0.55]} m={m.screen} cast={false} />
      {[-2.95, -2.6].map((z) => (
        <B key={z} p={[3.32, 1.4, z]} s={[0.02, 0.6, 0.02]} m={m.brass} cast={false} />
      ))}
      {/* étagère murale + bocaux */}
      <B p={[2.95, 1.65, -4.25]} s={[0.7, 0.04, 0.26]} m={m.oakSolid} />
      {[2.7, 2.85, 3.0, 3.15].map((x, i) => (
        <mesh key={x} position={[x, 1.75, -4.25]} material={i % 2 ? m.ceramic : m.pot} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.16 + (i % 2) * 0.06, 16]} />
        </mesh>
      ))}
      {/* îlot central à plateau marbre retombant */}
      <group position={[2.2, 0, -1.6]}>
        <B p={[0, 0.45, 0]} s={[2.3, 0.9, 0.95]} m={m.white} />
        <B p={[0, 0.92, 0]} s={[2.4, 0.04, 1.0]} m={m.marble} />
        <B p={[-1.18, 0.46, 0]} s={[0.04, 0.92, 1.0]} m={m.marble} />
        <B p={[1.18, 0.46, 0]} s={[0.04, 0.92, 1.0]} m={m.marble} />
        <B p={[-0.4, 0.942, -0.15]} s={[0.6, 0.006, 0.5]} m={m.screen} cast={false} />
        {[-0.7, 0, 0.7].map((x) => (
          <group key={x} position={[x, 0, 0.75]}>
            <mesh position={[0, 0.66, 0]} material={m.walnut} castShadow>
              <cylinderGeometry args={[0.19, 0.17, 0.05, 24]} />
            </mesh>
            <mesh position={[0, 0.33, 0]} material={m.black} castShadow>
              <cylinderGeometry args={[0.02, 0.025, 0.66, 8]} />
            </mesh>
            <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.black}>
              <torusGeometry args={[0.14, 0.01, 6, 20]} />
            </mesh>
          </group>
        ))}
        {/* suspensions */}
        {[-0.7, 0, 0.7].map((x) => (
          <group key={`l${x}`} position={[x, 0, 0]}>
            <mesh position={[0, 2.35, 0]} material={m.black}>
              <cylinderGeometry args={[0.004, 0.004, 0.9, 4]} />
            </mesh>
            <mesh position={[0, 1.85, 0]} material={m.brass} castShadow>
              <coneGeometry args={[0.16, 0.2, 24, 1, true]} />
            </mesh>
            <mesh position={[0, 1.78, 0]} material={m.lamp}>
              <sphereGeometry args={[0.05, 12, 8]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* table à manger + chaises */}
      <group position={[-0.05, 0, -2.2]}>
        <B p={[0, 0.74, 0]} s={[0.95, 0.05, 2.1]} m={m.oakSolid} />
        {[-0.85, 0.85].map((z) => (
          <B key={z} p={[0, 0.36, z]} s={[0.8, 0.72, 0.06]} m={m.oakSolid} />
        ))}
        {[-0.6, 0, 0.6].flatMap((z) =>
          [-1, 1].map((s) => (
            <group key={`${z}${s}`} position={[s * 0.68, 0, z]} rotation={[0, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
              <RoundedBox args={[0.46, 0.06, 0.46]} radius={0.02} position={[0, 0.46, 0]} material={m.cushionSand} castShadow />
              <RoundedBox args={[0.46, 0.42, 0.05]} radius={0.02} position={[0, 0.7, -0.21]} material={m.cushionSand} castShadow />
              {[-0.18, 0.18].flatMap((x) =>
                [-0.18, 0.18].map((zz) => (
                  <mesh key={`${x}${zz}`} position={[x, 0.22, zz]} material={m.walnut}>
                    <cylinderGeometry args={[0.018, 0.015, 0.44, 8]} />
                  </mesh>
                )),
              )}
            </group>
          )),
        )}
        <mesh position={[0, 1.95, 0]} material={m.brass} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.05, 40, 1, true]} />
        </mesh>
        <mesh position={[0, 1.94, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.lamp}>
          <circleGeometry args={[0.48, 32]} />
        </mesh>
        <mesh position={[0, 0.82, 0.3]} material={m.ceramic} castShadow>
          <cylinderGeometry args={[0.07, 0.05, 0.16, 16]} />
        </mesh>
      </group>
      <Plant p={[3.6, 0, 0.9]} s={1.1} m={m} />
    </group>
  );
}

function Bedrooms({ m }: { m: Mats }) {
  const bed = (p: V3, rot: number, w: number) => (
    <group position={p} rotation={[0, rot, 0]}>
      <RoundedBox args={[w, 0.3, 2.0]} radius={0.04} position={[0, 0.2, 0]} material={m.oakSolid} castShadow />
      <RoundedBox args={[w - 0.05, 0.22, 1.95]} radius={0.08} position={[0, 0.43, 0.02]} material={m.bedding} castShadow />
      <RoundedBox args={[w, 0.06, 0.7]} radius={0.03} position={[0, 0.56, 0.55]} material={m.throw} castShadow />
      {[-w / 4, w / 4].map((x) => (
        <RoundedBox key={x} args={[w / 2 - 0.15, 0.14, 0.4]} radius={0.06} position={[x, 0.6, -0.72]} material={m.bedding} castShadow />
      ))}
      <B p={[0, 0.65, -1.02]} s={[w + 0.2, 1.1, 0.06]} m={m.linen} />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 + 0.38), 0, -0.75]}>
          <B p={[0, 0.25, 0]} s={[0.45, 0.5, 0.4]} m={m.walnut} />
          <mesh position={[0, 0.68, 0]} material={m.lamp}>
            <cylinderGeometry args={[0.1, 0.13, 0.22, 20]} />
          </mesh>
        </group>
      ))}
    </group>
  );
  return (
    <group>
      {bed([6.3, 0, -1.6], -Math.PI / 2, 1.8)}
      <Plant p={[4.5, 0, -4.0]} s={1.2} m={m} />
      {bed([-4.62, 0, 3.0], -Math.PI / 2, 1.4)}
      {/* bureau sous la fenêtre de la chambre */}
      <B p={[-5.8, 0.74, 4.2]} s={[1.2, 0.04, 0.5]} m={m.oakSolid} />
      <B p={[-5.8, 0.37, 4.42]} s={[1.1, 0.72, 0.03]} m={m.black} />
      {/* dressing */}
      <B p={[4.4, 1.15, 3.0]} s={[0.6, 2.3, 2.6]} m={m.white} />
      {[2.0, 2.65, 3.3, 3.95].map((z) => (
        <B key={z} p={[4.71, 1.15, z]} s={[0.02, 0.5, 0.02]} m={m.brass} cast={false} />
      ))}
    </group>
  );
}

function Bathroom({ m }: { m: Mats }) {
  return (
    <group>
      {/* douche à l'italienne */}
      <B p={[-2.9, 0.02, 3.9]} s={[1.1, 0.03, 1.1]} m={m.ceramic} cast={false} />
      <mesh position={[-2.35, 1.05, 3.9]} material={m.glass}>
        <boxGeometry args={[0.02, 2.0, 1.1]} />
      </mesh>
      <mesh position={[-3.4, 1.95, 3.9]} rotation={[0, 0, Math.PI / 2]} material={m.black}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 24]} />
      </mesh>
      {/* meuble vasque + miroir rond */}
      <B p={[-1.32, 0.7, 2.3]} s={[0.5, 0.35, 1.0]} m={m.oakSolid} />
      <B p={[-1.3, 0.9, 2.3]} s={[0.48, 0.06, 0.95]} m={m.ceramic} />
      <mesh position={[-1.08, 1.6, 2.3]} rotation={[0, -Math.PI / 2, 0]} material={m.steel}>
        <circleGeometry args={[0.35, 40]} />
      </mesh>
      <mesh position={[-1.07, 1.6, 2.3]} rotation={[0, -Math.PI / 2, 0]} material={m.black}>
        <torusGeometry args={[0.35, 0.012, 8, 40]} />
      </mesh>
      {/* WC suspendu */}
      <RoundedBox args={[0.38, 0.35, 0.55]} radius={0.12} position={[-3.2, 0.42, 2.2]} rotation={[0, Math.PI / 2, 0]} material={m.ceramic} castShadow />
      {/* entrée : console + miroir */}
      <B p={[-0.78, 0.8, 2.6]} s={[0.3, 0.05, 1.2]} m={m.oakSolid} />
      <mesh position={[-0.92, 1.6, 2.6]} rotation={[0, Math.PI / 2, 0]} material={m.steel}>
        <circleGeometry args={[0.3, 32]} />
      </mesh>
      {/* cellier : étagères */}
      {[0.4, 0.9, 1.4, 1.9].map((y) => (
        <B key={y} p={[2.75, y, 4.2]} s={[2.3, 0.03, 0.4]} m={m.oakSolid} />
      ))}
    </group>
  );
}

/* ========================================================================== */
/*  JARDIN                                                                      */
/* ========================================================================== */

function Tree({ p, s = 1, m }: { p: V3; s?: number; m: Mats }) {
  const blobs: [number, number, number, number][] = [
    [0, 3.4, 0, 1.4],
    [0.9, 3.0, 0.3, 1.0],
    [-0.8, 3.1, -0.3, 1.05],
    [0.2, 4.2, -0.4, 1.0],
    [-0.3, 2.6, 0.7, 0.9],
  ];
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 1.3, 0]} material={m.trunk} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 2.6, 10]} />
      </mesh>
      {blobs.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} material={i % 2 ? m.leafDark : m.leaf} castShadow receiveShadow>
          <icosahedronGeometry args={[r, 1]} />
        </mesh>
      ))}
    </group>
  );
}

function Garden({ m }: { m: Mats }) {
  const hedges: { p: V3; s: V3 }[] = [
    { p: [0, GROUND + 0.55, -19], s: [30, 1.1, 0.9] },
    { p: [15, GROUND + 0.55, -3], s: [0.9, 1.1, 32] },
    { p: [-8, GROUND + 0.45, 13], s: [13, 0.9, 0.8] },
    { p: [4.5, GROUND + 0.45, 13], s: [5, 0.9, 0.8] },
  ];
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, GROUND - 0.005, 0]} material={m.grass} receiveShadow>
        <planeGeometry args={[120, 120]} />
      </mesh>
      {/* terrasse bois */}
      <B p={[-2.5, GROUND + 0.07, -6.7]} s={[10.5, 0.14, 4.1]} m={m.deck} />
      {/* table extérieure + parasol */}
      <group position={[-0.3, GROUND + 0.14, -6.8]}>
        <B p={[0, 0.72, 0]} s={[1.8, 0.04, 0.9]} m={m.wood} />
        {[-0.8, 0.8].map((x) => (
          <B key={x} p={[x, 0.36, 0]} s={[0.05, 0.72, 0.8]} m={m.wood} />
        ))}
        {[-0.5, 0.5].flatMap((x) =>
          [-1, 1].map((s) => <RoundedBox key={`${x}${s}`} args={[0.45, 0.45, 0.45]} radius={0.05} position={[x, 0.23, s * 0.7]} material={m.cushionSand} castShadow />),
        )}
        <mesh position={[0, 1.2, 0]} material={m.wood}>
          <cylinderGeometry args={[0.025, 0.025, 2.4, 8]} />
        </mesh>
        <mesh position={[0, 2.25, 0]} material={m.canvas} castShadow>
          <coneGeometry args={[1.5, 0.45, 8, 1, true]} />
        </mesh>
      </group>
      {/* bains de soleil */}
      {[-5.2, -3.6].map((x) => (
        <group key={x} position={[x, GROUND + 0.14, -9.8]}>
          <B p={[0, 0.2, 0]} s={[0.7, 0.08, 1.9]} m={m.wood} />
          <B p={[0, 0.35, -0.75]} r={[0.6, 0, 0]} s={[0.7, 0.06, 0.6]} m={m.wood} />
          <B p={[0, 0.27, 0.15]} s={[0.62, 0.06, 1.3]} m={m.cushionSand} />
        </group>
      ))}
      {/* piscine 7 × 3,5 m */}
      <group position={[-3, GROUND, -13]}>
        <B p={[0, 0.02, 0]} s={[7.8, 0.06, 4.3]} m={m.stone} />
        <B p={[0, 0.035, 0]} s={[7.0, 0.04, 3.5]} m={m.poolTile} cast={false} />
        <mesh position={[0, 0.06, 0]} rotation-x={-Math.PI / 2} material={m.water}>
          <planeGeometry args={[7.0, 3.5]} />
        </mesh>
      </group>
      {/* allée en dalles + accès gravier au garage */}
      <B p={[0, GROUND + 0.01, 8.8]} s={[1.6, 0.03, 8.6]} m={m.paving} cast={false} />
      <B p={[9.85, GROUND + 0.01, 7.3]} s={[4.4, 0.03, 11.6]} m={m.gravel} cast={false} />
      {/* haies */}
      {hedges.map((h, i) => (
        <RoundedBox key={i} args={h.s} radius={0.3} position={h.p} material={m.hedge} castShadow receiveShadow />
      ))}
      {/* arbres */}
      <Tree p={[-11, GROUND, -15]} s={1.2} m={m} />
      <Tree p={[10, GROUND, -14]} s={1.0} m={m} />
      <Tree p={[-11.5, GROUND, 9]} s={0.9} m={m} />
      <Tree p={[6, GROUND, -16]} s={0.8} m={m} />
      <Tree p={[-12, GROUND, -5]} s={0.75} m={m} />
      <Plant p={[1.2, GROUND, 5.0]} s={1.2} m={m} />
      <Plant p={[-1.2, GROUND, 5.0]} s={1.2} m={m} />
    </group>
  );
}

/* ========================================================================== */
/*  ÉTIQUETTES                                                                  */
/* ========================================================================== */

function Label({ position, window: [a, b], shared, children }: { position: V3; window: [number, number]; shared: React.RefObject<Shared>; children: React.ReactNode }) {
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

function Chip({ title, value, swatch }: { title: string; value?: string; swatch?: string }) {
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

function Dimension({ from, to, label, shared, win }: { from: V3; to: V3; label: string; shared: React.RefObject<Shared>; win: [number, number] }) {
  type LineRef = { material: { opacity: number } } | null;
  const r0 = useRef<LineRef>(null);
  const r1 = useRef<LineRef>(null);
  const r2 = useRef<LineRef>(null);
  const horiz = from[2] === to[2];
  const tick = (p: V3): V3[] =>
    horiz ? [[p[0], p[1], p[2] - 0.3], [p[0], p[1], p[2] + 0.3]] : [[p[0] - 0.3, p[1], p[2]], [p[0] + 0.3, p[1], p[2]]];
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

// Fenêtres de défilement (partagées avec le texte de Tour.tsx)
export const TOUR_WINDOWS = {
  facades: [0.05, 0.15] as [number, number],
  plan: [0.18, 0.34] as [number, number],
  sejour: [0.4, 0.53] as [number, number],
  cuisine: [0.57, 0.69] as [number, number],
  structure: [0.79, 0.94] as [number, number],
};

function Labels({ shared }: { shared: React.RefObject<Shared> }) {
  const W = TOUR_WINDOWS;
  return (
    <group>
      {/* façades */}
      <Label position={[-7.7, 1.6, -2.1]} window={W.facades} shared={shared}>
        <Chip title="Menuiseries aluminium" value="anthracite" swatch="#2b3036" />
      </Label>
      <Label position={[-7.7, 4.4, 2.5]} window={[W.facades[0] + 0.01, W.facades[1]]} shared={shared}>
        <Chip title="Couverture ardoise" value="pente 35°" swatch="#59626b" />
      </Label>
      <Label position={[-4.5, 0.6, -7.2]} window={[W.facades[0] + 0.03, W.facades[1]]} shared={shared}>
        <Chip title="Terrasse bois" value="10,5 × 4 m" swatch="#9c7a58" />
      </Label>
      <Label position={[-3, 0.4, -13]} window={[W.facades[0] + 0.04, W.facades[1]]} shared={shared}>
        <Chip title="Piscine" value="7,00 × 3,50 m" swatch="#4d9cc0" />
      </Label>
      {/* plan */}
      {ROOMS.map((r) => (
        <Label key={r.name} position={[(r.x[0] + r.x[1]) / 2, 0.6, (r.z[0] + r.z[1]) / 2]} window={W.plan} shared={shared}>
          <div className="whitespace-nowrap rounded-2xl border border-ink/10 bg-paper/88 px-3 py-1.5 text-center shadow-[0_10px_24px_-14px_rgba(15,18,21,0.5)] backdrop-blur-md">
            <p className="font-serif text-[13px] leading-none text-ink italic sm:text-[16px]">{r.name}</p>
            <p className="mt-1 font-mono text-[9px] tracking-[0.12em] text-steel sm:text-[10px]">{r.area}</p>
          </div>
        </Label>
      ))}
      <Dimension from={[-7.5, 0.4, 5.6]} to={[7.5, 0.4, 5.6]} label="15,00 m" shared={shared} win={W.plan} />
      <Dimension from={[-8.6, 0.4, -4.5]} to={[-8.6, 0.4, 4.5]} label="9,00 m" shared={shared} win={[W.plan[0] + 0.01, W.plan[1]]} />
      <Dimension from={[7.5, 0.4, -5.6]} to={[12, 0.4, -5.6]} label="4,50 m" shared={shared} win={[W.plan[0] + 0.02, W.plan[1]]} />
      <Label position={[2.25, 0.6, -6.4]} window={[W.plan[0] + 0.03, W.plan[1]]} shared={shared}>
        <Chip title="Surface habitable" value="135 m²" />
      </Label>
      {/* séjour */}
      <Label position={[-3.7, 0.08, 0.8]} window={W.sejour} shared={shared}>
        <Chip title="Parquet chêne" value="39 m²" swatch="#c4a27a" />
      </Label>
      <Label position={[-4.5, 2.1, -4.45]} window={[W.sejour[0] + 0.01, W.sejour[1]]} shared={shared}>
        <Chip title="Baie coulissante" value="4,00 × 2,40 m" />
      </Label>
      <Label position={[-5.2, 2.3, 0.75]} window={[W.sejour[0] + 0.02, W.sejour[1]]} shared={shared}>
        <Chip title="Poêle à bois" value="conduit isolé" swatch="#1d2024" />
      </Label>
      <Label position={[-3.0, 2.3, 1.4]} window={[W.sejour[0] + 0.03, W.sejour[1]]} shared={shared}>
        <Chip title="Peinture mate" value="bleu acier" swatch="#5b7186" />
      </Label>
      <Label position={[-2.0, 0.95, -1.2]} window={[W.sejour[0] + 0.04, W.sejour[1]]} shared={shared}>
        <Chip title="Canapé d'angle" value="3,00 × 1,95 m" swatch="#d9d0c2" />
      </Label>
      {/* cuisine */}
      <Label position={[2.2, 1.15, -1.6]} window={W.cuisine} shared={shared}>
        <Chip title="Îlot" value="2,40 × 1,00 m" swatch="#f1eee9" />
      </Label>
      <Label position={[1.2, 1.2, -4.0]} window={[W.cuisine[0] + 0.01, W.cuisine[1]]} shared={shared}>
        <Chip title="Plan en marbre" value="3,30 m" swatch="#e9e4dc" />
      </Label>
      <Label position={[3.0, 0.5, -3.75]} window={[W.cuisine[0] + 0.02, W.cuisine[1]]} shared={shared}>
        <Chip title="Façades laquées" value="bleu acier" swatch="#3e5b74" />
      </Label>
      <Label position={[-0.05, 1.1, -2.2]} window={[W.cuisine[0] + 0.03, W.cuisine[1]]} shared={shared}>
        <Chip title="Table chêne" value="6 couverts" swatch="#b48d63" />
      </Label>
      {/* du sol au toit */}
      <Label position={[-7.8, H + RISE * 0.7, -1]} window={W.structure} shared={shared}>
        <Chip title="Charpente" value="fermettes · faîtage" swatch="#b58d5f" />
      </Label>
      <Label position={[-7.9, 1.5, 1.5]} window={[W.structure[0] + 0.01, W.structure[1]]} shared={shared}>
        <Chip title="Murs" value="fissures · humidité" />
      </Label>
      <Label position={[-7.9, -0.1, -2.5]} window={[W.structure[0] + 0.02, W.structure[1]]} shared={shared}>
        <Chip title="Dalle sur terre-plein" swatch="#cfc6b6" />
      </Label>
      <Label position={[-7.9, -0.75, 2.5]} window={[W.structure[0] + 0.03, W.structure[1]]} shared={shared}>
        <Chip title="Fondations" value="semelles filantes" swatch="#b8b2a7" />
      </Label>
    </group>
  );
}

/* ========================================================================== */
/*  CAMÉRA                                                                      */
/* ========================================================================== */

type Key = { p: number; pos: V3; look: V3; fov?: number };
const KEYS: Key[] = [
  { p: 0.0, pos: [24, 15, 29], look: [1.5, 1.0, 0] },
  { p: 0.06, pos: [-24, 6, 12], look: [-1, 1.6, 0] }, // côté et façade
  { p: 0.13, pos: [-15, 5.5, -24], look: [-2, 1, -5] }, // côté jardin
  { p: 0.19, pos: [1.5, 32, 7], look: [1.5, 0, 0.3] }, // vue d'en haut
  { p: 0.32, pos: [1.5, 30, 6.4], look: [1.5, 0, 0.2] },
  { p: 0.37, pos: [-4.5, 1.7, -10.5], look: [-4.5, 1.3, -2] }, // devant la baie
  { p: 0.42, pos: [0.3, 1.62, -0.6], look: [-5.6, 0.9, -2.4], fov: 62 }, // séjour
  { p: 0.52, pos: [0.0, 1.62, -0.2], look: [-5.4, 1.0, -3.4], fov: 62 },
  { p: 0.59, pos: [-2.4, 1.68, 0.7], look: [2.8, 0.95, -3.0], fov: 62 }, // cuisine
  { p: 0.68, pos: [-2.0, 1.68, 0.4], look: [3.3, 1.0, -2.6], fov: 62 },
  { p: 0.74, pos: [3, 12, 10], look: [0, 1, 0] },
  { p: 0.82, pos: [-25, 0.4, 5], look: [0, 1.4, 0] }, // coupe : du sol au toit
  { p: 0.92, pos: [-23, 0.9, 9], look: [0, 1.6, 0] },
  { p: 1.0, pos: [24, 15, 29], look: [1.5, 1.0, 0] },
];

function sampleCamera(p: number, pos: THREE.Vector3, look: THREE.Vector3) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = smooth(clamp01((p - a.p) / (b.p - a.p)));
  pos.set(...a.pos).lerp(new THREE.Vector3(...b.pos), t);
  look.set(...a.look).lerp(new THREE.Vector3(...b.look), t);
  return THREE.MathUtils.lerp(a.fov ?? 34, b.fov ?? 34, t);
}

const INTRO_FROM = new THREE.Vector3(55, 34, 70);

function CameraRig({ shared }: { shared: React.RefObject<Shared> }) {
  const { camera, size, clock } = useThree();
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const curLook = useRef(new THREE.Vector3(1.5, 1.2, 0));
  useFrame((_, delta) => {
    const s = shared.current;
    let fov = sampleCamera(s.p, pos, look);
    const narrow = size.width / size.height < 0.8;
    if (narrow) {
      const outside = 1 - windowed(s.p, 0.35, 0.72, 0.05);
      const plan = windowed(s.p, 0.16, 0.35, 0.04);
      pos.sub(look).multiplyScalar(1 + 0.75 * outside + 0.45 * plan).add(look);
      fov += 6 * (1 - outside);
    }
    // Arrivée cinématographique : la caméra descend depuis le ciel.
    const intro = s.readyAt === null ? 0 : smooth(clamp01((clock.elapsedTime - s.readyAt) / 2.8));
    if (intro < 1) pos.lerpVectors(INTRO_FROM, pos, intro);
    pos.x += s.pointer.x * 0.5;
    pos.y += -s.pointer.y * 0.3;

    const cam = camera as THREE.PerspectiveCamera;
    const end = 1 - smooth(clamp01((s.p - 0.94) / 0.05));
    const heroW = 1 - smooth(clamp01(s.p / 0.06));
    if (narrow) cam.setViewOffset(size.width, size.height, 0, (0.1 + 0.1 * heroW) * end * size.height, size.width, size.height);
    else cam.setViewOffset(size.width, size.height, -(0.14 + 0.1 * heroW) * end * size.width, 0, size.width, size.height);
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    const k = intro < 1 ? 1 : 1 - Math.exp(-delta * 5);
    camera.position.lerp(pos, k);
    curLook.current.lerp(look, k);
    camera.lookAt(curLook.current);
  });
  return null;
}

/* ========================================================================== */
/*  SCÈNE                                                                       */
/* ========================================================================== */

function House({ shared }: { shared: React.RefObject<Shared> }) {
  const m = useMats();
  const roof = useRef<THREE.Group>(null);
  const garageRoof = useRef<THREE.Group>(null);
  const truss = useRef<THREE.Group>(null);
  const walls = useRef<THREE.Group>(null);
  const ceiling = useRef<THREE.Group>(null);
  const grassMat = m.grass;

  useFrame(() => {
    const p = shared.current.p;
    // toit : en place à l'arrivée et à la fin, soulevé pendant la visite
    const lift = Math.min(smooth(clamp01((p - 0.14) / 0.06)), 1 - smooth(clamp01((p - 0.93) / 0.06)));
    if (roof.current) {
      roof.current.position.y = lift * 9;
      roof.current.visible = lift < 0.98;
    }
    if (garageRoof.current) {
      garageRoof.current.position.y = lift * 6;
      garageRoof.current.visible = lift < 0.98;
    }
    const tv = windowed(p, 0.78, 0.95, 0.03);
    if (truss.current) {
      truss.current.visible = tv > 0.01;
      truss.current.position.y = (1 - tv) * 2;
    }
    // murs abaissés en vue en plan
    if (walls.current) walls.current.scale.y = 1 - windowed(p, 0.15, 0.36, 0.05) * 0.6;
    // plafond pendant la visite intérieure
    const cv = windowed(p, 0.38, 0.71, 0.03);
    if (ceiling.current) {
      ceiling.current.visible = cv > 0.01;
      m.ceiling.opacity = cv;
    }
    // pelouse transparente pour la coupe (fondations)
    const gv = windowed(p, 0.78, 0.95, 0.03);
    grassMat.opacity = 1 - gv * 0.85;
  });

  return (
    <group>
      <Garden m={m} />
      <Foundations m={m} />
      <Floors m={m} />
      <Walls m={m} group={walls} />
      <Living m={m} />
      <Kitchen m={m} />
      <Bedrooms m={m} />
      <Bathroom m={m} />
      <Garage m={m} roofRef={garageRoof} />
      <Ceiling m={m} group={ceiling} />
      <Roof m={m} group={roof} />
      <Trusses m={m} group={truss} />
    </group>
  );
}

/** Signale au loader que la scène a rendu ses premières images. */
function SceneReady() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current++;
    if (frames.current === 3) window.dispatchEvent(new Event("scene:ready"));
  });
  return null;
}

function Progress({ tour, shared }: { tour: React.RefObject<TourState>; shared: React.RefObject<Shared> }) {
  const { clock } = useThree();
  useEffect(() => onReady(() => (shared.current.readyAt = clock.elapsedTime)), [clock, shared]);
  useFrame((_, delta) => {
    const target = tour.current.progress;
    const s = shared.current;
    s.p += (target - s.p) * (1 - Math.exp(-delta * 6));
    if (Math.abs(target - s.p) < 0.0004) s.p = target;
  });
  return null;
}

export default function RealHouse({ tour }: { tour: React.RefObject<TourState> }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const shared = useRef<Shared>({ p: 0, pointer: { x: 0, y: 0 }, readyAt: null });
  const [visible, setVisible] = useState(true);
  // Composant chargé uniquement côté navigateur (dynamic, ssr: false) : window est disponible.
  const [narrow] = useState(() => window.innerWidth < 768);
  // Appareil qui peine : on réduit la résolution et on coupe l'occlusion ambiante.
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      shared.current.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      shared.current.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (wrapper.current) io.observe(wrapper.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0" data-scene>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={degraded ? 1 : [1, narrow ? 1.5 : 1.75]}
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ position: [55, 34, 70], fov: 34, near: 0.05, far: 400 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ clock }) => {
          if (isReady() && shared.current.readyAt === null) shared.current.readyAt = clock.elapsedTime;
        }}
      >
        <PerformanceMonitor onDecline={() => setDegraded(true)} flipflops={1} />
        <Progress tour={tour} shared={shared} />
        <SceneReady />
        <fog attach="fog" args={["#efe9df", 60, 170]} />
        <hemisphereLight args={["#e6eef5", "#b9a98f", 0.55]} />
        <directionalLight
          position={[16, 24, 12]}
          intensity={2.6}
          color="#fff3e2"
          castShadow
          shadow-mapSize={[narrow ? 1024 : 2048, narrow ? 1024 : 2048]}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={22}
          shadow-camera-bottom={-22}
          shadow-camera-far={80}
          shadow-bias={-0.0004}
          shadow-normalBias={0.03}
        />
        <Environment resolution={128} frames={1}>
          <Lightformer intensity={2.2} position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[30, 30, 1]} color="#ffffff" />
          <Lightformer intensity={1.2} position={[-12, 4, -6]} rotation-y={Math.PI / 2} scale={[20, 6, 1]} color="#ffe8cc" />
          <Lightformer intensity={0.9} position={[12, 4, 6]} rotation-y={-Math.PI / 2} scale={[20, 6, 1]} color="#d6e4f0" />
        </Environment>
        <CameraRig shared={shared} />
        <House shared={shared} />
        <Labels shared={shared} />
        {degraded ? (
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <Vignette offset={0.32} darkness={0.32} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        ) : (
          <EffectComposer multisampling={narrow ? 0 : 4} enableNormalPass={false}>
            <N8AO aoRadius={1.4} intensity={2.4} distanceFalloff={0.9} halfRes={narrow} quality={narrow ? "performance" : "medium"} />
            <Vignette offset={0.32} darkness={0.32} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
