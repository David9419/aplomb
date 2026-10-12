"use client";
/* eslint-disable react-hooks/immutability -- uniformes de shader mis à jour image par image (useFrame). */

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import { makeTexture } from "@/components/three/textures";

/* Générateur pseudo-aléatoire reproductible (la scène est identique à chaque visite). */
function rng(seed: number) {
  let s = seed % 2147483647;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Rect = [number, number, number, number]; // x0, x1, z0, z1

/* ========================================================================== */
/*  Brins d'herbe : instanciés, effilés, ondulant au vent, reçoivent les ombres */
/* ========================================================================== */

function grassMaterial(tipLight: number) {
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.85, side: THREE.DoubleSide });
  const uniforms = { uTime: { value: 0 } };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;\nvarying float vT;")
      .replace("#include <beginnormal_vertex>", "vec3 objectNormal = vec3(0.0, 0.0, 1.0);\n#ifdef USE_TANGENT\nvec3 objectTangent = vec3(tangent.xyz);\n#endif")
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3(position);
        float t = uv.y;
        vT = t;
        transformed.x *= (1.0 - t * 0.9);
        vec4 ip = instanceMatrix[3];
        float w = sin(uTime * 1.6 + ip.x * 0.35 + ip.z * 0.27) * 0.6 + sin(uTime * 2.7 + ip.x * 0.9) * 0.25;
        transformed.z += w * t * t * 0.35;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vT;")
      .replace("#include <color_fragment>", `#include <color_fragment>\ndiffuseColor.rgb *= mix(0.42, ${tipLight.toFixed(2)}, vT);`);
  };
  return { mat, uniforms };
}

function bladeGeometry() {
  const g = new THREE.PlaneGeometry(1, 1, 1, 4);
  g.translate(0, 0.5, 0);
  return g;
}

/** Pelouse vivante : des dizaines de milliers de brins dans les zones indiquées. */
export function GrassField({ zones, count, y = 0 }: { zones: Rect[]; count: number; y?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { mat, uniforms } = useMemo(() => grassMaterial(1.15), []);
  const geo = useMemo(() => bladeGeometry(), []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const r = rng(7);
    const areas = zones.map(([x0, x1, z0, z1]) => (x1 - x0) * (z1 - z0));
    const total = areas.reduce((a, b) => a + b, 0);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const c = new THREE.Color();
    const greens = ["#4f7a2c", "#5d8a33", "#6b963b", "#46702a", "#7a9a45"];
    for (let i = 0; i < count; i++) {
      let pick = r() * total;
      let zi = 0;
      while (pick > areas[zi] && zi < zones.length - 1) pick -= areas[zi++];
      const [x0, x1, z0, z1] = zones[zi];
      const x = x0 + r() * (x1 - x0);
      const z = z0 + r() * (z1 - z0);
      e.set((r() - 0.5) * 0.4, r() * Math.PI, (r() - 0.5) * 0.4);
      q.setFromEuler(e);
      const h = 0.14 + r() * 0.2;
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(0.035 + r() * 0.03, h, 1));
      mesh.setMatrixAt(i, m);
      c.set(greens[Math.floor(r() * greens.length)]);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [zones, count, y]);
  useFrame((state) => (uniforms.uTime.value = state.clock.elapsedTime));
  return <instancedMesh ref={ref} args={[geo, mat, count]} receiveShadow frustumCulled={false} />;
}

/** Touffes de graminées décoratives (comme dans les massifs de gravier). */
export function OrnamentalGrasses({ spots }: { spots: [number, number, number][] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { mat, uniforms } = useMemo(() => grassMaterial(1.35), []);
  const geo = useMemo(() => bladeGeometry(), []);
  const per = 70;
  const count = spots.length * per;
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const r = rng(31);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const c = new THREE.Color();
    let i = 0;
    for (const [sx, sz, size] of spots) {
      const straw = r() > 0.4;
      for (let k = 0; k < per; k++) {
        const a = r() * Math.PI * 2;
        const rad = r() * 0.12 * size;
        const tilt = 0.15 + r() * 0.55;
        e.set(Math.cos(a) * tilt, a, Math.sin(a) * tilt);
        q.setFromEuler(e);
        m.compose(new THREE.Vector3(sx + Math.cos(a) * rad, 0, sz + Math.sin(a) * rad), q, new THREE.Vector3(0.03, (0.55 + r() * 0.5) * size, 1));
        mesh.setMatrixAt(i, m);
        c.set(straw ? (r() > 0.5 ? "#b9a27a" : "#a89068") : r() > 0.5 ? "#6f8a4e" : "#87995c");
        mesh.setColorAt(i, c);
        i++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [spots]);
  useFrame((state) => (uniforms.uTime.value = state.clock.elapsedTime));
  return <instancedMesh ref={ref} args={[geo, mat, count]} castShadow receiveShadow frustumCulled={false} />;
}

/* ========================================================================== */
/*  Arbres et arbustes : troncs texturés + milliers de « cartes » de feuillage  */
/* ========================================================================== */

export type TreeDef = { p: [number, number, number]; h: number; crown: number; seed: number };
export type ShrubDef = { p: [number, number, number]; r: number; h: number; seed: number };

export function Foliage({ trees, shrubs }: { trees: TreeDef[]; shrubs: ShrubDef[] }) {
  const leafRef = useRef<THREE.InstancedMesh>(null);
  const leafTex = useMemo(() => makeTexture("leaves"), []);
  const barkMat = useMemo(() => new THREE.MeshStandardMaterial({ map: makeTexture("bark", 1, 3), roughness: 1, color: "#d8cfc4" }), []);
  const leafMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: leafTex, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.8 }),
    [leafTex],
  );
  const depthMat = useMemo(
    () => new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: leafTex, alphaTest: 0.45 }),
    [leafTex],
  );
  const cards = useMemo(() => {
    const out: { pos: THREE.Vector3; rot: THREE.Euler; s: number; tint: string }[] = [];
    const tints = ["#ffffff", "#e6f0d8", "#cfdcbc", "#f2f6e6"];
    for (const t of trees) {
      const r = rng(t.seed);
      const clusters = 6;
      for (let c = 0; c < clusters; c++) {
        const a = (c / clusters) * Math.PI * 2 + r();
        const cx = t.p[0] + Math.cos(a) * t.crown * 0.45 * r();
        const cz = t.p[2] + Math.sin(a) * t.crown * 0.45 * r();
        const cy = t.p[1] + t.h * (0.62 + r() * 0.3);
        const cr = t.crown * (0.45 + r() * 0.25);
        for (let k = 0; k < 75; k++) {
          const u = r() * 2 - 1;
          const th = r() * Math.PI * 2;
          const rad = cr * Math.cbrt(r());
          const sq = Math.sqrt(1 - u * u);
          out.push({
            pos: new THREE.Vector3(cx + rad * sq * Math.cos(th), cy + rad * u * 0.7, cz + rad * sq * Math.sin(th)),
            rot: new THREE.Euler(r() * Math.PI, r() * Math.PI, r() * Math.PI),
            s: 0.9 + r() * 0.7,
            tint: tints[Math.floor(r() * tints.length)],
          });
        }
      }
    }
    for (const sh of shrubs) {
      const r = rng(sh.seed);
      const n = Math.round(60 * sh.r * sh.r + 20);
      for (let k = 0; k < n; k++) {
        const u = r();
        const th = r() * Math.PI * 2;
        const rad = sh.r * Math.sqrt(r());
        out.push({
          pos: new THREE.Vector3(sh.p[0] + rad * Math.cos(th), sh.p[1] + u * sh.h, sh.p[2] + rad * Math.sin(th)),
          rot: new THREE.Euler(r() * Math.PI, r() * Math.PI, r() * Math.PI),
          s: 0.45 + r() * 0.35,
          tint: tints[Math.floor(r() * tints.length)],
        });
      }
    }
    return out;
  }, [trees, shrubs]);

  useLayoutEffect(() => {
    const mesh = leafRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const c = new THREE.Color();
    cards.forEach((cd, i) => {
      q.setFromEuler(cd.rot);
      m.compose(cd.pos, q, new THREE.Vector3(cd.s, cd.s, cd.s));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(cd.tint));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [cards]);

  return (
    <group>
      {trees.map((t) => {
        const r = rng(t.seed + 5);
        return (
          <group key={t.seed} position={t.p}>
            <mesh position={[0, t.h * 0.35, 0]} material={barkMat} castShadow>
              <cylinderGeometry args={[0.12, 0.22, t.h * 0.7, 10]} />
            </mesh>
            {Array.from({ length: 4 }, (_, i) => {
              const a = (i / 4) * Math.PI * 2 + r();
              return (
                <mesh
                  key={i}
                  position={[Math.cos(a) * 0.45, t.h * 0.62, Math.sin(a) * 0.45]}
                  rotation={[Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7]}
                  material={barkMat}
                  castShadow
                >
                  <cylinderGeometry args={[0.05, 0.09, t.h * 0.4, 7]} />
                </mesh>
              );
            })}
          </group>
        );
      })}
      <instancedMesh
        ref={leafRef}
        args={[undefined, leafMat, cards.length]}
        customDepthMaterial={depthMat}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
    </group>
  );
}
