import type {
  EndpointStat,
  InstanceStat,
  InstanceStatus,
  LogEntry,
  LogLevel,
  RegionStat,
  SlowRequest,
  Snapshot,
} from "./datasource";

const MAX_TEXT = 96;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const finite = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const clamp = (value: unknown, min: number, max: number): number | null => {
  const n = finite(value);
  return n === null ? null : Math.min(max, Math.max(min, n));
};

const text = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
  return cleaned ? cleaned.slice(0, MAX_TEXT) : fallback;
};

const LOG_LEVELS: LogLevel[] = ["info", "warn", "error"];
const INSTANCE_STATUSES: InstanceStatus[] = ["healthy", "degraded", "offline"];

/**
 * Normalize one untrusted snapshot from the feed:
 * - reject the whole tick when core fields are missing / non-numeric
 * - clamp out-of-range numbers instead of dropping the tick
 * - sanitize strings and filter invalid list items
 */
export function sanitizeSnapshot(raw: unknown): Snapshot | null {
  if (!isRecord(raw)) return null;

  const qps = clamp(raw.qps, 0, 100_000);
  const latency = clamp(raw.latency, 0, 60_000);
  const p95 = clamp(raw.p95, 0, 60_000);
  const errorRate = clamp(raw.errorRate, 0, 100);
  const cpu = clamp(raw.cpu, 0, 100);
  const memory = clamp(raw.memory, 0, 100);
  const connections = clamp(raw.connections, 0, 10_000_000);
  const throughput = clamp(raw.throughput, 0, 1_000_000);
  if (
    qps === null ||
    latency === null ||
    p95 === null ||
    errorRate === null ||
    cpu === null ||
    memory === null ||
    connections === null ||
    throughput === null
  ) {
    return null;
  }

  if (!isRecord(raw.status)) return null;
  const ok = clamp(raw.status.ok, 0, 100_000_000);
  const client = clamp(raw.status.client, 0, 100_000_000);
  const server = clamp(raw.status.server, 0, 100_000_000);
  if (ok === null || client === null || server === null) return null;

  if (!isRecord(raw.bandwidth)) return null;
  const inMbps = clamp(raw.bandwidth.inMbps, 0, 1_000_000);
  const outMbps = clamp(raw.bandwidth.outMbps, 0, 1_000_000);
  if (inMbps === null || outMbps === null) return null;

  if (!Array.isArray(raw.endpoints) || !Array.isArray(raw.regions)) return null;

  const endpoints: EndpointStat[] = raw.endpoints.flatMap((item) => {
    if (!isRecord(item)) return [];
    const rps = clamp(item.rps, 0, 1_000_000);
    return rps === null ? [] : [{ name: text(item.name, "/api"), rps }];
  });

  const regions: RegionStat[] = raw.regions.flatMap((item) => {
    if (!isRecord(item)) return [];
    const value = clamp(item.value, 0, 1_000_000);
    return value === null ? [] : [{ name: text(item.name, "—"), value }];
  });

  const instances: InstanceStat[] = Array.isArray(raw.instances)
    ? raw.instances.flatMap((item) => {
        if (!isRecord(item)) return [];
        const instanceCpu = clamp(item.cpu, 0, 100);
        if (instanceCpu === null) return [];
        const status = INSTANCE_STATUSES.includes(item.status as InstanceStatus)
          ? (item.status as InstanceStatus)
          : "healthy";
        return [
          {
            id: text(item.id, "api"),
            zone: text(item.zone, "—"),
            cpu: instanceCpu,
            status,
          },
        ];
      })
    : [];

  const slow: SlowRequest[] = Array.isArray(raw.slow)
    ? raw.slow.flatMap((item) => {
        if (!isRecord(item)) return [];
        const ms = clamp(item.ms, 0, 600_000);
        if (ms === null) return [];
        const status = clamp(item.status, 100, 599);
        return [
          {
            id: finite(item.id) ?? 0,
            method: item.method === "POST" ? ("POST" as const) : ("GET" as const),
            path: text(item.path, "/api"),
            ms,
            status: status === null ? 200 : Math.round(status),
          },
        ];
      })
    : [];

  let log: LogEntry | null = null;
  if (isRecord(raw.log)) {
    const level =
      typeof raw.log.level === "string" &&
      (LOG_LEVELS as string[]).includes(raw.log.level)
        ? (raw.log.level as LogLevel)
        : null;
    if (level) {
      log = {
        id: finite(raw.log.id) ?? 0,
        at: finite(raw.log.at) ?? Date.now(),
        level,
        message: text(raw.log.message, "…"),
      };
    }
  }

  return {
    at: finite(raw.at) ?? Date.now(),
    qps,
    latency,
    p95,
    errorRate,
    cpu,
    memory,
    connections,
    throughput,
    bandwidth: { inMbps, outMbps },
    status: { ok, client, server },
    endpoints,
    regions,
    instances,
    slow,
    log,
  };
}
