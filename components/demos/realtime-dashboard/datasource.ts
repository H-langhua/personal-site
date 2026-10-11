export type LogLevel = "info" | "warn" | "error";

export type LogEntry = {
  id: number;
  at: number;
  level: LogLevel;
  message: string;
};

export type EndpointStat = { name: string; rps: number };
export type RegionStat = { name: string; value: number };
export type StatusSplit = { ok: number; client: number; server: number };

export type Snapshot = {
  at: number;
  qps: number;
  latency: number;
  p95: number;
  errorRate: number;
  cpu: number;
  memory: number;
  connections: number;
  throughput: number;
  status: StatusSplit;
  endpoints: EndpointStat[];
  regions: RegionStat[];
  log: LogEntry | null;
};

export type DataSource = {
  /** Subscribe to a stream of snapshots. Returns an unsubscribe function. */
  start: (onTick: (snapshot: Snapshot) => void) => () => void;
};

const ENDPOINTS = [
  "/api/graph",
  "/api/query",
  "/api/upload",
  "/api/stream",
  "/api/auth",
  "/api/export",
];
const ENDPOINT_WEIGHTS = [0.28, 0.22, 0.17, 0.14, 0.11, 0.08];

const REGION_WEIGHTS = [0.33, 0.24, 0.2, 0.13, 0.1];

const DEFAULT_REGION_NAMES = ["华东", "华南", "华北", "西南", "海外"];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const rand = (min: number, max: number) => min + Math.random() * (max - min);

type Runtime = {
  tick: number;
  qps: number;
  latency: number;
  errorRate: number;
  cpu: number;
  memory: number;
  connections: number;
  throughput: number;
};

// Globally monotonic so ids stay unique across re-subscriptions
// (e.g. React StrictMode's mount → unmount → mount in dev).
let logSequence = 0;

function createLog(rt: Runtime, spiking: boolean): LogEntry {
  logSequence += 1;
  const at = Date.now();
  const dirty = Math.random() * 100 < rt.errorRate * 6;
  const slow = spiking || Math.random() < 0.18;

  if (dirty) {
    return {
      id: logSequence,
      at,
      level: "error",
      message: `POST ${ENDPOINTS[Math.floor(rand(0, ENDPOINTS.length))]} 502 upstream timeout (${Math.round(rand(240, 900))}ms)`,
    };
  }
  if (slow) {
    return {
      id: logSequence,
      at,
      level: "warn",
      message: `GET /api/stream slow response ${Math.round(rt.latency * rand(1.4, 2.2))}ms`,
    };
  }
  return {
    id: logSequence,
    at,
    level: "info",
    message: `GET ${ENDPOINTS[Math.floor(rand(0, ENDPOINTS.length))]} 200 ${Math.round(rand(28, 140))}ms`,
  };
}

function step(rt: Runtime, regionNames: string[]): Snapshot {
  rt.tick += 1;
  const mood = Math.sin(rt.tick / 15) * 0.5 + 0.5; // slow load cycle 0..1
  const spiking = Math.random() < 0.05;

  const qpsTarget = 480 + mood * 1500 + (spiking ? rand(500, 1100) : 0);
  rt.qps = clamp(
    rt.qps + (qpsTarget - rt.qps) * 0.22 + rand(-55, 55),
    160,
    3400,
  );

  const latencyTarget =
    52 + (rt.qps / 3400) * 230 + (spiking ? rand(90, 240) : 0);
  rt.latency = clamp(
    rt.latency + (latencyTarget - rt.latency) * 0.28 + rand(-7, 7),
    28,
    950,
  );
  const p95 = rt.latency * rand(1.7, 2.35);

  const errorTarget = spiking ? rand(2.5, 8) : 0.4;
  rt.errorRate = clamp(
    rt.errorRate + (errorTarget - rt.errorRate) * 0.3 + rand(-0.15, 0.15),
    0,
    13,
  );

  rt.cpu = clamp(
    rt.cpu + ((rt.qps / 3400) * 93 - rt.cpu) * 0.2 + rand(-2.5, 2.5),
    6,
    99,
  );
  rt.memory = clamp(rt.memory + rand(-1.4, 1.5), 34, 96);
  rt.connections = clamp(
    rt.connections + (rt.qps * 3.4 - rt.connections) * 0.2 + rand(-70, 70),
    200,
    17000,
  );
  rt.throughput = clamp(
    rt.throughput + (rt.qps * 0.052 - rt.throughput) * 0.3 + rand(-2, 2),
    3,
    240,
  );

  const errorMagnitude = (rt.errorRate / 100) * rt.qps;
  const server = Math.round(errorMagnitude * 0.35);
  const client = Math.round(errorMagnitude * 0.65);
  const ok = Math.max(0, Math.round(rt.qps) - server - client);

  const endpoints: EndpointStat[] = ENDPOINTS.map((name, i) => ({
    name,
    rps: Math.max(
      0,
      Math.round(rt.qps * (ENDPOINT_WEIGHTS[i] + rand(-0.025, 0.025))),
    ),
  }));

  const regions: RegionStat[] = regionNames.map((name, i) => ({
    name,
    value: Math.max(
      0,
      Math.round(rt.qps * ((REGION_WEIGHTS[i] ?? 0.1) + rand(-0.02, 0.02))),
    ),
  }));

  const log = Math.random() < 0.75 ? createLog(rt, spiking) : null;

  return {
    at: Date.now(),
    qps: Math.round(rt.qps),
    latency: Math.round(rt.latency),
    p95: Math.round(p95),
    errorRate: Math.round(rt.errorRate * 10) / 10,
    cpu: Math.round(rt.cpu),
    memory: Math.round(rt.memory),
    connections: Math.round(rt.connections),
    throughput: Math.round(rt.throughput * 10) / 10,
    status: { ok, client, server },
    endpoints,
    regions,
    log,
  };
}

/** Simulated real-time metrics source (no backend required). */
export function createMockSource(
  intervalMs = 1000,
  regionNames: string[] = DEFAULT_REGION_NAMES,
): DataSource {
  return {
    start(onTick) {
      const rt: Runtime = {
        tick: 0,
        qps: 820,
        latency: 92,
        errorRate: 0.6,
        cpu: 46,
        memory: 61,
        connections: 3200,
        throughput: 42,
      };
      // Emit immediately so the first paint isn't empty.
      onTick(step(rt, regionNames));
      const timer = setInterval(
        () => onTick(step(rt, regionNames)),
        intervalMs,
      );
      return () => clearInterval(timer);
    },
  };
}
