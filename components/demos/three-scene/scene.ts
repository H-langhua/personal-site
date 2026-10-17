import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CircleGeometry,
  Clock,
  Color,
  DirectionalLight,
  DodecahedronGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
  Fog,
  HemisphereLight,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Points,
  PointsMaterial,
  PolarGridHelper,
  Raycaster,
  Scene,
  TorusGeometry,
  TorusKnotGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import type {
  SceneObjectConfig,
  SceneObjectLabel,
  SceneThemeName,
} from "./config";

const HOME_POSITION = new Vector3(0.4, 2.6, 7.4);
const HOME_TARGET = new Vector3(0, 0.25, 0);
const CORE_Y = 0.25;
const FLOOR_Y = -1.62;
const TRANSITION_SECONDS = 0.9;

const THEMES = {
  dark: {
    background: 0x070b15,
    floor: 0x0b1424,
    gridPrimary: 0x1d3d5c,
    gridSecondary: 0x122237,
    particles: 0x67e8f9,
    particleOpacity: 0.7,
    hemiSky: 0x334155,
    hemiGround: 0x020617,
    hemiIntensity: 0.6,
    bloomStrength: 0.62,
    bloomRadius: 0.5,
    bloomThreshold: 0.8,
    environmentIntensity: 0.85,
    exposure: 1.12,
    emissiveIntensity: 1.1,
    rimColor: 0x67e8f9,
  },
  light: {
    background: 0xeef2f8,
    floor: 0xdde6f1,
    gridPrimary: 0x9fb3cd,
    gridSecondary: 0xc3d2e3,
    particles: 0x38bdf8,
    particleOpacity: 0.5,
    hemiSky: 0xffffff,
    hemiGround: 0xcbd5e1,
    hemiIntensity: 0.85,
    bloomStrength: 0.26,
    bloomRadius: 0.4,
    bloomThreshold: 0.9,
    environmentIntensity: 0.55,
    exposure: 1,
    emissiveIntensity: 0.6,
    rimColor: 0x0ea5e9,
  },
} as const;

export type ThreeSceneOptions = {
  objects: SceneObjectConfig[];
  objectLabels: Record<string, SceneObjectLabel>;
  theme: SceneThemeName;
  reducedMotion: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  onReady: () => void;
};

export type ThreeSceneController = {
  setAutoRotate: (enabled: boolean) => void;
  setParticles: (enabled: boolean) => void;
  setWireframe: (enabled: boolean) => void;
  deselect: () => void;
  resetView: () => void;
  setTheme: (theme: SceneThemeName) => void;
  dispose: () => void;
};

function createGeometry(config: SceneObjectConfig): BufferGeometry {
  const { size } = config;
  switch (config.geometry) {
    case "icosahedron":
      return new IcosahedronGeometry(size, 1);
    case "torusKnot":
      return new TorusKnotGeometry(size, size * 0.34, 128, 24);
    case "dodecahedron":
      return new DodecahedronGeometry(size);
    case "octahedron":
      return new OctahedronGeometry(size);
    case "torus":
      return new TorusGeometry(size, size * 0.35, 24, 64);
    case "capsule":
      return new CapsuleGeometry(size, size * 1.6, 8, 24);
    case "box":
      return new BoxGeometry(size, size, size, 2, 2, 2);
  }
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

export function createThreeScene(
  container: HTMLElement,
  options: ThreeSceneOptions,
): ThreeSceneController {
  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.copy(HOME_POSITION);

  const renderer = new WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.domElement.style.display = "block";
  container.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.inset = "0";
  labelRenderer.domElement.style.pointerEvents = "none";
  labelRenderer.domElement.style.zIndex = "5";
  container.appendChild(labelRenderer.domElement);

  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environmentTexture = pmrem.fromScene(room, 0.04).texture;
  scene.environment = environmentTexture;
  room.dispose();

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 2.8;
  controls.maxDistance = 15;
  controls.minPolarAngle = 0.3;
  controls.maxPolarAngle = 1.52;
  controls.autoRotateSpeed = 0.55;
  controls.target.copy(HOME_TARGET);

  const hemiLight = new HemisphereLight(0xffffff, 0x1e293b, 0.6);
  const keyLight = new DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(5, 9, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 30;
  keyLight.shadow.camera.left = -9;
  keyLight.shadow.camera.right = 9;
  keyLight.shadow.camera.top = 9;
  keyLight.shadow.camera.bottom = -9;
  keyLight.shadow.bias = -0.0004;
  keyLight.shadow.normalBias = 0.02;
  const rimLight = new PointLight(0x67e8f9, 12, 26, 2);
  rimLight.position.set(-6, 4.5, -6);
  scene.add(hemiLight, keyLight, keyLight.target, rimLight);

  const floorMaterial = new MeshStandardMaterial({
    color: 0x0b1424,
    roughness: 0.92,
    metalness: 0.05,
  });
  const floorGeometry = new CircleGeometry(13, 64);
  const floor = new Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  floor.receiveShadow = true;
  scene.add(floor);

  function createGrid(theme: SceneThemeName) {
    const palette = THEMES[theme];
    const grid = new PolarGridHelper(
      13,
      16,
      7,
      64,
      palette.gridPrimary,
      palette.gridSecondary,
    );
    grid.position.y = FLOOR_Y + 0.02;
    const material = grid.material as LineBasicMaterial;
    material.transparent = true;
    material.opacity = 0.5;
    material.depthWrite = false;
    return grid;
  }

  let grid = createGrid(options.theme);
  scene.add(grid);

  const glowMaterials: MeshStandardMaterial[] = [];
  const meshes = new Map<string, Mesh>();
  const overlays = new Map<string, Mesh>();
  const labelOffsets = new Map<string, number>();

  function createMaterial(
    config: SceneObjectConfig,
    theme: SceneThemeName,
  ): MeshStandardMaterial | MeshPhysicalMaterial {
    if (config.material === "glow") {
      const material = new MeshStandardMaterial({
        color: new Color(config.color).multiplyScalar(0.32),
        emissive: new Color(config.color),
        emissiveIntensity: THEMES[theme].emissiveIntensity,
        metalness: 0.25,
        roughness: 0.32,
      });
      glowMaterials.push(material);
      return material;
    }
    if (config.material === "glass") {
      return new MeshPhysicalMaterial({
        color: new Color(config.color),
        metalness: 0,
        roughness: 0.08,
        transmission: 0.92,
        thickness: 0.5,
        ior: 1.45,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
      });
    }
    return new MeshStandardMaterial({
      color: new Color(config.color),
      metalness: 0.85,
      roughness: 0.28,
    });
  }

  for (const config of options.objects) {
    const geometry = createGeometry(config);
    geometry.computeBoundingSphere();
    const material = createMaterial(config, options.theme);
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.userData.id = config.id;

    const overlayMaterial = new MeshBasicMaterial({
      color: new Color(config.accent),
      transparent: true,
      opacity: 0.16,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const overlay = new Mesh(geometry, overlayMaterial);
    overlay.scale.setScalar(1.08);
    overlay.visible = false;
    mesh.add(overlay);

    const radius = geometry.boundingSphere?.radius ?? config.size;
    labelOffsets.set(config.id, radius * 1.4 + 0.3);

    if (config.orbit) {
      scene.add(mesh);
    } else {
      mesh.position.y = CORE_Y;
      const shell = new LineSegments(
        new EdgesGeometry(new IcosahedronGeometry(config.size * 1.32, 1)),
        new LineBasicMaterial({
          color: new Color(config.accent),
          transparent: true,
          opacity: 0.42,
        }),
      );
      shell.userData.shell = true;
      mesh.add(shell);
      scene.add(mesh);
    }

    meshes.set(config.id, mesh);
    overlays.set(config.id, overlay);
  }

  for (const config of options.objects) {
    if (!config.orbit) continue;
    const points: number[] = [];
    const segments = 160;
    for (let index = 0; index <= segments; index += 1) {
      const angle = (index / segments) * Math.PI * 2;
      points.push(
        Math.cos(angle) * config.orbit.radius,
        config.orbit.baseY + Math.sin(angle) * config.orbit.tilt * 0.6,
        Math.sin(angle) * config.orbit.radius,
      );
    }
    const ringGeometry = new BufferGeometry();
    ringGeometry.setAttribute("position", new Float32BufferAttribute(points, 3));
    const ring = new LineLoop(
      ringGeometry,
      new LineBasicMaterial({
        color: new Color(config.accent),
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
      }),
    );
    scene.add(ring);
  }

  const particleCount = 1100;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let index = 0; index < particleCount; index += 1) {
    const radius = 4.5 + Math.random() * 7.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    particlePositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[index * 3 + 1] = radius * Math.cos(phi) * 0.62;
    particlePositions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  const particleGeometry = new BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new Float32BufferAttribute(particlePositions, 3),
  );
  const particleMaterial = new PointsMaterial({
    color: new Color(0x67e8f9),
    size: 0.06,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  const particles = new Points(particleGeometry, particleMaterial);
  scene.add(particles);

  const labelElement = document.createElement("div");
  labelElement.className =
    "pointer-events-none rounded-full border border-border/60 bg-card/85 px-2.5 py-1 font-mono text-[11px] leading-none text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity duration-150";
  const hoverLabel = new CSS2DObject(labelElement);
  scene.add(hoverLabel);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(new Vector2(1, 1), 0.62, 0.5, 0.8);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const pickables = Array.from(meshes.values());
  const worldPosition = new Vector3();
  const focusDirection = new Vector3();
  const transitionFromCamera = new Vector3();
  const transitionFromTarget = new Vector3();
  const desiredCamera = new Vector3();
  const desiredTarget = new Vector3();
  const followTarget = new Vector3();

  let hoveredId: string | null = null;
  let focusId: string | null = null;
  let pointerDirty = false;
  let isPointerDown = false;
  let downX = 0;
  let downY = 0;
  let transitionProgress = 1;
  let autoRotateEnabled = true;

  function applyTheme(theme: SceneThemeName) {
    const palette = THEMES[theme];
    scene.background = new Color(palette.background);
    scene.fog = new Fog(palette.background, 13, 34);
    scene.environmentIntensity = palette.environmentIntensity;
    renderer.toneMappingExposure = palette.exposure;
    floorMaterial.color.setHex(palette.floor);
    hemiLight.color.setHex(palette.hemiSky);
    hemiLight.groundColor.setHex(palette.hemiGround);
    hemiLight.intensity = palette.hemiIntensity;
    rimLight.color.setHex(palette.rimColor);
    bloomPass.strength = palette.bloomStrength;
    bloomPass.radius = palette.bloomRadius;
    bloomPass.threshold = palette.bloomThreshold;
    particleMaterial.color.setHex(palette.particles);
    particleMaterial.opacity = palette.particleOpacity;
    for (const material of glowMaterials) {
      material.emissiveIntensity = palette.emissiveIntensity;
    }
    scene.remove(grid);
    grid.geometry.dispose();
    (grid.material as LineBasicMaterial).dispose();
    grid = createGrid(theme);
    scene.add(grid);
  }

  function syncAutoRotate() {
    controls.autoRotate =
      autoRotateEnabled && !focusId && transitionProgress >= 1;
  }

  function updateHover(id: string | null) {
    if (id !== hoveredId) {
      hoveredId = id;
      options.onHover(id);
      renderer.domElement.style.cursor = id ? "pointer" : "grab";
    }
    for (const [meshId, overlay] of overlays) {
      overlay.visible = meshId === id;
    }
    if (id) {
      const label = options.objectLabels[id];
      labelElement.textContent = label?.name ?? id;
      labelElement.style.opacity = "1";
    } else {
      labelElement.style.opacity = "0";
    }
  }

  function resolveFocusPose(id: string | null) {
    if (id) {
      const mesh = meshes.get(id);
      const config = options.objects.find((item) => item.id === id);
      if (!mesh || !config) return false;
      mesh.getWorldPosition(desiredTarget);
      const distance = config.orbit ? 5.2 : 4.6;
      desiredCamera
        .copy(desiredTarget)
        .addScaledVector(focusDirection, distance);
      return true;
    }
    desiredTarget.copy(HOME_TARGET);
    desiredCamera.copy(HOME_POSITION);
    return true;
  }

  function beginTransition() {
    transitionFromCamera.copy(camera.position);
    transitionFromTarget.copy(controls.target);
    focusDirection.copy(camera.position).sub(controls.target).normalize();
    transitionProgress = 0;
    syncAutoRotate();
  }

  function select(id: string | null) {
    const wasTransitioning = transitionProgress < 1;
    focusId = id;
    options.onSelect(id);
    if (id || wasTransitioning) {
      beginTransition();
    } else {
      syncAutoRotate();
    }
  }

  function resetToHome() {
    focusId = null;
    options.onSelect(null);
    beginTransition();
  }

  function updatePointer(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function handlePointerMove(event: PointerEvent) {
    updatePointer(event);
    if (event.pointerType === "mouse" && !isPointerDown) {
      pointerDirty = true;
    }
  }

  function handlePointerDown(event: PointerEvent) {
    isPointerDown = true;
    downX = event.clientX;
    downY = event.clientY;
    updatePointer(event);
    renderer.domElement.style.cursor = "grabbing";
    try {
      renderer.domElement.setPointerCapture(event.pointerId);
    } catch {
      // pointer capture can fail for synthetic events
    }
  }

  function handlePointerUp(event: PointerEvent) {
    isPointerDown = false;
    updatePointer(event);
    const moved =
      Math.abs(event.clientX - downX) + Math.abs(event.clientY - downY) > 8;
    if (!moved) {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickables, false);
      select(hits.length ? (hits[0].object.userData.id as string) : null);
    }
    renderer.domElement.style.cursor = hoveredId ? "pointer" : "grab";
  }

  function handlePointerLeave() {
    pointerDirty = false;
    if (!isPointerDown) updateHover(null);
  }

  renderer.domElement.style.cursor = "grab";
  renderer.domElement.addEventListener("pointermove", handlePointerMove);
  renderer.domElement.addEventListener("pointerdown", handlePointerDown);
  renderer.domElement.addEventListener("pointerup", handlePointerUp);
  renderer.domElement.addEventListener("pointerleave", handlePointerLeave);

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
    labelRenderer.setSize(width, height);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  let documentVisible = !document.hidden;
  let intersecting = true;

  function syncLoop() {
    const shouldRun = documentVisible && intersecting;
    if (shouldRun && rafId === null) {
      clock.getDelta();
      rafId = requestAnimationFrame(tick);
    } else if (!shouldRun && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function handleVisibility() {
    documentVisible = !document.hidden;
    syncLoop();
  }

  document.addEventListener("visibilitychange", handleVisibility);

  const intersectionObserver = new IntersectionObserver((entries) => {
    intersecting = entries.some((entry) => entry.isIntersecting);
    syncLoop();
  });
  intersectionObserver.observe(container);

  const clock = new Clock();
  let rafId: number | null = null;
  let elapsed = 0;
  let firstFrame = true;

  function tick() {
    rafId = requestAnimationFrame(tick);
    const delta = Math.min(clock.getDelta(), 0.05);
    elapsed += delta;

    for (const config of options.objects) {
      const mesh = meshes.get(config.id);
      if (!mesh) continue;
      if (config.orbit) {
        const angle = config.orbit.phase + elapsed * config.orbit.speed;
        mesh.position.set(
          Math.cos(angle) * config.orbit.radius,
          config.orbit.baseY + Math.sin(angle) * config.orbit.tilt * 0.6,
          Math.sin(angle) * config.orbit.radius,
        );
        mesh.rotation.x += delta * config.orbit.spin;
        mesh.rotation.y += delta * config.orbit.spin * 0.7;
      } else {
        mesh.rotation.y += delta * 0.24;
        mesh.position.y = CORE_Y + Math.sin(elapsed * 0.9) * 0.12;
        const shell = mesh.children.find((child) => child.userData.shell);
        if (shell) shell.rotation.y -= delta * 0.4;
      }
    }

    particles.rotation.y += delta * 0.02;

    if (pointerDirty) {
      pointerDirty = false;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickables, false);
      updateHover(hits.length ? (hits[0].object.userData.id as string) : null);
    }

    if (hoveredId) {
      const mesh = meshes.get(hoveredId);
      if (mesh) {
        mesh.getWorldPosition(worldPosition);
        hoverLabel.position.copy(worldPosition);
        hoverLabel.position.y += labelOffsets.get(hoveredId) ?? 0.5;
      }
    }

    if (transitionProgress < 1) {
      transitionProgress = Math.min(
        transitionProgress + delta / TRANSITION_SECONDS,
        1,
      );
      if (resolveFocusPose(focusId)) {
        const eased = easeOutCubic(transitionProgress);
        desiredCamera.lerpVectors(transitionFromCamera, desiredCamera, eased);
        desiredTarget.lerpVectors(transitionFromTarget, desiredTarget, eased);
        camera.position.copy(desiredCamera);
        controls.target.copy(desiredTarget);
      }
      if (transitionProgress >= 1) syncAutoRotate();
    } else if (focusId) {
      const mesh = meshes.get(focusId);
      if (mesh) {
        mesh.getWorldPosition(followTarget);
        controls.target.lerp(followTarget, 1 - Math.exp(-8 * delta));
      }
    }

    controls.update();
    composer.render();
    labelRenderer.render(scene, camera);

    if (firstFrame) {
      firstFrame = false;
      options.onReady();
    }
  }

  resize();
  applyTheme(options.theme);
  autoRotateEnabled = !options.reducedMotion;
  syncAutoRotate();
  syncLoop();

  return {
    setAutoRotate(enabled) {
      autoRotateEnabled = enabled;
      syncAutoRotate();
    },
    setParticles(enabled) {
      particles.visible = enabled;
    },
    setWireframe(enabled) {
      for (const mesh of meshes.values()) {
        const material = mesh.material;
        if (
          material instanceof MeshStandardMaterial ||
          material instanceof MeshPhysicalMaterial
        ) {
          material.wireframe = enabled;
        }
      }
    },
    deselect() {
      focusId = null;
      options.onSelect(null);
      transitionProgress = 1;
      syncAutoRotate();
    },
    resetView() {
      resetToHome();
    },
    setTheme(theme) {
      applyTheme(theme);
    },
    dispose() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
      controls.dispose();

      const disposedGeometries = new Set<BufferGeometry>();
      const disposedMaterials = new Set<Material>();
      const disposeMaterial = (material: Material) => {
        if (disposedMaterials.has(material)) return;
        disposedMaterials.add(material);
        material.dispose();
      };

      scene.traverse((object) => {
        const renderable = object as Mesh;
        if (
          renderable.geometry instanceof BufferGeometry &&
          !disposedGeometries.has(renderable.geometry)
        ) {
          disposedGeometries.add(renderable.geometry);
          renderable.geometry.dispose();
        }
        if (renderable.material) {
          if (Array.isArray(renderable.material)) {
            for (const material of renderable.material) {
              disposeMaterial(material);
            }
          } else {
            disposeMaterial(renderable.material);
          }
        }
      });

      environmentTexture.dispose();
      bloomPass.dispose();
      composer.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labelRenderer.domElement.remove();
    },
  };
}
