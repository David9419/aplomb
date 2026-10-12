"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Edges, Html } from "@react-three/drei";

import { onReady } from "@/lib/ready";

/* Couleurs de la maquette (reprennent la palette du site) */
const C = {
  paper: "#fbfaf7",
  bone: "#efe9df",
  sand: "#ddd3c3",
  sand2: "#cfc3ae",
  mist: "#b9c8d6",
  steel: "#3e5b74",
  ink: "#0f1215",
  zinc: "#8a98a5",
};

const LEVELS = 3;
const LEVEL_H = 1.05;
const W = 4.2;
const D = 3;

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type Shared = {
  pointer: { x: number; y: number };
  scroll: number;
  readyAt: number | null;
};

/* ---------- Un étage : dalle, poteaux, façades vitrées, cloison ---------- */
function Level({ index, shared }: { index: number; shared: React.RefObject<Shared> }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const s = shared.current;
    const t = s.readyAt === null ? 0 : state.clock.elapsedTime - s.readyAt;
    // Assemblage : chaque étage descend en place, l'un après l'autre.
    const a = easeOutExpo(clamp01((t - 0.15 - index * 0.22) / 1.3));
    // Vue éclatée : les étages s'écartent quand on fait défiler la page.
    const explode = s.scroll * 0.5;
    const target = 0.3 + index * (LEVEL_H + explode);
    g.position.y = target + (1 - a) * (5 + index * 1.4);
    g.rotation.y = (1 - a) * 0.5 * (index % 2 ? 1 : -1);
    g.visible = a > 0.001;
  });

  const cols = [
    [-W / 2 + 0.12, -D / 2 + 0.12],
    [W / 2 - 0.12, -D / 2 + 0.12],
    [-W / 2 + 0.12, D / 2 - 0.12],
    [W / 2 - 0.12, D / 2 - 0.12],
    [0, -D / 2 + 0.12],
    [0, D / 2 - 0.12],
  ];
  const mullions = [-1.4, -0.7, 0, 0.7, 1.4];

  return (
    <group ref={ref}>
      {/* Dalle */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, 0.14, D]} />
        <meshStandardMaterial color={C.paper} roughness={0.85} />
        <Edges color={C.steel} threshold={20} />
      </mesh>
      {/* Poteaux */}
      {cols.map(([x, z], i) => (
        <mesh key={i} position={[x, LEVEL_H / 2, z]} castShadow>
          <boxGeometry args={[0.13, LEVEL_H - 0.14, 0.13]} />
          <meshStandardMaterial color={C.sand} roughness={0.9} />
        </mesh>
      ))}
      {/* Façade vitrée avant + menuiseries */}
      <mesh position={[0, LEVEL_H / 2, D / 2 - 0.08]}>
        <boxGeometry args={[W - 0.3, LEVEL_H - 0.16, 0.03]} />
        <meshStandardMaterial color={C.mist} transparent opacity={0.38} roughness={0.15} metalness={0.1} />
      </mesh>
      {mullions.map((x) => (
        <mesh key={x} position={[x, LEVEL_H / 2, D / 2 - 0.06]}>
          <boxGeometry args={[0.025, LEVEL_H - 0.16, 0.04]} />
          <meshStandardMaterial color={C.steel} />
        </mesh>
      ))}
      {/* Façade latérale pleine, percée d'une baie */}
      <mesh position={[W / 2 - 0.06, LEVEL_H / 2, -0.55]}>
        <boxGeometry args={[0.08, LEVEL_H - 0.16, D - 1.3]} />
        <meshStandardMaterial color={C.bone} roughness={0.95} />
        <Edges color={C.sand2} threshold={20} />
      </mesh>
      <mesh position={[W / 2 - 0.05, LEVEL_H / 2, D / 2 - 0.55]}>
        <boxGeometry args={[0.03, LEVEL_H - 0.4, 0.75]} />
        <meshStandardMaterial color={C.mist} transparent opacity={0.45} roughness={0.15} />
      </mesh>
      {/* Cloison intérieure */}
      <mesh position={[-0.6 + index * 0.35, LEVEL_H / 2, -0.2]}>
        <boxGeometry args={[0.06, LEVEL_H - 0.16, 1.5]} />
        <meshStandardMaterial color={C.sand} roughness={0.95} />
      </mesh>
    </group>
  );
}

/* ---------- Toiture à deux pans ---------- */
function Roof({ shared }: { shared: React.RefObject<Shared> }) {
  const ref = useRef<THREE.Group>(null);
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-W / 2 - 0.12, 0);
    shape.lineTo(W / 2 + 0.12, 0);
    shape.lineTo(0, 1.15);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: D + 0.24, bevelEnabled: false });
    g.translate(0, 0, -(D + 0.24) / 2);
    return g;
  }, []);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const s = shared.current;
    const t = s.readyAt === null ? 0 : state.clock.elapsedTime - s.readyAt;
    const a = easeOutExpo(clamp01((t - 0.15 - LEVELS * 0.22) / 1.3));
    const explode = s.scroll * 0.5;
    const target = 0.3 + LEVELS * (LEVEL_H + explode) + 0.07;
    g.position.y = target + (1 - a) * 8;
    g.visible = a > 0.001;
  });

  return (
    <group ref={ref}>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color={C.zinc} roughness={0.45} metalness={0.35} />
        <Edges color={C.steel} threshold={20} />
      </mesh>
      <Html position={[0.2, 1.35, 0]} center distanceFactor={9} zIndexRange={[10, 0]}>
        <Chip label="Toiture" />
      </Html>
    </group>
  );
}

/* ---------- Fil à plomb : un pendule amorti, sensible à la souris ---------- */
function PlumbBob({ shared }: { shared: React.RefObject<Shared> }) {
  const pivot = useRef<THREE.Group>(null);
  const state = useRef({ ax: 0.35, vx: 0, az: -0.2, vz: 0, lastPx: 0, lastPy: 0 });
  const L = 2.7;

  const bobGeometry = useMemo(() => {
    const pts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.08, 0.02),
      new THREE.Vector2(0.11, 0.1),
      new THREE.Vector2(0.17, 0.2),
      new THREE.Vector2(0.16, 0.34),
      new THREE.Vector2(0.06, 0.62),
      new THREE.Vector2(0.03, 0.7),
      new THREE.Vector2(0, 0.72),
    ];
    return new THREE.LatheGeometry(pts, 40);
  }, []);

  useFrame((_, delta) => {
    const g = pivot.current;
    if (!g) return;
    const dt = Math.min(delta, 1 / 30);
    const s = shared.current;
    const p = state.current;
    // La souris donne de petites impulsions au pendule.
    const dpx = s.pointer.x - p.lastPx;
    const dpy = s.pointer.y - p.lastPy;
    p.lastPx = s.pointer.x;
    p.lastPy = s.pointer.y;
    const k = 9.81 / L;
    p.vx += (-k * Math.sin(p.ax) - 0.55 * p.vx) * dt - dpx * 0.9;
    p.vz += (-k * Math.sin(p.az) - 0.55 * p.vz) * dt + dpy * 0.6;
    p.ax += p.vx * dt;
    p.az += p.vz * dt;
    g.rotation.z = p.ax;
    g.rotation.x = p.az;
  });

  return (
    <group position={[-W / 2 - 0.55, 0.3 + LEVELS * LEVEL_H + 1.2, D / 2 + 0.95]}>
      {/* Potence */}
      <mesh position={[0.45, 0, 0]}>
        <boxGeometry args={[0.9, 0.05, 0.05]} />
        <meshStandardMaterial color={C.ink} />
      </mesh>
      <group ref={pivot}>
        <mesh position={[0, -L / 2, 0]}>
          <cylinderGeometry args={[0.008, 0.008, L, 6]} />
          <meshStandardMaterial color={C.ink} />
        </mesh>
        <mesh geometry={bobGeometry} position={[0, -L - 0.72, 0]} castShadow>
          <meshStandardMaterial color={C.steel} metalness={0.75} roughness={0.28} />
        </mesh>
      </group>
    </group>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none flex select-none items-center gap-1.5 whitespace-nowrap rounded-full border border-ink/10 bg-paper/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink shadow-[0_8px_20px_-10px_rgba(15,18,21,0.4)] backdrop-blur">
      <span className="size-1.5 rounded-full bg-steel" />
      {label}
    </span>
  );
}

/* ---------- Socle, rotation lente, parallaxe ---------- */
function Model({ shared }: { shared: React.RefObject<Shared> }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const s = shared.current;
    const t = state.clock.elapsedTime;
    const targetY = -0.62 + Math.sin(t * 0.18) * 0.22 + s.pointer.x * 0.35 + s.scroll * 0.6;
    const targetX = 0.04 + s.pointer.y * 0.08;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 3, delta);
  });

  return (
    <group ref={group} position={[0, -1.7, 0]}>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[W + 1.1, 0.3, D + 1]} />
        <meshStandardMaterial color={C.sand} roughness={1} />
        <Edges color={C.sand2} threshold={20} />
      </mesh>
      {Array.from({ length: LEVELS }, (_, i) => (
        <Level key={i} index={i} shared={shared} />
      ))}
      <Roof shared={shared} />
      <PlumbBob shared={shared} />
      <Html position={[-W / 2 + 0.1, 1.1, D / 2]} center distanceFactor={9} zIndexRange={[10, 0]}>
        <Chip label="Structure" />
      </Html>
      <Html position={[W / 2, 2.1, D / 2 - 0.4]} center distanceFactor={9} zIndexRange={[10, 0]}>
        <Chip label="Enveloppe" />
      </Html>
    </group>
  );
}

export default function BuildingScene() {
  const wrapper = useRef<HTMLDivElement>(null);
  const shared = useRef<Shared>({ pointer: { x: 0, y: 0 }, scroll: 0, readyAt: null });
  const [visible, setVisible] = useState(true);
  const clockRef = useRef<THREE.Clock | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      shared.current.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      shared.current.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      shared.current.scroll = clamp01(window.scrollY / (window.innerHeight * 0.9));
    };
    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    if (wrapper.current) io.observe(wrapper.current);
    const off = onReady(() => {
      shared.current.readyAt = clockRef.current?.elapsedTime ?? 0;
    });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      off();
    };
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        shadows
        camera={{ position: [10.5, 6.6, 13], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ clock, camera }) => {
          clockRef.current = clock;
          camera.lookAt(0, 0.7, 0);
          // Si l'écran d'ouverture est déjà parti, on démarre tout de suite.
          if (document.documentElement.hasAttribute("data-ready") && shared.current.readyAt === null) {
            shared.current.readyAt = clock.elapsedTime;
          }
        }}
      >
        <hemisphereLight args={["#ffffff", "#d8cfbf", 1.1]} />
        <directionalLight
          position={[6, 11, 5]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
        />
        <directionalLight position={[-6, 3, -4]} intensity={0.5} color="#c9d3dc" />
        <Model shared={shared} />
        <ContactShadows position={[0, -1.85, 0]} opacity={0.32} scale={14} blur={2.6} far={6} color="#0f1215" />
      </Canvas>
    </div>
  );
}
