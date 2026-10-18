"use client";

import { useEffect, useRef, useState } from "react";

import {
  createMockSource,
  type LogEntry,
  type Snapshot,
} from "./datasource";
import { sanitizeSnapshot } from "./ingest";

const HISTORY_SIZE = 60;
const LOG_SIZE = 40;

export type MetricsState = {
  latest: Snapshot | null;
  history: Snapshot[];
  logs: LogEntry[];
  dropped: number;
};

const EMPTY: MetricsState = { latest: null, history: [], logs: [], dropped: 0 };

export function useMetrics({
  paused,
  intervalMs = 1000,
  regionNames,
}: {
  paused: boolean;
  intervalMs?: number;
  regionNames: string[];
}): MetricsState {
  const [state, setState] = useState<MetricsState>(EMPTY);
  const pausedRef = useRef(paused);

  // Mirror the latest `paused` value so the running interval can read it
  // without being torn down and recreated on every toggle.
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const source = createMockSource(intervalMs, regionNames);
    const stop = source.start((snapshot) => {
      // Skip updates in background tabs to save CPU; on return the next
      // tick refreshes the whole board.
      if (pausedRef.current || document.hidden) return;

      const clean = sanitizeSnapshot(snapshot);
      if (!clean) {
        setState((prev) => ({ ...prev, dropped: prev.dropped + 1 }));
        return;
      }

      setState((prev) => ({
        latest: clean,
        history: [...prev.history, clean].slice(-HISTORY_SIZE),
        logs: clean.log
          ? [clean.log, ...prev.logs].slice(0, LOG_SIZE)
          : prev.logs,
        dropped: prev.dropped,
      }));
    });
    return stop;
  }, [intervalMs, regionNames]);

  return state;
}
