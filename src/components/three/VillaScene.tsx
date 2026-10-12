"use client";
/* eslint-disable react-hooks/immutability -- la boucle de rendu Three.js (useFrame) modifie volontairement
   des objets mutables (caméra, matériaux, état partagé) en dehors du rendu React : fonctionnement normal de R3F. */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Clone, Environment, PerformanceMonitor, RoundedBox, Sky, useGLTF, useTexture } from "@react-three/drei";
import { EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

import { makeNormal, makeTexture } from "@/components/three/textures";
import { Foliage, GrassField, OrnamentalGrasses, type ShrubDef, type TreeDef } from "@/components/three/nature";
import { Chip, Dimension, Label, RoomTag, clamp01, smooth, windowed, type Shared, type V3 } from "@/components/three/labels";
import { isReady, onReady } from "@/lib/ready";

/* ========================================================================== */
/*  Villa contemporaine d'illustration (inspirée d'une maison réelle) :        */
/*  bloc à étage 8 × 9 m sous toiture 4 pans en tuiles + aile de plain-pied    */
/*  12 × 8 m en toit plat, pergola, terrasse, piscine 24 × 5 m, jardin.        */
/*  1 unité = 1 mètre. Les surfaces affichées correspondent au modèle.        */
/* ========================================================================== */

export type TourState = { progress: number };

const GF = 2.9; // hauteur sous plafond du rez-de-chaussée (bloc à étage)
const SLAB = 0.25;
const UF0 = GF + SLAB; // plancher de l'étage
const EAVE_Y = 6.0;
const B_CEIL = 3.1;
const B_TOP = 3.55; // acrotère de l'aile
const ET = 0.3;
const IT = 0.12;
const SUN = new THREE.Vector3(38, 13, -30);

// Fenêtres de défilement (identiques à celles de Tour.tsx)
export const TOUR_WINDOWS = {
  facades: [0.05, 0.15] as [number, number],
  plan: [0.18, 0.34] as [number, number],
  sejour: [0.4, 0.53] as [number, number],
  cuisine: [0.57, 0.69] as [number, number],
  structure: [0.79, 0.94] as [number, number],
};

/* ========================================================================== */
/*  MATÉRIAUX                                                                   */
/* ========================================================================== */

function useMats() {
  const [oakMap, oakRough, oakBump, waterNormal, grassMap] = useTexture([
    "/textures/oak.jpg",
    "/textures/oak_rough.jpg",
    "/textures/oak_bump.jpg",
    "/textures/water_normal.jpg",
    "/textures/grass.jpg",
  ]);
  return useMemo(() => {
    for (const t of [oakMap, oakRough, oakBump, waterNormal, grassMap]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 8;
    }
    oakMap.colorSpace = THREE.SRGBColorSpace;
    grassMap.colorSpace = THREE.SRGBColorSpace;
    grassMap.repeat.set(70, 70);
    const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
    const phys = (o: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(o);
    return {
      beige: std({ color: "#ffffff", map: makeTexture("beige", 4, 2), normalMap: makeNormal("beige", 4, 2, 3), normalScale: new THREE.Vector2(0.35, 0.35), roughness: 0.95 }),
      white: std({ color: "#f6f3ee", roughness: 0.92 }),
      tiles: std({ color: "#ffffff", map: makeTexture("terracotta", 7, 7), normalMap: makeNormal("terracotta", 7, 7, 6), roughness: 0.85 }),
      coping: std({ color: "#cfc9bf", roughness: 0.8 }),
      frame: std({ color: "#2a2e33", roughness: 0.42, metalness: 0.55 }),
      glass: phys({ color: "#b8c7d0", roughness: 0.02, metalness: 0.05, transparent: true, opacity: 0.32, envMapIntensity: 2.4, depthWrite: false }),
      roomDark: std({ color: "#6f655c", roughness: 1, side: THREE.BackSide }),
      oak: std({ color: "#ffffff", map: oakMap, roughnessMap: oakRough, bumpMap: oakBump, bumpScale: 0.6, roughness: 0.75 }),
      stone: std({ color: "#ffffff", map: makeTexture("stoneSlab", 6, 4), normalMap: makeNormal("stoneSlab", 6, 4, 3), roughness: 0.9 }),
      paving: std({ color: "#ffffff", map: makeTexture("stoneSlab", 1, 4), normalMap: makeNormal("stoneSlab", 1, 4, 3), roughness: 0.9 }),
      pebbles: std({ color: "#ffffff", map: makeTexture("pebbles", 10, 2), normalMap: makeNormal("pebbles", 10, 2, 5), roughness: 0.95 }),
      gravelLight: std({ color: "#ffffff", map: makeTexture("gravel", 3, 10), roughness: 1 }),
      lawn: std({ color: "#c9d8b0", map: grassMap, roughness: 1, transparent: true }),
      water: phys({
        color: "#163d47",
        roughness: 0.04,
        metalness: 0.0,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        normalMap: waterNormal,
        normalScale: new THREE.Vector2(0.25, 0.25),
        envMapIntensity: 1.6,
      }),
      liner: std({ color: "#2b3236", roughness: 0.6 }),
      concrete: std({ color: "#a9a399", roughness: 1 }),
      timber: std({ color: "#b58d5f", roughness: 0.75 }),
      chain: std({ color: "#8f969c", roughness: 0.9 }),
      lacquer: std({ color: "#3e5b74", roughness: 0.38 }),
      lacquerWhite: std({ color: "#f1eee8", roughness: 0.3 }),
      marble: std({ color: "#ffffff", map: makeTexture("marble", 1, 1), roughness: 0.15 }),
      walnut: std({ color: "#6e4f37", roughness: 0.5 }),
      oakSolid: std({ color: "#ffffff", map: oakMap, roughness: 0.6 }),
      black: std({ color: "#1b1e21", roughness: 0.35, metalness: 0.6 }),
      brass: std({ color: "#c09a5b", roughness: 0.28, metalness: 0.9 }),
      steel: std({ color: "#d0d4d7", roughness: 0.2, metalness: 0.95 }),
      ceramic: phys({ color: "#ffffff", roughness: 0.12, clearcoat: 0.6 }),
      linen: std({ color: "#ffffff", map: makeTexture("linenWarm", 3, 3), roughness: 1 }),
      fabricBlue: std({ color: "#5b7186", map: makeTexture("linenWarm", 3, 3), roughness: 1 }),
      rug: std({ color: "#e4dccd", map: makeTexture("linenWarm", 8, 8), roughness: 1 }),
      rattan: std({ color: "#2e2a27", roughness: 0.85 }),
      cushionOut: std({ color: "#d8d2c8", map: makeTexture("linenWarm", 2, 2), roughness: 1 }),
      lounger: std({ color: "#f2f0ec", roughness: 0.5 }),
      lamp: std({ color: "#fff4df", emissive: "#ffdca8", emissiveIntensity: 2.2 }),
      spot: std({ color: "#ffffff", emissive: "#fff2dc", emissiveIntensity: 1.4 }),
      screen: std({ color: "#0c0e10", roughness: 0.12, metalness: 0.5 }),
      pot: std({ color: "#c9c0b3", roughness: 0.85 }),
      potDark: std({ color: "#3a3835", roughness: 0.7 }),
      art: std({ color: "#c9b79c", roughness: 1 }),
      book: ["#3e5b74", "#c9b79c", "#8a6a4c", "#e8e1d4", "#1d2024"].map((c) => std({ color: c, roughness: 0.9 })),
    };
  }, [oakMap, oakRough, oakBump, waterNormal, grassMap]);
}
type Mats = ReturnType<typeof useMats>;

function B({ p, s, m, r, cast = true, receive = true }: { p: V3; s: V3; m: THREE.Material | THREE.Material[]; r?: V3; cast?: boolean; receive?: boolean }) {
  return (
    <mesh position={p} rotation={r} material={m} castShadow={cast} receiveShadow={receive}>
      <boxGeometry args={s} />
    </mesh>
  );
}

/* ========================================================================== */
/*  MURS                                                                        */
/* ========================================================================== */

type Opening = { from: number; to: number; sill: number; top: number; kind: "window" | "bay" | "door" | "front" | "opening"; split?: number };
type WallDef = {
  axis: "x" | "z";
  at: number;
  from: number;
  to: number;
  t: number;
  y0: number;
  y1: number;
  out?: 1 | -1; // côté extérieur (enduit beige) ; absent = cloison intérieure
  ops?: Opening[];
};

// Rez-de-chaussée (toujours visible)
const WALLS_GF: WallDef[] = [
  // bloc à étage
  { axis: "x", at: -4.5, from: -9.15, to: -1, t: ET, y0: 0, y1: GF, out: -1, ops: [{ from: -7.6, to: -2.6, sill: 0, top: 2.5, kind: "bay", split: 3 }] },
  {
    axis: "x", at: 4.5, from: -9.15, to: -0.85, t: ET, y0: 0, y1: GF, out: 1,
    ops: [
      { from: -6.2, to: -5.2, sill: 0, top: 2.3, kind: "front" },
      { from: -3.6, to: -2.2, sill: 0.9, top: 2.3, kind: "window", split: 2 },
    ],
  },
  { axis: "z", at: -9, from: -4.5, to: 4.5, t: ET, y0: 0, y1: GF, out: -1, ops: [{ from: -2.6, to: -0.8, sill: 0.9, top: 2.3, kind: "window", split: 2 }] },
  { axis: "z", at: -1, from: 3.5, to: 4.5, t: ET, y0: 0, y1: GF, out: 1 },
  { axis: "z", at: -1, from: -4.5, to: 3.5, t: 0.2, y0: 0, y1: GF, ops: [{ from: -3.6, to: 0.6, sill: 0, top: 2.5, kind: "opening" }] },
  { axis: "x", at: 1, from: -9, to: -1, t: IT, y0: 0, y1: GF, ops: [{ from: -7.4, to: -5.8, sill: 0, top: 2.4, kind: "opening" }, { from: -3.4, to: -2.6, sill: 0, top: 2.1, kind: "door" }] },
  { axis: "z", at: -5, from: 1, to: 4.5, t: IT, y0: 0, y1: GF },
  // aile de plain-pied
  {
    axis: "x", at: -4.5, from: -1, to: 11.15, t: ET, y0: 0, y1: B_TOP, out: -1,
    ops: [
      { from: 0.6, to: 5.6, sill: 0, top: 2.55, kind: "bay", split: 4 },
      { from: 7.0, to: 8.1, sill: 0.9, top: 2.3, kind: "window" },
      { from: 9.0, to: 10.5, sill: 0, top: 2.55, kind: "bay", split: 2 },
    ],
  },
  {
    axis: "x", at: 3.5, from: -0.85, to: 11.15, t: ET, y0: 0, y1: B_TOP, out: 1,
    ops: [
      { from: 1.8, to: 3.6, sill: 1.1, top: 2.2, kind: "window", split: 2 },
      { from: 8.0, to: 9.2, sill: 1.6, top: 2.2, kind: "window" },
    ],
  },
  { axis: "z", at: 11, from: -4.5, to: 3.5, t: ET, y0: 0, y1: B_TOP, out: 1, ops: [{ from: -2.2, to: -0.8, sill: 0.9, top: 2.3, kind: "window", split: 2 }] },
  { axis: "z", at: 6, from: -4.5, to: 3.5, t: IT, y0: 0, y1: B_CEIL, ops: [{ from: -0.4, to: 0.4, sill: 0, top: 2.1, kind: "door" }] },
  { axis: "x", at: 0.5, from: 6, to: 11, t: IT, y0: 0, y1: B_CEIL, ops: [{ from: 6.4, to: 7.2, sill: 0, top: 2.1, kind: "door" }] },
];

// Étage du bloc principal (soulevé en vue en plan)
const WALLS_UF: WallDef[] = [
  {
    axis: "x", at: -4.5, from: -9.15, to: -0.85, t: ET, y0: UF0, y1: EAVE_Y, out: -1,
    ops: [
      { from: -8.3, to: -7.1, sill: 0.9, top: 2.2, kind: "window" },
      { from: -5.6, to: -2.4, sill: 0, top: 2.3, kind: "bay", split: 2 },
    ],
  },
  {
    axis: "x", at: 4.5, from: -9.15, to: -0.85, t: ET, y0: UF0, y1: EAVE_Y, out: 1,
    ops: [
      { from: -8.0, to: -6.8, sill: 0.9, top: 2.2, kind: "window" },
      { from: -4.6, to: -3.4, sill: 0.9, top: 2.2, kind: "window" },
      { from: -2.4, to: -1.6, sill: 1.3, top: 2.2, kind: "window" },
    ],
  },
  { axis: "z", at: -9, from: -4.5, to: 4.5, t: ET, y0: UF0, y1: EAVE_Y, out: -1, ops: [{ from: 0.6, to: 1.8, sill: 0.9, top: 2.2, kind: "window" }] },
  { axis: "z", at: -1, from: -4.5, to: 4.5, t: ET, y0: UF0, y1: EAVE_Y, out: 1, ops: [{ from: -1.0, to: 0.2, sill: 0.9, top: 2.2, kind: "window" }] },
];

function wallBoxes(w: WallDef) {
  const h = w.y1 - w.y0;
  const ops = [...(w.ops ?? [])].sort((a, b) => a.from - b.from);
  const parts: { a: number; b: number; y0: number; y1: number }[] = [];
  let cur = w.from;
  for (const o of ops) {
    if (o.from > cur) parts.push({ a: cur, b: o.from, y0: 0, y1: h });
    if (o.sill > 0) parts.push({ a: o.from, b: o.to, y0: 0, y1: o.sill });
    if (o.top < h) parts.push({ a: o.from, b: o.to, y0: o.top, y1: h });
    cur = o.to;
  }
  if (cur < w.to) parts.push({ a: cur, b: w.to, y0: 0, y1: h });
  return parts.map(({ a, b, y0, y1 }) => {
    const mid = (a + b) / 2;
    const len = b - a;
    const y = w.y0 + (y0 + y1) / 2;
    const hh = y1 - y0;
    return w.axis === "x" ? { p: [mid, y, w.at] as V3, s: [len, hh, w.t] as V3 } : { p: [w.at, y, mid] as V3, s: [w.t, hh, len] as V3 };
  });
}

/** Matériaux par face : enduit beige côté extérieur, peinture blanche côté intérieur. */
function faceMats(w: WallDef, m: Mats) {
  if (!w.out) return m.white;
  const arr = [m.white, m.white, m.white, m.white, m.white, m.white];
  const idx = w.axis === "x" ? (w.out > 0 ? 4 : 5) : w.out > 0 ? 0 : 1;
  arr[idx] = m.beige;
  arr[2] = m.beige; // dessus (visible en vue en plan)
  return arr;
}

function WindowUnit({ w, o, m }: { w: WallDef; o: Opening; m: Mats }) {
  const len = o.to - o.from;
  const h = o.top - o.sill;
  const mid = (o.from + o.to) / 2;
  const yMid = w.y0 + o.sill + h / 2;
  const f = 0.06;
  const d = 0.09;
  const along = (pos: number, y: number, sA: number, sY: number, depth = d): { p: V3; s: V3 } =>
    w.axis === "x" ? { p: [pos, y, w.at], s: [sA, sY, depth] } : { p: [w.at, y, pos], s: [depth, sY, sA] };
  const pieces = [
    along(mid, w.y0 + o.top - f / 2, len, f),
    along(mid, w.y0 + o.sill + f / 2, len, f),
    along(o.from + f / 2, yMid, f, h),
    along(o.to - f / 2, yMid, f, h),
  ];
  const n = o.split ?? 1;
  for (let i = 1; i < n; i++) pieces.push(along(o.from + (len * i) / n, yMid, f * 0.9, h));
  const glass = along(mid, yMid, len - f, h - f, 0.02);
  const out = w.out ?? 0;
  const sill =
    o.sill > 0 && out
      ? w.axis === "x"
        ? { p: [mid, w.y0 + o.sill - 0.03, w.at + out * (ET / 2 + 0.04)] as V3, s: [len + 0.1, 0.05, 0.18] as V3 }
        : { p: [w.at + out * (ET / 2 + 0.04), w.y0 + o.sill - 0.03, mid] as V3, s: [0.18, 0.05, len + 0.1] as V3 }
      : null;
  return (
    <group>
      {pieces.map((pc, i) => (
        <B key={i} p={pc.p} s={pc.s} m={m.frame} receive={false} />
      ))}
      <mesh position={glass.p} material={m.glass}>
        <boxGeometry args={glass.s} />
      </mesh>
      {sill && <B p={sill.p} s={sill.s} m={m.coping} />}
    </group>
  );
}

function InteriorDoor({ w, o, m }: { w: WallDef; o: Opening; m: Mats }) {
  const len = o.to - o.from;
  if (w.axis === "x")
    return (
      <group position={[o.from, 0, w.at]} rotation={[0, -1.1, 0]}>
        <B p={[len / 2, 1.04, 0]} s={[len - 0.04, 2.06, 0.04]} m={m.lacquerWhite} />
        <B p={[len - 0.1, 1.0, 0.04]} s={[0.12, 0.02, 0.02]} m={m.black} />
      </group>
    );
  return (
    <group position={[w.at, 0, o.from]} rotation={[0, 1.1, 0]}>
      <B p={[0, 1.04, len / 2]} s={[0.04, 2.06, len - 0.04]} m={m.lacquerWhite} />
    </group>
  );
}

function FrontDoor({ m }: { m: Mats }) {
  return (
    <group position={[-5.7, 0, 4.5]}>
      <B p={[0, 1.15, 0]} s={[1.0, 2.3, 0.08]} m={m.oakSolid} />
      <B p={[0.36, 1.1, 0.07]} s={[0.03, 0.9, 0.03]} m={m.black} />
      <B p={[0, 2.62, 0.6]} s={[1.9, 0.08, 1.2]} m={m.frame} />
    </group>
  );
}

function WallSet({ defs, m }: { defs: WallDef[]; m: Mats }) {
  return (
    <group>
      {defs.map((w, wi) => {
        const mats = faceMats(w, m);
        return (
          <group key={wi}>
            {wallBoxes(w).map((b, i) => (
              <B key={i} p={b.p} s={b.s} m={mats} />
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
        );
      })}
    </group>
  );
}

/* ========================================================================== */
/*  TOITURE 4 PANS, ÉTAGE, BALCON, PERGOLA                                      */
/* ========================================================================== */

/** Toit à quatre pans : faîtage sur le grand côté, UV en mètres pour les tuiles. */
function hipRoofGeometry(x0: number, x1: number, z0: number, z1: number, pitch: number) {
  const w = x1 - x0;
  const d = z1 - z0;
  const alongZ = d >= w;
  const half = (alongZ ? w : d) / 2;
  const rise = half * Math.tan(pitch);
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const r0: V3 = alongZ ? [cx, rise, z0 + half] : [x0 + half, rise, cz];
  const r1: V3 = alongZ ? [cx, rise, z1 - half] : [x1 - half, rise, cz];
  const c = { a: [x0, 0, z0] as V3, b: [x1, 0, z0] as V3, c: [x1, 0, z1] as V3, d: [x0, 0, z1] as V3 };
  const faces: V3[][] = alongZ
    ? [
        [c.a, c.d, r1, r0], // ouest
        [c.c, c.b, r0, r1], // est
        [c.b, c.a, r0], // sud (croupe)
        [c.d, c.c, r1], // nord (croupe)
      ]
    : [
        [c.b, c.a, r0, r1],
        [c.d, c.c, r1, r0],
        [c.a, c.d, r0],
        [c.c, c.b, r1],
      ];
  const pos: number[] = [];
  const uv: number[] = [];
  const pushTri = (p: V3[], i: number, j: number, k: number) => {
    const A = new THREE.Vector3(...p[0]);
    const B = new THREE.Vector3(...p[1]);
    const N = new THREE.Vector3().subVectors(B, A).normalize();
    for (const idx of [i, j, k]) {
      const v = new THREE.Vector3(...p[idx]);
      pos.push(v.x, v.y, v.z);
      const rel = v.clone().sub(A);
      const u = rel.dot(N);
      const vv = Math.hypot(rel.x - N.x * u, rel.z - N.z * u) / Math.cos(pitch);
      uv.push(u / 1.4, vv / 1.4);
    }
  };
  for (const f of faces) {
    pushTri(f, 0, 1, 2);
    if (f.length === 4) pushTri(f, 0, 2, 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return { g, rise, r0, r1 };
}

function UpperFloor({ m, group }: { m: Mats; group: React.RefObject<THREE.Group | null> }) {
  const roof = useMemo(() => hipRoofGeometry(-9.65, -0.35, -5.15, 5.15, THREE.MathUtils.degToRad(22)), []);
  const tilesMat = useMemo(() => {
    const t = m.tiles.clone();
    t.side = THREE.DoubleSide;
    return t;
  }, [m.tiles]);
  return (
    <group ref={group}>
      {/* dalle de l'étage (plafond du rez-de-chaussée) + spots encastrés */}
      <B p={[-5, GF + SLAB / 2, 0]} s={[8.3, SLAB, 9.3]} m={[m.beige, m.beige, m.beige, m.white, m.beige, m.beige]} />
      {[-7.5, -5, -2.5].flatMap((x) =>
        [-3, -0.8, 2.6].map((z) => (
          <mesh key={`${x}${z}`} position={[x, GF - 0.005, z]} rotation={[Math.PI / 2, 0, 0]} material={m.spot}>
            <circleGeometry args={[0.05, 20]} />
          </mesh>
        )),
      )}
      <WallSet defs={WALLS_UF} m={m} />
      {/* intérieur de l'étage, sombre, vu à travers les vitres */}
      <mesh position={[-5, (UF0 + EAVE_Y) / 2, 0]} material={m.roomDark}>
        <boxGeometry args={[7.6, EAVE_Y - UF0 - 0.02, 8.6]} />
      </mesh>
      {/* balcon en porte-à-faux avec garde-corps à câbles */}
      <B p={[-5, GF + SLAB / 2, -5.3]} s={[6.8, SLAB, 1.6]} m={m.beige} />
      {[-8.35, -7.2, -6.05, -4.9, -3.75, -2.6, -1.65].map((x) => (
        <B key={x} p={[x, UF0 + 0.5, -6.05]} s={[0.04, 1.0, 0.04]} m={m.frame} />
      ))}
      <B p={[-5, UF0 + 1.0, -6.05]} s={[6.75, 0.05, 0.06]} m={m.frame} />
      {[0.25, 0.45, 0.65, 0.85].map((y) => (
        <mesh key={y} position={[-5, UF0 + y, -6.05]} rotation={[0, 0, Math.PI / 2]} material={m.steel}>
          <cylinderGeometry args={[0.004, 0.004, 6.7, 4]} />
        </mesh>
      ))}
      {[-8.38, -1.62].map((x) => (
        <group key={x}>
          <B p={[x, UF0 + 1.0, -5.3]} s={[0.05, 0.05, 1.5]} m={m.frame} />
          {[0.25, 0.45, 0.65, 0.85].map((y) => (
            <mesh key={y} position={[x, UF0 + y, -5.3]} rotation={[Math.PI / 2, 0, 0]} material={m.steel}>
              <cylinderGeometry args={[0.004, 0.004, 1.5, 4]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* plantes en pot sur le balcon */}
      <mesh position={[-8.0, UF0 + 0.25, -5.7]} material={m.potDark} castShadow>
        <cylinderGeometry args={[0.2, 0.16, 0.5, 20]} />
      </mesh>
      {/* toiture en tuiles, avant-toit, gouttières */}
      <group position={[0, EAVE_Y, 0]}>
        <mesh geometry={roof.g} material={tilesMat} castShadow receiveShadow />
        {[
          { p: [-5, -0.05, -5.15] as V3, s: [9.3, 0.18, 0.12] as V3 },
          { p: [-5, -0.05, 5.15] as V3, s: [9.3, 0.18, 0.12] as V3 },
          { p: [-9.65, -0.05, 0] as V3, s: [0.12, 0.18, 10.3] as V3 },
          { p: [-0.35, -0.05, 0] as V3, s: [0.12, 0.18, 10.3] as V3 },
        ].map((f, i) => (
          <B key={i} p={f.p} s={f.s} m={m.frame} />
        ))}
        {/* sous-face de l'avant-toit */}
        <B p={[-5, -0.13, 0]} s={[9.3, 0.02, 10.3]} m={m.white} cast={false} />
        {/* cheminée */}
        <B p={[-7.2, 1.2, 1.8]} s={[0.75, 2.4, 0.75]} m={m.beige} />
        <B p={[-7.2, 2.45, 1.8]} s={[0.9, 0.1, 0.9]} m={m.coping} />
      </group>
    </group>
  );
}

function WingRoof({ m, group }: { m: Mats; group: React.RefObject<THREE.Group | null> }) {
  const blades = [];
  for (let x = 0.75; x < 8.5; x += 0.24) blades.push(x);
  return (
    <group ref={group}>
      <B p={[5.075, B_CEIL + 0.12, -0.5]} s={[12.15, 0.24, 8.3]} m={[m.beige, m.beige, m.chain, m.white, m.beige, m.beige]} />
      {/* couvertines de l'acrotère */}
      <B p={[5.075, B_TOP + 0.02, -4.5]} s={[12.3, 0.04, 0.36]} m={m.coping} />
      <B p={[5.075, B_TOP + 0.02, 3.5]} s={[12.3, 0.04, 0.36]} m={m.coping} />
      <B p={[11, B_TOP + 0.02, -0.5]} s={[0.36, 0.04, 8.3]} m={m.coping} />
      {/* spots */}
      {[0.8, 2.6, 4.4, 7.6, 9.6].flatMap((x) =>
        [-2.6, 1.6].map((z) => (
          <mesh key={`${x}${z}`} position={[x, B_CEIL - 0.005, z]} rotation={[Math.PI / 2, 0, 0]} material={m.spot}>
            <circleGeometry args={[0.05, 20]} />
          </mesh>
        )),
      )}
      {/* pergola bioclimatique */}
      <group>
        {[
          [0.6, -8.6],
          [8.6, -8.6],
        ].map(([x, z]) => (
          <B key={x} p={[x, 1.45, z]} s={[0.16, 2.9, 0.16]} m={m.frame} />
        ))}
        <B p={[4.6, 2.85, -8.6]} s={[8.2, 0.2, 0.16]} m={m.frame} />
        {[0.6, 8.6].map((x) => (
          <B key={x} p={[x, 2.85, -6.55]} s={[0.16, 0.2, 4.1]} m={m.frame} />
        ))}
        <B p={[4.6, 2.85, -4.6]} s={[8.2, 0.2, 0.12]} m={m.frame} />
        {blades.map((x) => (
          <B key={x} p={[x, 2.88, -6.55]} r={[0, 0, 0.5]} s={[0.17, 0.025, 3.95]} m={m.frame} />
        ))}
      </group>
    </group>
  );
}

/* ========================================================================== */
/*  SOLS, TERRASSE, PISCINE, JARDIN                                             */
/* ========================================================================== */

const ROOMS = [
  { name: "Séjour", area: "44 m²", x: [-9, -1], z: [-4.5, 1] },
  { name: "Entrée", area: "14 m²", x: [-9, -5], z: [1, 4.5] },
  { name: "Bureau", area: "14 m²", x: [-5, -1], z: [1, 4.5] },
  { name: "Cuisine & repas", area: "56 m²", x: [-1, 6], z: [-4.5, 3.5] },
  { name: "Suite parentale", area: "25 m²", x: [6, 11], z: [-4.5, 0.5] },
  { name: "Salle de bain", area: "15 m²", x: [6, 11], z: [0.5, 3.5] },
] as const;

function Floors({ m }: { m: Mats }) {
  const oak = useMemo(() => {
    const c = m.oak.clone();
    for (const k of ["map", "roughnessMap", "bumpMap"] as const) {
      const t = (m.oak[k] as THREE.Texture).clone();
      t.needsUpdate = true;
      t.repeat.set(7, 7);
      c[k] = t;
    }
    return c;
  }, [m.oak]);
  return (
    <group>
      <B p={[1, -0.15, -0.5]} s={[20.4, 0.3, 9.4]} m={m.coping} />
      <mesh position={[1, 0.005, 0]} material={oak} receiveShadow>
        <boxGeometry args={[20, 0.01, 9]} />
      </mesh>
      {/* escalier vers l'étage */}
      {Array.from({ length: 15 }, (_, i) => (
        <B key={i} p={[-8.35, 0.09 + i * 0.19, 1.3 + i * 0.2]} s={[1.0, 0.04, 0.3]} m={m.oakSolid} />
      ))}
      <B p={[-7.82, 1.5, 2.8]} r={[-0.76, 0, 0]} s={[0.03, 0.03, 4.1]} m={m.black} />
    </group>
  );
}

function Outdoor({ m }: { m: Mats }) {
  const waterRef = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const n = m.water.normalMap;
    if (n) {
      n.offset.x = s.clock.elapsedTime * 0.012;
      n.offset.y = s.clock.elapsedTime * 0.008;
    }
  });
  const waterNormal = useMemo(() => {
    const t = m.water.normalMap!;
    t.repeat.set(6, 1.3);
    return t;
  }, [m.water]);
  void waterNormal;
  return (
    <group>
      {/* pelouse (texture photo) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.12, 0]} material={m.lawn} receiveShadow>
        <planeGeometry args={[280, 280]} />
      </mesh>
      {/* terrasse en dalles de pierre */}
      <B p={[0.5, -0.06, -8.0]} s={[23, 0.12, 7.0]} m={m.stone} cast={false} />
      {/* massif de galets entre terrasse et piscine */}
      <B p={[0.0, -0.08, -12.55]} s={[25, 0.1, 2.1]} m={m.pebbles} cast={false} />
      {[-4.2, -2.6, -1.0].map((x, i) => (
        <B key={x} p={[-3 + i * 0.1 + (x + 2.6) * 0, -0.02, -11.9 - i * 0.55]} s={[1.1, 0.06, 0.5]} m={m.paving} />
      ))}
      {/* piscine 24 × 5 m, liner sombre */}
      {/* margelle : cadre en pierre autour du bassin */}
      <B p={[0, -0.07, -13.7]} s={[25.2, 0.1, 0.6]} m={m.coping} cast={false} />
      <B p={[0, -0.07, -19.3]} s={[25.2, 0.1, 0.6]} m={m.coping} cast={false} />
      <B p={[-12.3, -0.07, -16.5]} s={[0.6, 0.1, 5]} m={m.coping} cast={false} />
      <B p={[12.3, -0.07, -16.5]} s={[0.6, 0.1, 5]} m={m.coping} cast={false} />
      <B p={[0, -0.6, -16.5]} s={[24, 1.0, 5]} m={m.liner} cast={false} />
      <mesh ref={waterRef} position={[0, -0.07, -16.5]} rotation-x={-Math.PI / 2} material={m.water} receiveShadow>
        <planeGeometry args={[24, 5]} />
      </mesh>
      {[-6, 6].map((x) => (
        <mesh key={x} position={[x, -0.35, -13.99]} material={m.lamp}>
          <circleGeometry args={[0.1, 20]} />
        </mesh>
      ))}
      {/* allée d'entrée et accès en gravier clair */}
      <B p={[-5.7, -0.07, 9.0]} s={[1.6, 0.1, 9.0]} m={m.paving} cast={false} />
      <B p={[4.5, -0.08, 9.5]} s={[6, 0.08, 12]} m={m.gravelLight} cast={false} />
      {/* bains de soleil blancs sur les galets */}
      {[-1.4, 0.4].map((x) => (
        <group key={x} position={[x, 0, -12.6]} rotation={[0, 0.08, 0]}>
          <B p={[0, 0.22, 0]} s={[0.72, 0.07, 1.95]} m={m.lounger} />
          <B p={[0, 0.42, 0.75]} r={[-0.55, 0, 0]} s={[0.72, 0.06, 0.65]} m={m.lounger} />
          {[-0.3, 0.3].flatMap((dx) =>
            [-0.85, 0.8].map((dz) => <B key={`${dx}${dz}`} p={[dx, 0.1, dz]} s={[0.04, 0.2, 0.04]} m={m.lounger} />),
          )}
        </group>
      ))}
      {/* salon de jardin en résine tressée sous la pergola */}
      <group position={[3.2, 0, -6.6]}>
        <RoundedBox args={[2.4, 0.42, 0.85]} radius={0.06} position={[0, 0.24, 0]} material={m.rattan} castShadow receiveShadow />
        <RoundedBox args={[2.4, 0.42, 0.2]} radius={0.06} position={[0, 0.6, 0.35]} material={m.rattan} castShadow />
        {[-0.8, 0, 0.8].map((x) => (
          <RoundedBox key={x} args={[0.76, 0.14, 0.7]} radius={0.05} position={[x, 0.52, -0.04]} material={m.cushionOut} castShadow />
        ))}
        <RoundedBox args={[0.85, 0.42, 0.85]} radius={0.06} position={[-2.0, 0.24, -0.9]} rotation={[0, 0.9, 0]} material={m.rattan} castShadow />
        <RoundedBox args={[1.0, 0.32, 0.6]} radius={0.04} position={[0, 0.17, -1.0]} material={m.rattan} castShadow />
      </group>
      {/* appliques murales */}
      {[-8.2, -1.6, 0.2, 6.3, 8.6, 10.8].map((x) => (
        <group key={x} position={[x, 2.25, -4.66]}>
          <B p={[0, 0, 0]} s={[0.12, 0.18, 0.06]} m={m.frame} />
          <mesh position={[0, -0.1, -0.035]} material={m.lamp}>
            <boxGeometry args={[0.09, 0.03, 0.01]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ========================================================================== */
/*  INTÉRIEUR                                                                   */
/* ========================================================================== */

function Models({ m }: { m: Mats }) {
  const sofa = useGLTF("/models/sofa.glb");
  const chair = useGLTF("/models/armchair.glb");
  const plant = useGLTF("/models/plant.glb");
  useEffect(() => {
    for (const s of [sofa.scene, chair.scene, plant.scene])
      s.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
  }, [sofa, chair, plant]);
  return (
    <group>
      {/* séjour */}
      <Clone object={sofa.scene} position={[-4.6, 0.01, -2.1]} />
      <Clone object={chair.scene} position={[-7.2, 0.01, -0.6]} rotation={[0, Math.PI / 2 + 0.3, 0]} />
      <Clone object={chair.scene} position={[-2.0, 0.01, -0.4]} rotation={[0, -Math.PI / 2 - 0.3, 0]} />
      <Clone object={plant.scene} position={[-8.4, 0.01, -3.9]} scale={1.5} />
      <Clone object={plant.scene} position={[-1.5, 0.01, 0.55]} scale={1.2} />
      {/* cuisine & suite */}
      <Clone object={plant.scene} position={[5.5, 0.01, -3.9]} scale={1.4} />
      <Clone object={plant.scene} position={[10.5, 0.01, -3.9]} scale={1.2} />
      {/* terrasse */}
      <Clone object={plant.scene} position={[-9.2, 0, -5.3]} scale={1.3} />
      <Clone object={plant.scene} position={[9.3, 0, -5.2]} scale={1.3} />
      <group>
        <mesh position={[-4.6, 0.012, -1.2]} material={m.rug} receiveShadow>
          <boxGeometry args={[3.4, 0.01, 2.6]} />
        </mesh>
      </group>
    </group>
  );
}

function Living({ m }: { m: Mats }) {
  return (
    <group>
      {/* table basse en marbre */}
      <mesh position={[-4.6, 0.38, -0.8]} material={m.marble} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.04, 48]} />
      </mesh>
      <mesh position={[-4.6, 0.18, -0.8]} material={m.black} castShadow>
        <cylinderGeometry args={[0.2, 0.26, 0.36, 24]} />
      </mesh>
      <B p={[-4.45, 0.43, -0.75]} s={[0.26, 0.05, 0.2]} m={m.book[0]} />
      {/* meuble TV + écran sur le mur nord */}
      <B p={[-4.6, 0.26, 0.82]} s={[2.6, 0.44, 0.42]} m={m.walnut} />
      <B p={[-4.6, 1.42, 0.92]} s={[1.6, 0.9, 0.04]} m={m.screen} />
      <B p={[-4.6, 1.42, 0.95]} s={[3.2, 2.84, 0.02]} m={m.lacquer} cast={false} />
      {/* bibliothèque sur le mur ouest */}
      <group position={[-8.82, 0, 2.6]}>
        <B p={[0, 1.0, -5.9]} s={[0.32, 2.0, 0.04]} m={m.walnut} />
      </group>
      <group position={[-8.75, 0, -3.7]}>
        {[0.4, 0.85, 1.3, 1.75].map((y) => (
          <B key={y} p={[0, y, 0]} s={[0.36, 0.03, 1.1]} m={m.walnut} />
        ))}
        {Array.from({ length: 22 }, (_, i) => (
          <B key={i} p={[0.02, 0.53 + Math.floor(i / 8) * 0.45, -0.48 + (i % 8) * 0.12]} s={[0.24, 0.22 + (i % 3) * 0.03, 0.06]} m={m.book[i % 5]} cast={false} />
        ))}
      </group>
      {/* lampadaire */}
      <group position={[-7.6, 0, -2.6]}>
        <mesh position={[0, 0.02, 0]} material={m.black}>
          <cylinderGeometry args={[0.16, 0.16, 0.03, 24]} />
        </mesh>
        <mesh position={[0, 0.8, 0]} material={m.brass}>
          <cylinderGeometry args={[0.012, 0.012, 1.6, 8]} />
        </mesh>
        <mesh position={[0, 1.62, 0]} material={m.linen}>
          <cylinderGeometry args={[0.18, 0.24, 0.3, 32, 1, true]} />
        </mesh>
        <pointLight position={[0, 1.55, 0]} intensity={2} distance={4} color="#ffd9a8" />
      </group>
      {/* tableau */}
      <B p={[-8.84, 1.6, -1.7]} s={[0.03, 0.9, 1.3]} m={m.art} cast={false} />
    </group>
  );
}

function Kitchen({ m }: { m: Mats }) {
  const fronts: number[] = [];
  for (let x = 0.0; x < 4.6; x += 0.6) fronts.push(x);
  return (
    <group>
      {/* linéaire bas + plan marbre le long du mur nord */}
      <B p={[2.3, 0.44, 3.04]} s={[4.6, 0.88, 0.62]} m={m.lacquer} />
      {fronts.map((x) => (
        <B key={x} p={[x + 0.3, 0.7, 2.72]} s={[0.3, 0.015, 0.02]} m={m.brass} cast={false} />
      ))}
      <B p={[2.3, 0.9, 3.02]} s={[4.64, 0.04, 0.66]} m={m.marble} />
      <B p={[2.3, 1.5, 3.32]} s={[4.6, 1.16, 0.02]} m={m.marble} cast={false} />
      <B p={[2.7, 0.905, 3.05]} s={[0.75, 0.03, 0.42]} m={m.steel} cast={false} />
      <mesh position={[2.7, 1.12, 3.28]} material={m.black}>
        <cylinderGeometry args={[0.015, 0.015, 0.42, 10]} />
      </mesh>
      {/* colonnes four / réfrigérateur */}
      <B p={[5.3, 1.15, 2.85]} s={[1.1, 2.3, 0.62]} m={m.lacquer} />
      <B p={[5.02, 1.25, 2.53]} s={[0.5, 0.5, 0.02]} m={m.screen} cast={false} />
      {[5.45, 5.6].map((x) => (
        <B key={x} p={[x, 1.5, 2.52]} s={[0.02, 0.6, 0.02]} m={m.brass} cast={false} />
      ))}
      {/* îlot à plateau retombant */}
      <group position={[2.3, 0, 1.1]}>
        <B p={[0, 0.45, 0]} s={[2.9, 0.9, 1.0]} m={m.lacquerWhite} />
        <B p={[0, 0.92, 0]} s={[3.0, 0.04, 1.05]} m={m.marble} />
        <B p={[-1.48, 0.46, 0]} s={[0.04, 0.92, 1.05]} m={m.marble} />
        <B p={[1.48, 0.46, 0]} s={[0.04, 0.92, 1.05]} m={m.marble} />
        <B p={[0.6, 0.942, 0.1]} s={[0.6, 0.006, 0.5]} m={m.screen} cast={false} />
        {[-0.9, 0, 0.9].map((x) => (
          <group key={x} position={[x, 0, -0.78]}>
            <mesh position={[0, 0.66, 0]} material={m.walnut} castShadow>
              <cylinderGeometry args={[0.19, 0.17, 0.05, 28]} />
            </mesh>
            <mesh position={[0, 0.33, 0]} material={m.black} castShadow>
              <cylinderGeometry args={[0.02, 0.025, 0.66, 8]} />
            </mesh>
          </group>
        ))}
        {[-0.9, 0, 0.9].map((x) => (
          <group key={`l${x}`} position={[x, 0, 0]}>
            <mesh position={[0, 2.55, 0]} material={m.black}>
              <cylinderGeometry args={[0.004, 0.004, 1.1, 4]} />
            </mesh>
            <mesh position={[0, 1.95, 0]} material={m.brass} castShadow>
              <coneGeometry args={[0.17, 0.22, 28, 1, true]} />
            </mesh>
            <mesh position={[0, 1.88, 0]} material={m.lamp}>
              <sphereGeometry args={[0.05, 12, 8]} />
            </mesh>
          </group>
        ))}
        <pointLight position={[0, 1.7, 0]} intensity={3} distance={5} color="#ffd9a8" />
      </group>
      {/* table à manger 8 couverts près de la baie */}
      <group position={[3.0, 0, -2.6]}>
        <B p={[0, 0.74, 0]} s={[2.8, 0.05, 1.0]} m={m.oakSolid} />
        {[-1.2, 1.2].map((x) => (
          <B key={x} p={[x, 0.36, 0]} s={[0.07, 0.72, 0.85]} m={m.oakSolid} />
        ))}
        {[-0.95, -0.32, 0.32, 0.95].flatMap((x) =>
          [-1, 1].map((s) => (
            <group key={`${x}${s}`} position={[x, 0, s * 0.72]} rotation={[0, s > 0 ? Math.PI : 0, 0]}>
              <RoundedBox args={[0.46, 0.07, 0.46]} radius={0.025} position={[0, 0.46, 0]} material={m.linen} castShadow />
              <RoundedBox args={[0.46, 0.44, 0.06]} radius={0.025} position={[0, 0.72, -0.21]} material={m.linen} castShadow />
              {[-0.18, 0.18].flatMap((dx) =>
                [-0.18, 0.18].map((dz) => (
                  <mesh key={`${dx}${dz}`} position={[dx, 0.22, dz]} material={m.walnut}>
                    <cylinderGeometry args={[0.017, 0.014, 0.44, 8]} />
                  </mesh>
                )),
              )}
            </group>
          )),
        )}
        <mesh position={[0, 2.0, 0]} material={m.brass} castShadow>
          <cylinderGeometry args={[0.7, 0.7, 0.04, 48, 1, true]} />
        </mesh>
        <mesh position={[0, 1.99, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.lamp}>
          <ringGeometry args={[0.6, 0.68, 48]} />
        </mesh>
        <pointLight position={[0, 1.8, 0]} intensity={3} distance={5} color="#ffd9a8" />
        <mesh position={[0, 0.83, 0]} material={m.ceramic} castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.16, 20]} />
        </mesh>
      </group>
    </group>
  );
}

function OtherRooms({ m }: { m: Mats }) {
  return (
    <group>
      {/* suite : lit, chevets */}
      <group position={[9.6, 0, -2.0]} rotation={[0, -Math.PI / 2, 0]}>
        <RoundedBox args={[1.8, 0.32, 2.05]} radius={0.04} position={[0, 0.2, 0]} material={m.oakSolid} castShadow />
        <RoundedBox args={[1.76, 0.24, 2.0]} radius={0.09} position={[0, 0.44, 0.02]} material={m.linen} castShadow />
        <RoundedBox args={[1.8, 0.06, 0.75]} radius={0.03} position={[0, 0.58, 0.55]} material={m.fabricBlue} castShadow />
        {[-0.45, 0.45].map((x) => (
          <RoundedBox key={x} args={[0.75, 0.16, 0.42]} radius={0.07} position={[x, 0.63, -0.72]} material={m.linen} castShadow />
        ))}
        <B p={[0, 0.68, -1.06]} s={[2.1, 1.15, 0.08]} m={m.linen} />
        {[-1.3, 1.3].map((x) => (
          <group key={x} position={[x, 0, -0.8]}>
            <B p={[0, 0.25, 0]} s={[0.5, 0.5, 0.42]} m={m.walnut} />
            <mesh position={[0, 0.7, 0]} material={m.lamp}>
              <cylinderGeometry args={[0.1, 0.13, 0.22, 20]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* salle de bain : baignoire îlot, double vasque, douche */}
      <RoundedBox args={[0.8, 0.55, 1.75]} radius={0.16} position={[9.8, 0.28, 2.0]} material={m.ceramic} castShadow />
      <B p={[7.2, 0.75, 3.2]} s={[1.6, 0.3, 0.5]} m={m.oakSolid} />
      <B p={[7.2, 0.92, 3.18]} s={[1.6, 0.05, 0.5]} m={m.ceramic} />
      <B p={[7.2, 1.6, 3.33]} s={[1.5, 0.8, 0.02]} m={m.steel} cast={false} />
      <mesh position={[10.4, 1.05, 0.95]} material={m.glass}>
        <boxGeometry args={[0.02, 2.0, 0.9]} />
      </mesh>
      {/* bureau */}
      <B p={[-3.0, 0.74, 3.95]} s={[1.6, 0.04, 0.7]} m={m.oakSolid} />
      {[-3.75, -2.25].map((x) => (
        <B key={x} p={[x, 0.36, 3.95]} s={[0.04, 0.72, 0.65]} m={m.black} />
      ))}
      <RoundedBox args={[0.55, 0.5, 0.55]} radius={0.08} position={[-3.0, 0.3, 3.25]} material={m.fabricBlue} castShadow />
      {/* entrée : console */}
      <B p={[-8.75, 0.8, 0.0 + 3.0]} s={[0.35, 0.05, 1.0]} m={m.walnut} />
    </group>
  );
}

/* ========================================================================== */
/*  STRUCTURE (vue « rayons X »)                                                */
/* ========================================================================== */

function Structure({ m, group }: { m: Mats; group: React.RefObject<THREE.Group | null> }) {
  const roof = useMemo(() => hipRoofGeometry(-9.65, -0.35, -5.15, 5.15, THREE.MathUtils.degToRad(22)), []);
  const rafters = [];
  for (let z = -4.6; z <= 4.6; z += 0.6) rafters.push(z);
  const slope = 4.65 / Math.cos(THREE.MathUtils.degToRad(22));
  return (
    <group ref={group} visible={false}>
      {/* fondations : semelles filantes */}
      {[
        { p: [-5, -0.75, -4.5], s: [8.6, 0.9, 0.7] },
        { p: [-5, -0.75, 4.5], s: [8.6, 0.9, 0.7] },
        { p: [-9, -0.75, 0], s: [0.7, 0.9, 9.6] },
        { p: [5, -0.75, -4.5], s: [12.4, 0.9, 0.7] },
        { p: [5, -0.75, 3.5], s: [12.4, 0.9, 0.7] },
        { p: [11, -0.75, -0.5], s: [0.7, 0.9, 8.6] },
        { p: [-1, -0.75, -0.5], s: [0.7, 0.9, 8.6] },
      ].map((f, i) => (
        <B key={i} p={f.p as V3} s={f.s as V3} m={m.concrete} />
      ))}
      {/* chaînages béton */}
      {[GF, EAVE_Y - 0.1].map((y) => (
        <group key={y}>
          <B p={[-5, y, -4.5]} s={[8.4, 0.2, 0.32]} m={m.chain} />
          <B p={[-5, y, 4.5]} s={[8.4, 0.2, 0.32]} m={m.chain} />
          <B p={[-9, y, 0]} s={[0.32, 0.2, 9.0]} m={m.chain} />
          <B p={[-1, y, 0]} s={[0.32, 0.2, 9.0]} m={m.chain} />
        </group>
      ))}
      {/* charpente : faîtage, arêtiers et chevrons */}
      <group position={[0, EAVE_Y, 0]}>
        <B p={[-5, roof.rise, 0]} s={[0.12, 0.2, roof.r1[2] - roof.r0[2]]} m={m.timber} />
        {rafters.map((z) =>
          [-1, 1].map((side) => (
            <B
              key={`${z}${side}`}
              p={[-5 + side * 2.32, roof.rise / 2, z]}
              r={[0, 0, side * THREE.MathUtils.degToRad(22)]}
              s={[slope, 0.14, 0.07]}
              m={m.timber}
            />
          )),
        )}
      </group>
    </group>
  );
}

/* ========================================================================== */
/*  ÉTIQUETTES                                                                  */
/* ========================================================================== */

function Labels({ shared }: { shared: React.RefObject<Shared> }) {
  const W = TOUR_WINDOWS;
  const d = (a: number) => [W.facades[0] + a, W.facades[1]] as [number, number];
  return (
    <group>
      {/* façades */}
      <Label position={[-5.1, 1.4, -4.8]} window={d(0)} shared={shared}>
        <Chip title="Baie coulissante alu" value="5,00 × 2,50 m" swatch="#2a2e33" />
      </Label>
      <Label position={[-5, EAVE_Y + 1.4, -2]} window={d(0.01)} shared={shared}>
        <Chip title="Toiture 4 pans" value="tuiles terre cuite" swatch="#8d5541" />
      </Label>
      <Label position={[-5, UF0 + 1.2, -6.1]} window={d(0.02)} shared={shared}>
        <Chip title="Balcon" value="garde-corps à câbles" />
      </Label>
      <Label position={[4.6, 3.3, -8.6]} window={d(0.03)} shared={shared}>
        <Chip title="Pergola bioclimatique" value="lames orientables" swatch="#2a2e33" />
      </Label>
      <Label position={[0, 0.4, -16.5]} window={d(0.04)} shared={shared}>
        <Chip title="Piscine" value="24,00 × 5,00 m" swatch="#163d47" />
      </Label>
      {/* plan */}
      {ROOMS.map((r) => (
        <Label key={r.name} position={[(r.x[0] + r.x[1]) / 2, 0.8, (r.z[0] + r.z[1]) / 2]} window={W.plan} shared={shared}>
          <RoomTag name={r.name} area={r.area} />
        </Label>
      ))}
      <Dimension from={[-9, 0.5, 5.6]} to={[11, 0.5, 5.6]} label="20,00 m" shared={shared} win={W.plan} />
      <Dimension from={[-10.2, 0.5, -4.5]} to={[-10.2, 0.5, 4.5]} label="9,00 m" shared={shared} win={[W.plan[0] + 0.01, W.plan[1]]} />
      <Dimension from={[12.2, 0.5, -4.5]} to={[12.2, 0.5, 3.5]} label="8,00 m" shared={shared} win={[W.plan[0] + 0.02, W.plan[1]]} />
      <Label position={[1, 0.8, -7.6]} window={[W.plan[0] + 0.03, W.plan[1]]} shared={shared}>
        <Chip title="Rez-de-chaussée" value="168 m² · étage 3 chambres" />
      </Label>
      {/* séjour */}
      <Label position={[-6.6, 0.1, -1.6]} window={W.sejour} shared={shared}>
        <Chip title="Parquet chêne massif" value="44 m²" swatch="#b08860" />
      </Label>
      <Label position={[-5.1, 2.3, -4.4]} window={[W.sejour[0] + 0.01, W.sejour[1]]} shared={shared}>
        <Chip title="Baie coulissante" value="5,00 × 2,50 m" />
      </Label>
      <Label position={[-4.6, 2.55, 0.9]} window={[W.sejour[0] + 0.02, W.sejour[1]]} shared={shared}>
        <Chip title="Mur laqué" value="bleu acier" swatch="#3e5b74" />
      </Label>
      <Label position={[-4.6, 1.0, -2.3]} window={[W.sejour[0] + 0.03, W.sejour[1]]} shared={shared}>
        <Chip title="Canapé velours" value="2,20 m" swatch="#c9b7a0" />
      </Label>
      <Label position={[-5.5, 2.75, -2.5]} window={[W.sejour[0] + 0.04, W.sejour[1]]} shared={shared}>
        <Chip title="Hauteur sous plafond" value="2,90 m" />
      </Label>
      {/* cuisine */}
      <Label position={[2.3, 1.15, 1.1]} window={W.cuisine} shared={shared}>
        <Chip title="Îlot" value="3,00 × 1,05 m" swatch="#f1eee8" />
      </Label>
      <Label position={[1.0, 1.25, 3.0]} window={[W.cuisine[0] + 0.01, W.cuisine[1]]} shared={shared}>
        <Chip title="Plan & crédence marbre" value="4,60 m" swatch="#e9e4dc" />
      </Label>
      <Label position={[5.3, 2.45, 2.6]} window={[W.cuisine[0] + 0.02, W.cuisine[1]]} shared={shared}>
        <Chip title="Façades laquées" value="bleu acier" swatch="#3e5b74" />
      </Label>
      <Label position={[3.0, 1.15, -2.6]} window={[W.cuisine[0] + 0.03, W.cuisine[1]]} shared={shared}>
        <Chip title="Table chêne" value="8 couverts · 2,80 m" swatch="#b08860" />
      </Label>
      {/* structure */}
      <Label position={[-5, EAVE_Y + 2.2, 0]} window={W.structure} shared={shared}>
        <Chip title="Charpente" value="faîtage · arêtiers · chevrons" swatch="#b58d5f" />
      </Label>
      <Label position={[-9.3, GF + 0.1, -2]} window={[W.structure[0] + 0.01, W.structure[1]]} shared={shared}>
        <Chip title="Chaînages" value="béton armé" swatch="#8f969c" />
      </Label>
      <Label position={[-9.3, 1.5, 2]} window={[W.structure[0] + 0.02, W.structure[1]]} shared={shared}>
        <Chip title="Murs" value="fissures · humidité" />
      </Label>
      <Label position={[-9.3, -0.75, -2.5]} window={[W.structure[0] + 0.03, W.structure[1]]} shared={shared}>
        <Chip title="Fondations" value="semelles filantes" swatch="#a9a399" />
      </Label>
    </group>
  );
}

/* ========================================================================== */
/*  CAMÉRA                                                                      */
/* ========================================================================== */

type Key = { p: number; pos: V3; look: V3; fov?: number };
const KEYS: Key[] = [
  { p: 0.0, pos: [7, 2.6, -40], look: [0.5, 3.2, -2], fov: 32 }, // de l'autre côté de la piscine
  { p: 0.06, pos: [-30, 13, -26], look: [0, 2.5, -2] }, // trois-quarts côté ouest
  { p: 0.13, pos: [30, 9, -24], look: [2, 2.2, -3] }, // côté pergola
  { p: 0.19, pos: [1.5, 46, 5], look: [1.5, 0, -0.3] }, // vue d'en haut
  { p: 0.32, pos: [1.5, 44, 4.6], look: [1.5, 0, -0.4] },
  { p: 0.37, pos: [-5, 1.7, -12], look: [-5, 1.4, -3] }, // devant la baie du séjour
  { p: 0.42, pos: [-1.6, 1.62, 0.4], look: [-7.5, 0.9, -2.4], fov: 60 }, // séjour
  { p: 0.52, pos: [-1.8, 1.62, 0.6], look: [-7.6, 1.0, -3.4], fov: 60 },
  { p: 0.59, pos: [0.0, 1.65, -3.8], look: [3.6, 1.0, 2.2], fov: 60 }, // cuisine
  { p: 0.68, pos: [0.4, 1.65, -3.9], look: [4.4, 1.0, 1.8], fov: 60 },
  { p: 0.74, pos: [8, 18, -16], look: [0, 2, 0] },
  { p: 0.82, pos: [-27, 6, -15], look: [-2, 2.6, 0] }, // vue « rayons X »
  { p: 0.92, pos: [-25, 7.5, -19], look: [-2, 2.6, 0] },
  { p: 1.0, pos: [10, 6, -44], look: [0.5, 3, -2], fov: 34 },
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

const INTRO_FROM = new THREE.Vector3(70, 45, -110);

function CameraRig({ shared }: { shared: React.RefObject<Shared> }) {
  const { camera, size, clock } = useThree();
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const curLook = useRef(new THREE.Vector3(0.5, 3, -2));
  useFrame((_, delta) => {
    const s = shared.current;
    let fov = sampleCamera(s.p, pos, look);
    const narrow = size.width / size.height < 0.8;
    if (narrow) {
      const outside = 1 - windowed(s.p, 0.35, 0.72, 0.05);
      const plan = windowed(s.p, 0.16, 0.35, 0.04);
      pos.sub(look).multiplyScalar(1 + 0.8 * outside + 0.4 * plan).add(look);
      fov += 6 * (1 - outside);
    }
    const intro = s.readyAt === null ? 0 : smooth(clamp01((clock.elapsedTime - s.readyAt) / 3));
    if (intro < 1) pos.lerpVectors(INTRO_FROM, pos, intro);
    pos.x += s.pointer.x * 0.5;
    pos.y += -s.pointer.y * 0.25;
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

const LAWN: [number, number, number, number][] = [
  [-34, -12.6, -32, 18],
  [12.6, 34, -32, 18],
  [-12.6, 12.6, -32, -19.6],
  [-12.6, -7.0, 4.8, 18],
  [-4.4, 1.2, 4.8, 18],
  [7.6, 12.6, 3.8, 18],
];

const TREES: TreeDef[] = [
  { p: [-17, -0.12, -6], h: 7.5, crown: 3.2, seed: 11 },
  { p: [-20, -0.12, 7], h: 9, crown: 3.8, seed: 12 },
  { p: [17.5, -0.12, -2], h: 8, crown: 3.4, seed: 13 },
  { p: [21, -0.12, 9], h: 9.5, crown: 4.0, seed: 14 },
  { p: [-8, -0.12, 14], h: 8.5, crown: 3.6, seed: 15 },
  { p: [9, -0.12, 15], h: 7.8, crown: 3.3, seed: 16 },
  { p: [-26, -0.12, -22], h: 8, crown: 3.4, seed: 17 },
  { p: [26, -0.12, -24], h: 8.4, crown: 3.5, seed: 18 },
];

function buildShrubs(): ShrubDef[] {
  const out: ShrubDef[] = [];
  let seed = 100;
  for (let x = -30; x <= 30; x += 2.6) out.push({ p: [x, -0.12, 24], r: 1.3, h: 2.2, seed: seed++ });
  for (let z = -30; z <= 22; z += 2.8) {
    out.push({ p: [-31, -0.12, z], r: 1.3, h: 2.0, seed: seed++ });
    out.push({ p: [31, -0.12, z], r: 1.3, h: 2.0, seed: seed++ });
  }
  out.push({ p: [-11.2, -0.12, -9.2], r: 0.7, h: 0.9, seed: seed++ });
  out.push({ p: [12.0, -0.12, -9.0], r: 0.7, h: 0.9, seed: seed++ });
  out.push({ p: [-7.6, -0.12, 5.6], r: 0.55, h: 0.8, seed: seed++ });
  out.push({ p: [-3.8, -0.12, 5.6], r: 0.55, h: 0.8, seed: seed++ });
  return out;
}

const GRASS_SPOTS: [number, number, number][] = [
  [-11.5, -12.6, 1.2], [-9.4, -12.2, 0.9], [-7.3, -12.9, 1.1], [-5.2, -12.4, 0.8], [-0.2, -11.9, 0.9],
  [2.4, -12.8, 1.2], [4.6, -12.2, 0.9], [6.8, -12.9, 1.1], [9.0, -12.3, 0.8], [11.4, -12.7, 1.2],
  [-12.1, -10.4, 0.8], [12.3, -10.6, 0.8], [-10.4, 5.4, 0.8], [-1.4, 5.3, 0.7], [1.3, 5.4, 0.9],
];

function Villa({ shared, lite }: { shared: React.RefObject<Shared>; lite: boolean }) {
  const m = useMats();
  const upper = useRef<THREE.Group>(null);
  const wingRoof = useRef<THREE.Group>(null);
  const gfWalls = useRef<THREE.Group>(null);
  const structure = useRef<THREE.Group>(null);
  const grassGroup = useRef<THREE.Group>(null);
  const shrubs = useMemo(() => buildShrubs(), []);
  const fading = useMemo(() => [m.beige, m.white, m.tiles, m.coping, m.frame, m.lacquerWhite], [m]);
  const xrayOn = useRef(false);

  useFrame(() => {
    const p = shared.current.p;
    // vue en plan : l'étage et le toit de l'aile se soulèvent
    const lift = windowed(p, 0.15, 0.37, 0.05);
    if (upper.current) {
      upper.current.position.y = lift * 14;
      upper.current.visible = lift < 0.98;
    }
    if (wingRoof.current) {
      wingRoof.current.position.y = lift * 10;
      wingRoof.current.visible = lift < 0.98;
    }
    if (gfWalls.current) gfWalls.current.scale.y = 1 - windowed(p, 0.16, 0.36, 0.05) * 0.55;
    // vue « rayons X » : murs translucides, structure apparente
    const x = windowed(p, 0.78, 0.95, 0.03);
    const on = x > 0.002;
    if (on !== xrayOn.current) {
      xrayOn.current = on;
      for (const mat of fading) {
        mat.transparent = on;
        mat.depthWrite = !on;
        mat.needsUpdate = true;
      }
    }
    for (const mat of fading) mat.opacity = 1 - x * 0.82;
    m.lawn.opacity = 1 - x * 0.8;
    if (structure.current) structure.current.visible = on;
    if (grassGroup.current) grassGroup.current.visible = x < 0.5;
  });

  return (
    <group>
      <Outdoor m={m} />
      <group ref={grassGroup}>
        <GrassField zones={LAWN} count={lite ? 14000 : 60000} y={-0.12} />
        <OrnamentalGrasses spots={GRASS_SPOTS} />
      </group>
      <Foliage trees={TREES} shrubs={shrubs} />
      <Floors m={m} />
      <group ref={gfWalls}>
        <WallSet defs={WALLS_GF} m={m} />
      </group>
      <Living m={m} />
      <Kitchen m={m} />
      <OtherRooms m={m} />
      <Suspense fallback={null}>
        <Models m={m} />
      </Suspense>
      <UpperFloor m={m} group={upper} />
      <WingRoof m={m} group={wingRoof} />
      <Structure m={m} group={structure} />
    </group>
  );
}

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

export default function VillaScene({ tour }: { tour: React.RefObject<TourState> }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const shared = useRef<Shared>({ p: 0, pointer: { x: 0, y: 0 }, readyAt: null });
  const [visible, setVisible] = useState(true);
  // Composant chargé uniquement côté navigateur (dynamic, ssr: false) : window est disponible.
  const [narrow] = useState(() => window.innerWidth < 768);
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
        camera={{ position: INTRO_FROM.toArray() as V3, fov: 32, near: 0.05, far: 2000 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        onCreated={({ clock }) => {
          if (isReady() && shared.current.readyAt === null) shared.current.readyAt = clock.elapsedTime;
        }}
      >
        <PerformanceMonitor onDecline={() => setDegraded(true)} flipflops={1} />
        <Progress tour={tour} shared={shared} />
        <Suspense fallback={null}>
          <SceneReady />
          <Sky distance={4500} sunPosition={SUN.toArray()} turbidity={6} rayleigh={1.4} mieCoefficient={0.006} mieDirectionalG={0.82} />
          <fog attach="fog" args={["#d8cfc6", 70, 300]} />
          <Environment files="/hdri/sunset.exr" environmentIntensity={0.55} />
          <hemisphereLight args={["#e9eef4", "#8f8a73", 0.35]} />
          <directionalLight
            position={SUN.toArray()}
            intensity={3.2}
            color="#ffd8b0"
            castShadow
            shadow-mapSize={[narrow ? 1024 : 4096, narrow ? 1024 : 4096]}
            shadow-camera-left={-34}
            shadow-camera-right={34}
            shadow-camera-top={34}
            shadow-camera-bottom={-34}
            shadow-camera-far={140}
            shadow-bias={-0.0003}
            shadow-normalBias={0.04}
          />
          <CameraRig shared={shared} />
          <Villa shared={shared} lite={narrow || degraded} />
          <Labels shared={shared} />
          {degraded ? (
            <EffectComposer multisampling={0} enableNormalPass={false}>
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            </EffectComposer>
          ) : (
            <EffectComposer multisampling={narrow ? 0 : 4} enableNormalPass={false}>
              <N8AO aoRadius={1.2} intensity={2.2} distanceFalloff={0.8} halfRes={narrow} quality={narrow ? "performance" : "medium"} />
              <Vignette offset={0.35} darkness={0.28} />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/sofa.glb");
useGLTF.preload("/models/armchair.glb");
useGLTF.preload("/models/plant.glb");
