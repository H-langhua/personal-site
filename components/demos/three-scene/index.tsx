"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  Box,
  Loader2,
  Maximize2,
  Minimize2,
  Orbit,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { sceneObjects, type SceneObjectLabel } from "./config";
import { createThreeScene, type ThreeSceneController } from "./scene";

export type ThreeSceneLabels = {
  loading: string;
  hint: string;
  autoRotate: string;
  particles: string;
  wireframe: string;
  reset: string;
  fullscreen: string;
  exitFullscreen: string;
  geometry: string;
  material: string;
  orbitRadius: string;
  unit: string;
  close: string;
  materials: Record<string, string>;
  objects: Record<string, SceneObjectLabel>;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServer() {
  return false;
}

export function ThreeScene({ labels }: { labels: ThreeSceneLabels }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<ThreeSceneController | null>(null);
  const labelsRef = useRef(labels);

  const [ready, setReady] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoRotateOverride, setAutoRotateOverride] = useState<boolean | null>(
    null,
  );
  const [particlesOn, setParticlesOn] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getReducedMotionServer,
  );
  const autoRotate = autoRotateOverride ?? !reducedMotion;

  useEffect(() => {
    labelsRef.current = labels;
  }, [labels]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const theme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";

    const controller = createThreeScene(mount, {
      objects: sceneObjects,
      objectLabels: labelsRef.current.objects,
      theme,
      reducedMotion: window.matchMedia(REDUCED_MOTION_QUERY).matches,
      onHover: setHoveredId,
      onSelect: setSelectedId,
      onReady: () => setReady(true),
    });
    controllerRef.current = controller;

    const themeObserver = new MutationObserver(() => {
      controller.setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      themeObserver.disconnect();
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    controllerRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  useEffect(() => {
    controllerRef.current?.setParticles(particlesOn);
  }, [particlesOn]);

  useEffect(() => {
    controllerRef.current?.setWireframe(wireframe);
  }, [wireframe]);

  useEffect(() => {
    const handle = () => {
      setFullscreen(document.fullscreenElement === wrapRef.current);
    };
    document.addEventListener("fullscreenchange", handle);
    return () => document.removeEventListener("fullscreenchange", handle);
  }, []);

  const selected = useMemo(
    () => sceneObjects.find((object) => object.id === selectedId) ?? null,
    [selectedId],
  );
  const selectedLabel = selected ? labels.objects[selected.id] : null;

  const toggleFullscreen = () => {
    const element = wrapRef.current;
    if (!element) return;
    if (document.fullscreenElement === element) {
      void document.exitFullscreen();
    } else {
      void element.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border/60",
        fullscreen ? "h-full min-h-screen bg-background" : "h-[560px]",
      )}
    >
      <div ref={mountRef} className="absolute inset-0" />

      <div className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5 rounded-lg border border-border/60 bg-background/70 p-1.5 backdrop-blur">
        <Button
          size="sm"
          variant={autoRotate ? "default" : "outline"}
          onClick={() => setAutoRotateOverride(!autoRotate)}
        >
          <Orbit className="size-4" />
          {labels.autoRotate}
        </Button>
        <Button
          size="sm"
          variant={particlesOn ? "default" : "outline"}
          onClick={() => setParticlesOn((value) => !value)}
        >
          <Sparkles className="size-4" />
          {labels.particles}
        </Button>
        <Button
          size="sm"
          variant={wireframe ? "default" : "outline"}
          onClick={() => setWireframe((value) => !value)}
        >
          <Box className="size-4" />
          {labels.wireframe}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => controllerRef.current?.resetView()}
        >
          <RotateCcw className="size-4" />
          {labels.reset}
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          aria-label={fullscreen ? labels.exitFullscreen : labels.fullscreen}
          title={fullscreen ? labels.exitFullscreen : labels.fullscreen}
          onClick={toggleFullscreen}
        >
          {fullscreen ? (
            <Minimize2 className="size-4" />
          ) : (
            <Maximize2 className="size-4" />
          )}
        </Button>
      </div>

      {selected && selectedLabel ? (
        <div className="absolute right-3 top-3 z-20 w-64 rounded-xl border border-border/60 bg-background/85 p-4 backdrop-blur">
          <button
            type="button"
            aria-label={labels.close}
            title={labels.close}
            onClick={() => controllerRef.current?.deselect()}
            className="absolute right-2 top-2 grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
          <p className="pr-5 text-sm font-medium">{selectedLabel.name}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {selectedLabel.description}
          </p>
          <dl className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{labels.geometry}</dt>
              <dd className="truncate font-mono">{selected.geometryLabel}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{labels.material}</dt>
              <dd>{labels.materials[selected.material] ?? selected.material}</dd>
            </div>
            {selected.orbit ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{labels.orbitRadius}</dt>
                <dd>
                  {selected.orbit.radius.toFixed(1)} {labels.unit}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : (
        <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 w-max max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-center text-xs text-muted-foreground backdrop-blur">
          {labels.hint}
        </p>
      )}

      <span className="pointer-events-none absolute bottom-3 right-3 z-10 font-mono text-[10px] text-muted-foreground">
        [{hoveredId ?? "—"}]
      </span>

      {!ready ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-background/70 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            {labels.loading}
          </span>
        </div>
      ) : null}
    </div>
  );
}
