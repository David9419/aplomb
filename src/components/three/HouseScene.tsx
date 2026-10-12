"use client";
/* eslint-disable react-hooks/immutability -- la boucle de rendu Three.js (useFrame) modifie volontairement
   des objets mutables (caméra, vecteurs, état partagé) en dehors du rendu React : c'est le fonctionnement normal de R3F. */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, RoundedBox } from "@react-three/drei";

/* ------------------------------------------------------------------------ */
/*  Maison d'illustration : 12 m × 8 m = 96 m² (1 unité = 1 mètre)           */
/*  Les surfaces affichées correspondent exactement aux pièces modélisées.   */
/* ------------------------------------------------------------------------ */

export type TourState = { progress: number };

const C = {
  ground: "#efe9df",
  slab: "#cdbfa8",
  wall: "#fbfaf7",
  wallEdge: "#d9d2c5",
  oak: "#c9a97f",
  oakDark: "#a8865c",
  tile: "#dcd8d1",
  bathTile: "#cfd9e1",
  bedroom: "#d9c8ad",
  rug: "#e6dfd3",
  sofa: "#6f8ba3",
  ink: "#1b2126",
  paper: "#fbfaf7",
  steel: "#3e5b74",
  mist: "#c9d3dc",
  glass: "#b9cbd9",
  zinc: "#8a98a5",
  wood: "#b48c5e",
  concrete: "#b3aa9b",
};

const WALL_H = 2.6;
const EXT = 0.22;
const INT = 0.1;

type Seg = [number, number, number, number]; // x1, z1, x2, z2 (horizontaux ou verticaux)

// Murs extérieurs (avec ouvertures pour portes et baies)
const EXT_WALLS: Seg[] = [
  [-6, -4, -4.5, -4], [-1.5, -4, 2.2, -4], [4.8, -4, 6, -4], // arrière
  [-6, 4, -5, 4], [-3, 4, 1.6, 4], [2.6, 4, 6, 4], // façade (porte d'entrée 1,6 → 2,6)
  [-6, -4, -6, -3], [-6, -0.5, -6, 4], // pignon gauche
  [6, -4, 6, 1.5], [6, 3, 6, 4], // pignon droit
];
// Baies vitrées
const GLASS: Seg[] = [
  [-4.5, -4, -1.5, -4], [2.2, -4, 4.8, -4], [-5, 4, -3, 4], [-6, -3, -6, -0.5], [6, 1.5, 6, 3],
];
// Cloisons
const INT_WALLS: Seg[] = [
  [-6, 1, -3.6, 1], [-2.8, 1, 0, 1], [0.7, 1, 1, 1], // séjour | chambre & SDB
  [-1.5, 1, -1.5, 4], // chambre | SDB
  [1, -4, 1, -2.6], [1, 0.5, 1, 4], // séjour | cuisine (ouverte) et SDB | entrée
  [2.8, 0.5, 6, 0.5], // cuisine | entrée & bureau
  [3, 0.5, 3, 1], [3, 1.8, 3, 4], // entrée | bureau
];

const ROOMS = [
  { name: "Séjour", area: "35,0 m²", x: [-6, 1], z: [-4, 1], color: C.oak },
  { name: "Cuisine", area: "22,5 m²", x: [1, 6], z: [-4, 0.5], color: C.tile },
  { name: "Chambre", area: "13,5 m²", x: [-6, -1.5], z: [1, 4], color: C.bedroom },
  { name: "Salle de bain", area: "7,5 m²", x: [-1.5, 1], z: [1, 4], color: C.bathTile },
  { name: "Entrée", area: "7,0 m²", x: [1, 3], z: [0.5, 4], color: C.tile },
  { name: "Bureau", area: "10,5 m²", x: [3, 6], z: [0.5, 4], color: C.oak },
] as const;

/* ---------- Outils ---------- */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
/** 0 → 1 entre a et a+f, 1 jusqu'à b-f, puis → 0 à b. */
const windowed = (p: number, a: number, b: number, f = 0.035) =>
  Math.min(smooth(clamp01((p - a) / f)), smooth(clamp01((b - p) / f)));

function segBox(seg: Seg, t: number) {
  const [x1, z1, x2, z2] = seg;
  const horizontal = z1 === z2;
  const len = horizontal ? Math.abs(x2 - x1) : Math.abs(z2 - z1);
  return {
    position: [(x1 + x2) / 2, 0, (z1 + z2) / 2] as [number, number, number],
    size: (horizontal ? [len + t, 1, t] : [t, 1, len + t]) as [number, number, number],
  };
}

/* ---------- Trajectoire de la caméra ---------- */
type Key = { p: number; pos: [number, number, number]; look: [number, number, number] };
const KEYS: Key[] = [
  { p: 0.0, pos: [21, 13.5, 24], look: [0, 0.6, 0] },
  { p: 0.14, pos: [0, 24, 8.5], look: [0, 0, 0.6] }, // vue en plan
  { p: 0.3, pos: [0, 22.5, 7.6], look: [0, 0, 0.4] },
  { p: 0.42, pos: [0.5, 1.7, 0.7], look: [-4.2, 0.7, -2.4] }, // séjour
  { p: 0.52, pos: [0.3, 1.7, 0.4], look: [-3.6, 0.8, -3.4] },
  { p: 0.62, pos: [0.1, 1.75, 0.25], look: [4.6, 0.8, -2.3] }, // cuisine
  { p: 0.7, pos: [0.3, 1.75, 0.1], look: [4.4, 0.85, -3.0] },
  { p: 0.76, pos: [6, 9, 9], look: [0, 0.5, 0] }, // on ressort par le haut
  { p: 0.84, pos: [17, 0.4, 7.5], look: [0, 0.9, 0] }, // coupe : sol et toit
  { p: 0.92, pos: [16, 0.9, 9.5], look: [0, 1, 0] },
  { p: 1.0, pos: [21, 13.5, 24], look: [0, 0.6, 0] },
];

function sampleCamera(p: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = smooth(clamp01((p - a.p) / (b.p - a.p)));
  outPos.set(
    THREE.MathUtils.lerp(a.pos[0], b.pos[0], t),
    THREE.MathUtils.lerp(a.pos[1], b.pos[1], t),
    THREE.MathUtils.lerp(a.pos[2], b.pos[2], t),
  );
  outLook.set(
    THREE.MathUtils.lerp(a.look[0], b.look[0], t),
    THREE.MathUtils.lerp(a.look[1], b.look[1], t),
    THREE.MathUtils.lerp(a.look[2], b.look[2], t),
  );
}

type Shared = { p: number; pointer: { x: number; y: number } };

function CameraRig({ shared }: { shared: React.RefObject<Shared> }) {
  const { camera, size } = useThree();
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const curLook = useRef(new THREE.Vector3(0, 0.6, 0));
  useFrame((_, delta) => {
    const s = shared.current;
    sampleCamera(s.p, pos, look);
    // Écrans étroits : on recule un peu pour garder la maison entière.
    const narrow = size.width / size.height < 0.8;
    if (narrow) {
      const outside = 1 - windowed(s.p, 0.34, 0.74, 0.06);
      pos.sub(look).multiplyScalar(1 + 0.95 * outside).add(look);
    }
    // Légère parallaxe à la souris
    pos.x += s.pointer.x * 0.6;
    pos.y += -s.pointer.y * 0.35;
    // Décalage de cadrage : la maison laisse la place au texte (à gauche sur ordinateur, en bas sur mobile).
    const end = 1 - smooth(clamp01((s.p - 0.94) / 0.05));
    const heroW = 1 - smooth(clamp01(s.p / 0.1));
    const cam = camera as THREE.PerspectiveCamera;
    if (narrow) {
      const fy = (0.12 + 0.1 * heroW) * end;
      cam.setViewOffset(size.width, size.height, 0, fy * size.height, size.width, size.height);
    } else {
      const fx = (0.12 + 0.12 * heroW) * end;
      cam.setViewOffset(size.width, size.height, -fx * size.width, 0, size.width, size.height);
    }
    const fov = 34 + 24 * windowed(s.p, 0.36, 0.74, 0.06);
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    const k = 1 - Math.exp(-delta * 6);
    camera.position.lerp(pos, k);
    curLook.current.lerp(look, k);
    camera.lookAt(curLook.current);
  });
  return null;
}

/* ---------- Étiquettes (HTML net, visibles sur une fenêtre de défilement) ---------- */
function Label({
  position,
  window: [a, b],
  shared,
  children,
}: {
  position: [number, number, number];
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

/* ---------- Ligne de cote ---------- */
function Dimension({
  from,
  to,
  label,
  shared,
  win,
}: {
  from: [number, number, number];
  to: [number, number, number];
  label: string;
  shared: React.RefObject<Shared>;
  win: [number, number];
}) {
  const ref = useRef<{ material: THREE.Material & { opacity: number } } | null>(null);
  const tick = (p: [number, number, number], dir: number): [number, number, number][] => {
    const horiz = from[2] === to[2];
    return horiz
      ? [[p[0], p[1], p[2] - 0.25 * dir], [p[0], p[1], p[2] + 0.25 * dir]]
      : [[p[0] - 0.25 * dir, p[1], p[2]], [p[0] + 0.25 * dir, p[1], p[2]]];
  };
  const t1 = useRef<typeof ref.current>(null);
  const t2 = useRef<typeof ref.current>(null);
  useFrame(() => {
    const o = windowed(shared.current.p, win[0], win[1]);
    for (const r of [ref, t1, t2]) if (r.current) r.current.material.opacity = o;
  });
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, from[1], (from[2] + to[2]) / 2];
  return (
    <group>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Line ref={ref as any} points={[from, to]} color={C.steel} lineWidth={1.2} transparent opacity={0} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Line ref={t1 as any} points={tick(from, 1)} color={C.steel} lineWidth={1.2} transparent opacity={0} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Line ref={t2 as any} points={tick(to, 1)} color={C.steel} lineWidth={1.2} transparent opacity={0} />
      <Label position={mid} window={win} shared={shared}>
        <span className="whitespace-nowrap rounded bg-steel px-1.5 py-0.5 font-mono text-[10px] text-paper">{label}</span>
      </Label>
    </group>
  );
}

/* ---------- Mobilier (volumes simples, style maquette) ---------- */
function Furniture() {
  const mat = (color: string, rough = 0.85) => <meshStandardMaterial color={color} roughness={rough} />;
  return (
    <group>
      {/* Séjour : tapis, canapé, table basse, meuble TV, table à manger */}
      <mesh position={[-3.6, 0.03, -1.6]} receiveShadow>
        <boxGeometry args={[3.2, 0.02, 2.2]} />
        {mat(C.rug, 1)}
      </mesh>
      <RoundedBox args={[2.6, 0.42, 0.95]} radius={0.08} position={[-3.6, 0.25, -0.35]} castShadow>
        {mat(C.sofa)}
      </RoundedBox>
      <RoundedBox args={[2.6, 0.5, 0.22]} radius={0.08} position={[-3.6, 0.6, 0.05]} castShadow>
        {mat(C.sofa)}
      </RoundedBox>
      <RoundedBox args={[1.1, 0.32, 0.6]} radius={0.05} position={[-3.6, 0.18, -1.7]} castShadow>
        {mat(C.ink, 0.5)}
      </RoundedBox>
      <mesh position={[-3.6, 0.25, -3.65]} castShadow>
        <boxGeometry args={[2.2, 0.5, 0.4]} />
        {mat(C.oakDark)}
      </mesh>
      <mesh position={[-3.6, 1.25, -3.86]}>
        <boxGeometry args={[1.5, 0.85, 0.04]} />
        {mat(C.ink, 0.3)}
      </mesh>
      <mesh position={[-0.6, 0.74, -2.4]} castShadow>
        <boxGeometry args={[1.8, 0.05, 0.95]} />
        {mat(C.oak)}
      </mesh>
      {[-1.3, 0.1].map((x) => (
        <mesh key={x} position={[x, 0.36, -2.4]} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.8]} />
          {mat(C.ink)}
        </mesh>
      ))}
      {[-1.1, -0.1].flatMap((x) =>
        [-3.1, -1.7].map((z) => (
          <RoundedBox key={`${x}${z}`} args={[0.45, 0.45, 0.45]} radius={0.06} position={[x, 0.23, z]} castShadow>
            {mat(C.paper)}
          </RoundedBox>
        )),
      )}
      {/* Plante */}
      <mesh position={[-5.5, 0.25, -3.5]} castShadow>
        <cylinderGeometry args={[0.2, 0.16, 0.5, 20]} />
        {mat(C.paper)}
      </mesh>
      <mesh position={[-5.5, 0.85, -3.5]} castShadow>
        <sphereGeometry args={[0.45, 20, 16]} />
        {mat("#7f9a7a")}
      </mesh>

      {/* Cuisine : linéaire le long du mur droit + îlot */}
      <mesh position={[5.65, 0.45, -2.1]} castShadow receiveShadow>
        <boxGeometry args={[0.65, 0.9, 3]} />
        {mat(C.ink, 0.6)}
      </mesh>
      <mesh position={[5.62, 0.92, -2.1]} castShadow>
        <boxGeometry args={[0.7, 0.04, 3.04]} />
        {mat(C.paper, 0.4)}
      </mesh>
      <mesh position={[5.75, 1.75, -2.1]}>
        <boxGeometry args={[0.38, 0.7, 3]} />
        {mat(C.ink, 0.6)}
      </mesh>
      <mesh position={[3.4, 0.45, -1.9]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.9, 1]} />
        {mat(C.paper, 0.5)}
      </mesh>
      <mesh position={[3.4, 0.92, -1.9]} castShadow>
        <boxGeometry args={[2.26, 0.05, 1.06]} />
        {mat(C.ink, 0.35)}
      </mesh>
      {[2.8, 3.4, 4.0].map((x) => (
        <mesh key={x} position={[x, 0.33, -1.15]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.66, 20]} />
          {mat(C.oakDark)}
        </mesh>
      ))}
      {[2.8, 3.4, 4.0].map((x) => (
        <mesh key={`l${x}`} position={[x, 1.9, -1.9]}>
          <cylinderGeometry args={[0.12, 0.08, 0.2, 20]} />
          <meshStandardMaterial color={C.ink} emissive="#f2e6cc" emissiveIntensity={0.15} />
        </mesh>
      ))}

      {/* Chambre */}
      <RoundedBox args={[1.7, 0.45, 2.1]} radius={0.06} position={[-4.2, 0.23, 2.9]} castShadow>
        {mat(C.paper)}
      </RoundedBox>
      <mesh position={[-4.2, 0.47, 2.35]} castShadow>
        <boxGeometry args={[1.72, 0.04, 0.9]} />
        {mat(C.steel)}
      </mesh>
      <mesh position={[-4.2, 0.6, 3.95]}>
        <boxGeometry args={[1.9, 1.0, 0.08]} />
        {mat(C.oakDark)}
      </mesh>
      {[-5.35, -3.05].map((x) => (
        <mesh key={x} position={[x, 0.25, 3.65]} castShadow>
          <boxGeometry args={[0.45, 0.5, 0.4]} />
          {mat(C.oak)}
        </mesh>
      ))}

      {/* Salle de bain */}
      <RoundedBox args={[0.8, 0.55, 1.7]} radius={0.12} position={[-1.0, 0.28, 3.0]} castShadow>
        {mat(C.paper, 0.3)}
      </RoundedBox>
      <mesh position={[0.6, 0.45, 2.6]} castShadow>
        <boxGeometry args={[0.5, 0.9, 1.0]} />
        {mat(C.paper, 0.3)}
      </mesh>

      {/* Bureau */}
      <mesh position={[4.5, 0.74, 3.5]} castShadow>
        <boxGeometry args={[1.6, 0.05, 0.7]} />
        {mat(C.oak)}
      </mesh>
      {[3.8, 5.2].map((x) => (
        <mesh key={x} position={[x, 0.36, 3.5]}>
          <boxGeometry args={[0.05, 0.72, 0.65]} />
          {mat(C.ink)}
        </mesh>
      ))}
      <RoundedBox args={[0.55, 0.5, 0.55]} radius={0.08} position={[4.5, 0.3, 2.8]} castShadow>
        {mat(C.sofa)}
      </RoundedBox>

      {/* Entrée : console */}
      <mesh position={[1.25, 0.4, 2.6]} castShadow>
        <boxGeometry args={[0.35, 0.8, 1.2]} />
        {mat(C.oakDark)}
      </mesh>
    </group>
  );
}

/* ---------- La maison ---------- */
function House({ shared }: { shared: React.RefObject<Shared> }) {
  const roof = useRef<THREE.Group>(null);
  const roofMat = useRef<THREE.MeshStandardMaterial>(null);
  const truss = useRef<THREE.Group>(null);
  const ground = useRef<THREE.MeshStandardMaterial>(null);
  const walls = useRef<THREE.Group>(null);

  const roofGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-4.45, 0);
    shape.lineTo(4.45, 0);
    shape.lineTo(0, 2.4);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 12.5, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    g.translate(-6.25, 0, 0);
    return g;
  }, []);

  useFrame(() => {
    const p = shared.current.p;
    // Toit plein : présent à l'arrivée et à la fin, soulevé pendant la visite.
    const lift = Math.min(smooth(clamp01((p - 0.04) / 0.1)), 1 - smooth(clamp01((p - 0.93) / 0.06)));
    if (roof.current) {
      roof.current.position.y = WALL_H + lift * 5;
      roof.current.visible = lift < 0.99;
    }
    if (roofMat.current) roofMat.current.opacity = 1 - lift;
    // Charpente apparente pendant la vue en coupe
    const tv = windowed(p, 0.78, 0.95, 0.04);
    if (truss.current) {
      truss.current.visible = tv > 0.01;
      truss.current.position.y = WALL_H + (1 - tv) * 1.5;
      truss.current.scale.setScalar(0.98 + tv * 0.02);
    }
    // Sol semi-transparent pour montrer les fondations
    const gv = windowed(p, 0.77, 0.95, 0.04);
    if (ground.current) ground.current.opacity = 1 - gv * 0.82;
    // Murs : légèrement abaissés en vue en plan, pour lire le dessin
    if (walls.current) walls.current.scale.y = 1 - windowed(p, 0.1, 0.36, 0.06) * 0.55;
  });

  const extWalls = EXT_WALLS.map((s) => segBox(s, EXT));
  const intWalls = INT_WALLS.map((s) => segBox(s, INT));
  const glass = GLASS.map((s) => segBox(s, 0.05));

  return (
    <group>
      {/* Terrain */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial ref={ground} color={C.ground} roughness={1} transparent side={THREE.DoubleSide} />
      </mesh>
      <gridHelper args={[60, 60, "#d9d1c3", "#e3dccf"]} position={[0, 0.002, 0]} />

      {/* Dalle et fondations (sous le sol) */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[12.4, 0.24, 8.4]} />
        <meshStandardMaterial color={C.slab} roughness={1} />
      </mesh>
      {EXT_WALLS.concat([[-4.5, -4, -1.5, -4], [2.2, -4, 4.8, -4], [-5, 4, -3, 4], [1.6, 4, 2.6, 4], [-6, -3, -6, -0.5], [6, 1.5, 6, 3]]).map((s, i) => {
        const b = segBox(s, 0.55);
        return (
          <mesh key={i} position={[b.position[0], -0.65, b.position[2]]}>
            <boxGeometry args={[b.size[0], 0.8, b.size[2]]} />
            <meshStandardMaterial color={C.concrete} roughness={1} />
          </mesh>
        );
      })}

      {/* Sols par pièce */}
      {ROOMS.map((r) => (
        <mesh key={r.name} position={[(r.x[0] + r.x[1]) / 2, 0.012, (r.z[0] + r.z[1]) / 2]} receiveShadow>
          <boxGeometry args={[r.x[1] - r.x[0], 0.02, r.z[1] - r.z[0]]} />
          <meshStandardMaterial color={r.color} roughness={0.9} />
        </mesh>
      ))}

      {/* Murs */}
      <group ref={walls}>
        {extWalls.map((b, i) => (
          <mesh key={`e${i}`} position={[b.position[0], WALL_H / 2, b.position[2]]} scale={[1, WALL_H, 1]} castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color={C.wall} roughness={0.95} />
          </mesh>
        ))}
        {intWalls.map((b, i) => (
          <mesh key={`i${i}`} position={[b.position[0], WALL_H / 2, b.position[2]]} scale={[1, WALL_H, 1]} castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color={C.wall} roughness={0.95} />
          </mesh>
        ))}
        {glass.map((b, i) => (
          <group key={`g${i}`}>
            <mesh position={[b.position[0], 0.25, b.position[2]]} scale={[1, 0.5, 1]}>
              <boxGeometry args={[b.size[0] + (b.size[0] > 0.1 ? 0 : 0.15), 1, b.size[2] + (b.size[2] > 0.1 ? 0 : 0.15)]} />
              <meshStandardMaterial color={C.wallEdge} roughness={0.95} />
            </mesh>
            <mesh position={[b.position[0], 1.45, b.position[2]]} scale={[1, 1.9, 1]}>
              <boxGeometry args={b.size} />
              <meshStandardMaterial color={C.glass} transparent opacity={0.35} roughness={0.1} metalness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      <Furniture />


      {/* Toit (zinc) */}
      <group ref={roof} position={[0, WALL_H, 0]}>
        <mesh geometry={roofGeom} castShadow>
          <meshStandardMaterial ref={roofMat} color={C.zinc} roughness={0.45} metalness={0.3} transparent />
        </mesh>
      </group>

      {/* Charpente */}
      <group ref={truss} visible={false}>
        {Array.from({ length: 9 }, (_, i) => -6 + i * 1.5).map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.06, 0]}>
              <boxGeometry args={[0.1, 0.12, 8.7]} />
              <meshStandardMaterial color={C.wood} />
            </mesh>
            {[-1, 1].map((d) => (
              <mesh key={d} position={[0, 1.2, d * 2.2]} rotation-x={d * Math.atan2(2.4, 4.45)}>
                <boxGeometry args={[0.1, 0.12, 5.05]} />
                <meshStandardMaterial color={C.wood} />
              </mesh>
            ))}
            <mesh position={[0, 1.2, 0]}>
              <boxGeometry args={[0.1, 2.4, 0.1]} />
              <meshStandardMaterial color={C.wood} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 2.4, 0]}>
          <boxGeometry args={[12.2, 0.14, 0.14]} />
          <meshStandardMaterial color={C.wood} />
        </mesh>
      </group>

      {/* ------- Étiquettes : plan ------- */}
      {ROOMS.map((r) => (
        <Label
          key={r.name}
          position={[(r.x[0] + r.x[1]) / 2, 0.4, (r.z[0] + r.z[1]) / 2]}
          window={[0.15, 0.34]}
          shared={shared}
        >
          <div className="whitespace-nowrap rounded-2xl border border-ink/10 bg-paper/85 px-3 py-1.5 text-center shadow-[0_10px_24px_-14px_rgba(15,18,21,0.5)] backdrop-blur-md">
            <p className="font-serif text-[14px] leading-none text-ink italic sm:text-[17px]">{r.name}</p>
            <p className="mt-1 font-mono text-[9px] tracking-[0.12em] text-steel sm:text-[10px]">{r.area}</p>
          </div>
        </Label>
      ))}
      <Dimension from={[-6, 0.3, 4.9]} to={[6, 0.3, 4.9]} label="12,00 m" shared={shared} win={[0.17, 0.34]} />
      <Dimension from={[6.9, 0.3, -4]} to={[6.9, 0.3, 4]} label="8,00 m" shared={shared} win={[0.18, 0.34]} />
      <Dimension from={[-6, 0.3, -4.9]} to={[1, 0.3, -4.9]} label="7,00 m" shared={shared} win={[0.19, 0.34]} />
      <Label position={[0, 0.4, -5.9]} window={[0.2, 0.34]} shared={shared}>
        <Chip title="Surface habitable" value="96 m²" />
      </Label>

      {/* ------- Étiquettes : séjour ------- */}
      <Label position={[-3.6, 0.1, -2.6]} window={[0.4, 0.56]} shared={shared}>
        <Chip title="Parquet chêne" value="35 m²" swatch={C.oak} />
      </Label>
      <Label position={[-5.95, 1.8, -1.8]} window={[0.41, 0.56]} shared={shared}>
        <Chip title="Baie vitrée" value="2,50 m" />
      </Label>
      <Label position={[-2.4, 1.6, -3.9]} window={[0.42, 0.56]} shared={shared}>
        <Chip title="Enduit à la chaux" value="Sable" swatch="#e6dfd3" />
      </Label>
      <Label position={[-2.1, 0.95, -0.2]} window={[0.43, 0.56]} shared={shared}>
        <Chip title="Canapé" value="2,60 × 0,95 m" swatch={C.sofa} />
      </Label>
      <Label position={[-5.2, 2.0, -3.9]} window={[0.44, 0.56]} shared={shared}>
        <Chip title="Hauteur sous plafond" value="2,60 m" />
      </Label>

      {/* ------- Étiquettes : cuisine ------- */}
      <Label position={[3.4, 1.15, -1.9]} window={[0.6, 0.74]} shared={shared}>
        <Chip title="Îlot" value="2,20 × 1,00 m" swatch={C.paper} />
      </Label>
      <Label position={[5.4, 1.15, -3.2]} window={[0.61, 0.74]} shared={shared}>
        <Chip title="Plan de travail" value="3,00 m" swatch={C.ink} />
      </Label>
      <Label position={[5.6, 2.35, -1.2]} window={[0.62, 0.74]} shared={shared}>
        <Chip title="Ventilation" value="extraction cuisine" />
      </Label>
      <Label position={[2.5, 0.1, -3.2]} window={[0.63, 0.74]} shared={shared}>
        <Chip title="Grès cérame" value="22,5 m²" swatch={C.tile} />
      </Label>

      {/* ------- Étiquettes : du sol au toit ------- */}
      <Label position={[2, 5.4, 0]} window={[0.8, 0.95]} shared={shared}>
        <Chip title="Charpente" value="fermettes · faîtage" swatch={C.wood} />
      </Label>
      <Label position={[6.2, 1.6, 0.5]} window={[0.81, 0.95]} shared={shared}>
        <Chip title="Murs" value="fissures · humidité" />
      </Label>
      <Label position={[6.3, -0.15, 3.4]} window={[0.82, 0.95]} shared={shared}>
        <Chip title="Dalle sur terre-plein" swatch={C.slab} />
      </Label>
      <Label position={[6.3, -0.9, 0.6]} window={[0.83, 0.95]} shared={shared}>
        <Chip title="Fondations" value="semelles filantes" swatch={C.concrete} />
      </Label>
    </group>
  );
}

export default function HouseScene({ tour }: { tour: React.RefObject<TourState> }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const shared = useRef<Shared>({ p: 0, pointer: { x: 0, y: 0 } });
  const [visible, setVisible] = useState(true);

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
    <div ref={wrapper} className="absolute inset-0">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        shadows
        camera={{ position: [15, 10.5, 17], fov: 34, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Progress tour={tour} shared={shared} />
        <fog attach="fog" args={[C.ground, 60, 140]} />
        <hemisphereLight args={["#ffffff", "#d8cfbf", 1.15]} />
        <directionalLight
          position={[9, 16, 7]}
          intensity={1.7}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[-8, 5, -6]} intensity={0.45} color="#c9d3dc" />
        <CameraRig shared={shared} />
        <House shared={shared} />
      </Canvas>
    </div>
  );
}

/** Lisse la progression de défilement (évite les à-coups). */
function Progress({ tour, shared }: { tour: React.RefObject<TourState>; shared: React.RefObject<Shared> }) {
  useFrame((_, delta) => {
    const target = tour.current.progress;
    const s = shared.current;
    s.p += (target - s.p) * (1 - Math.exp(-delta * 7));
    if (Math.abs(target - s.p) < 0.0005) s.p = target;
  });
  return null;
}
