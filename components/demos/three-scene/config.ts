export type GeometryKind =
  | "icosahedron"
  | "torusKnot"
  | "dodecahedron"
  | "octahedron"
  | "torus"
  | "capsule"
  | "box";

export type MaterialKind = "glow" | "metal" | "glass";

export type OrbitConfig = {
  radius: number;
  speed: number;
  phase: number;
  baseY: number;
  tilt: number;
  spin: number;
};

export type SceneObjectConfig = {
  id: string;
  geometry: GeometryKind;
  geometryLabel: string;
  material: MaterialKind;
  color: string;
  accent: string;
  size: number;
  orbit?: OrbitConfig;
};

export type SceneObjectLabel = {
  name: string;
  description: string;
};

export type SceneThemeName = "dark" | "light";

export const sceneObjects: SceneObjectConfig[] = [
  {
    id: "core",
    geometry: "icosahedron",
    geometryLabel: "IcosahedronGeometry(1.05, 1)",
    material: "glow",
    color: "#22d3ee",
    accent: "#a5f3fc",
    size: 1.05,
  },
  {
    id: "torus-knot",
    geometry: "torusKnot",
    geometryLabel: "TorusKnotGeometry(0.32, 0.11, 128, 24)",
    material: "glow",
    color: "#c084fc",
    accent: "#e9d5ff",
    size: 0.32,
    orbit: { radius: 2.7, speed: 0.22, phase: 0, baseY: 0.35, tilt: 0.7, spin: 0.5 },
  },
  {
    id: "dodecahedron",
    geometry: "dodecahedron",
    geometryLabel: "DodecahedronGeometry(0.42)",
    material: "metal",
    color: "#38bdf8",
    accent: "#7dd3fc",
    size: 0.42,
    orbit: { radius: 3.5, speed: -0.14, phase: 1.2, baseY: -0.25, tilt: 1.1, spin: 0.4 },
  },
  {
    id: "octahedron",
    geometry: "octahedron",
    geometryLabel: "OctahedronGeometry(0.44)",
    material: "metal",
    color: "#34d399",
    accent: "#6ee7b7",
    size: 0.44,
    orbit: { radius: 2.9, speed: 0.18, phase: 2.4, baseY: 0.75, tilt: 0.45, spin: -0.6 },
  },
  {
    id: "torus",
    geometry: "torus",
    geometryLabel: "TorusGeometry(0.4, 0.14, 24, 64)",
    material: "metal",
    color: "#fbbf24",
    accent: "#fde68a",
    size: 0.4,
    orbit: { radius: 3.9, speed: 0.1, phase: 3.6, baseY: -0.6, tilt: 0.9, spin: 0.35 },
  },
  {
    id: "capsule",
    geometry: "capsule",
    geometryLabel: "CapsuleGeometry(0.22, 0.36, 8, 24)",
    material: "glass",
    color: "#a5b4fc",
    accent: "#c7d2fe",
    size: 0.22,
    orbit: { radius: 3.2, speed: -0.19, phase: 4.8, baseY: 0.5, tilt: 1.35, spin: 0.3 },
  },
  {
    id: "box",
    geometry: "box",
    geometryLabel: "BoxGeometry(0.5, 0.5, 0.5, 2, 2, 2)",
    material: "metal",
    color: "#fb7185",
    accent: "#fda4af",
    size: 0.5,
    orbit: { radius: 2.4, speed: 0.26, phase: 5.9, baseY: -0.4, tilt: 0.6, spin: 0.7 },
  },
];
