"use client";

import { useEffect, useRef, useState } from "react";

import {
  createMockSource,
  type LogEntry,
  type Snapshot,
} from "./datasource";

const HISTORY_SIZE = 60;
const LOG_SIZE = 40;

export type MetricsState = {
  latest: Snapshot | null;
  history: Snapshot[];
  logs: LogEntry[];
};

const EMPTY: MetricsState = { latest: null, history: [], logs: [] };

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
      if (pausedRef.current) return;
      setState((prev) => ({
        latest: snapshot,
        history: [...prev.history, snapshot].slice(-HISTORY_SIZE),
        logs: snapshot.log
          ? [snapshot.log, ...prev.logs].slice(0, LOG_SIZE)
          : prev.logs,
      }));
    });
    return stop;
  }, [intervalMs, regionNames]);

  return state;
}
