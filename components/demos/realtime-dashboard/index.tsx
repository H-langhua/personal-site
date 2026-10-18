"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { EChartsOption } from "echarts";
import { Maximize2, Minimize2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { Chart } from "./chart";
import type { InstanceStatus } from "./datasource";
import { KpiCard, Panel, withAlpha } from "./panels";
import { useMetrics } from "./use-metrics";

export type DashboardLabels = {
  title: string;
  subtitle: string;
  live: string;
  paused: string;
  pause: string;
  resume: string;
  fullscreen: string;
  exitFullscreen: string;
  dropped: string;
  qps: string;
  latency: string;
  p95: string;
  errorRate: string;
  connections: string;
  throughput: string;
  cpu: string;
  memory: string;
  traffic: string;
  resources: string;
  bandwidth: string;
  bandwidthIn: string;
  bandwidthOut: string;
  instances: string;
  slowRequests: string;
  healthy: string;
  degraded: string;
  offline: string;
  eventLog: string;
  unitMs: string;
  unitPct: string;
  unitMbps: string;
  regionNames: string[];
};

const COLORS = {
  cyan: "#22d3ee",
  violet: "#a78bfa",
  emerald: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
  slate: "#64748b",
};

const GRID_LINE = "#1e293b";
const AXIS_TEXT = "#64748b";

const two = (n: number) => String(n).padStart(2, "0");
const formatClock = (at: number) => {
  const d = new Date(at);
  return `${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
};

const LEVEL_STYLES: Record<string, string> = {
  info: "text-emerald-300",
  warn: "text-amber-300",
  error: "text-rose-300",
};

const INSTANCE_STATUS_META: Record<
  InstanceStatus,
  { dot: string; text: string; bar: string }
> = {
  healthy: { dot: "bg-emerald-400", text: "text-emerald-300", bar: COLORS.emerald },
  degraded: { dot: "bg-amber-400", text: "text-amber-300", bar: COLORS.amber },
  offline: { dot: "bg-rose-500", text: "text-rose-300", bar: COLORS.rose },
};

const METHOD_STYLES: Record<string, string> = {
  GET: "text-cyan-300",
  POST: "text-violet-300",
};

export function RealtimeDashboard({ labels }: { labels: DashboardLabels }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const { latest, history, logs, dropped } = useMetrics({
    paused,
    regionNames: labels.regionNames,
  });

  useEffect(() => {
    const handle = () => {
      setFullscreen(document.fullscreenElement === wrapRef.current);
    };
    document.addEventListener("fullscreenchange", handle);
    return () => document.removeEventListener("fullscreenchange", handle);
  }, []);

  const toggleFullscreen = () => {
    const element = wrapRef.current;
    if (!element) return;
    if (document.fullscreenElement === element) {
      void document.exitFullscreen();
    } else {
      void element.requestFullscreen().catch(() => {});
    }
  };

  const times = useMemo(() => history.map((h) => formatClock(h.at)), [history]);

  const trafficOption = useMemo<EChartsOption>(() => {
    return {
      animation: false,
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(2,6,23,0.92)",
        borderColor: "rgba(34,211,238,0.35)",
        textStyle: { color: "#e2e8f0", fontSize: 11 },
      },
      legend: {
        data: [labels.qps, labels.latency],
        right: 0,
        top: 0,
        textStyle: { color: "#94a3b8", fontSize: 11 },
        itemWidth: 12,
        itemHeight: 8,
      },
      grid: { left: 46, right: 52, top: 34, bottom: 24 },
      xAxis: {
        type: "category",
        data: times,
        boundaryGap: false,
        axisLine: { lineStyle: { color: GRID_LINE } },
        axisLabel: { color: AXIS_TEXT, fontSize: 10 },
      },
      yAxis: [
        {
          type: "value",
          name: labels.qps,
          nameTextStyle: { color: AXIS_TEXT, fontSize: 10 },
          axisLabel: { color: AXIS_TEXT, fontSize: 10 },
          splitLine: { lineStyle: { color: GRID_LINE, type: "dashed" } },
        },
        {
          type: "value",
          name: labels.unitMs,
          nameTextStyle: { color: AXIS_TEXT, fontSize: 10 },
          axisLabel: { color: AXIS_TEXT, fontSize: 10 },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: labels.qps,
          type: "line",
          smooth: true,
          symbol: "none",
          data: history.map((h) => h.qps),
          lineStyle: { color: COLORS.cyan, width: 2 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: withAlpha(COLORS.cyan, 0.4) },
                { offset: 1, color: withAlpha(COLORS.cyan, 0) },
              ],
            },
          },
        },
        {
          name: labels.latency,
          type: "line",
          smooth: true,
          symbol: "none",
          yAxisIndex: 1,
          data: history.map((h) => h.latency),
          lineStyle: { color: COLORS.violet, width: 2 },
        },
      ],
      media: [
        {
          query: { maxWidth: 520 },
          option: {
            legend: {
              top: 0,
              right: 0,
              textStyle: { fontSize: 9 },
              itemWidth: 10,
              itemHeight: 7,
            },
            grid: { left: 34, right: 36, top: 28, bottom: 20 },
            xAxis: { axisLabel: { fontSize: 9, interval: 9 } },
            yAxis: [
              { name: "", axisLabel: { fontSize: 9 } },
              { name: "", axisLabel: { fontSize: 9 } },
            ],
          },
        },
      ],
    };
  }, [history, times, labels]);

  const bandwidthOption = useMemo<EChartsOption>(() => {
    const series = [
      {
        name: labels.bandwidthIn,
        data: history.map((h) => h.bandwidth.inMbps),
        color: COLORS.cyan,
      },
      {
        name: labels.bandwidthOut,
        data: history.map((h) => h.bandwidth.outMbps),
        color: COLORS.emerald,
      },
    ];
    return {
      animation: false,
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(2,6,23,0.92)",
        borderColor: "rgba(34,211,238,0.35)",
        textStyle: { color: "#e2e8f0", fontSize: 11 },
      },
      legend: {
        data: series.map((s) => s.name),
        right: 0,
        top: 0,
        textStyle: { color: "#94a3b8", fontSize: 11 },
        itemWidth: 12,
        itemHeight: 8,
      },
      grid: { left: 42, right: 16, top: 34, bottom: 24 },
      xAxis: {
        type: "category",
        data: times,
        boundaryGap: false,
        axisLine: { lineStyle: { color: GRID_LINE } },
        axisLabel: { color: AXIS_TEXT, fontSize: 10 },
      },
      yAxis: {
        type: "value",
        name: labels.unitMbps,
        nameTextStyle: { color: AXIS_TEXT, fontSize: 10 },
        axisLabel: { color: AXIS_TEXT, fontSize: 10 },
        splitLine: { lineStyle: { color: GRID_LINE, type: "dashed" } },
      },
      series: series.map((s) => ({
        name: s.name,
        type: "line" as const,
        smooth: true,
        symbol: "none",
        data: s.data,
        lineStyle: { color: s.color, width: 2 },
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: withAlpha(s.color, 0.35) },
              { offset: 1, color: withAlpha(s.color, 0) },
            ],
          },
        },
      })),
      media: [
        {
          query: { maxWidth: 520 },
          option: {
            legend: {
              top: 0,
              right: 0,
              textStyle: { fontSize: 9 },
              itemWidth: 10,
              itemHeight: 7,
            },
            grid: { left: 32, right: 10, top: 26, bottom: 20 },
            xAxis: { axisLabel: { fontSize: 9, interval: 9 } },
            yAxis: { name: "", axisLabel: { fontSize: 9 } },
          },
        },
      ],
    };
  }, [history, times, labels]);

  const gauge = (
    value: number,
    color: string,
    name: string,
  ): EChartsOption => ({
    animation: false,
    series: [
      {
        type: "gauge",
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        radius: "96%",
        center: ["50%", "60%"],
        progress: { show: true, width: 9, roundCap: true, itemStyle: { color } },
        axisLine: { lineStyle: { width: 9, color: [[1, "#1e293b"]] } },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        title: {
          offsetCenter: [0, "34%"],
          color: "#94a3b8",
          fontSize: 11,
        },
        detail: {
          offsetCenter: [0, "0%"],
          color,
          fontSize: 22,
          fontWeight: 600,
          formatter: "{value}%",
        },
        data: [{ value: Math.round(value), name }],
      },
    ],
  });

  const kpis = [
    { label: labels.qps, value: latest?.qps ?? 0, unit: "", series: history.map((h) => h.qps), color: COLORS.cyan },
    { label: labels.latency, value: latest?.latency ?? 0, unit: labels.unitMs, series: history.map((h) => h.latency), color: COLORS.violet },
    { label: labels.p95, value: latest?.p95 ?? 0, unit: labels.unitMs, series: history.map((h) => h.p95), color: COLORS.amber },
    { label: labels.errorRate, value: latest?.errorRate ?? 0, unit: labels.unitPct, series: history.map((h) => h.errorRate), color: COLORS.rose },
    { label: labels.connections, value: latest?.connections ?? 0, unit: "", series: history.map((h) => h.connections), color: COLORS.emerald },
    { label: labels.throughput, value: latest?.throughput ?? 0, unit: labels.unitMbps, series: history.map((h) => h.throughput), color: COLORS.cyan },
  ];

  const instances = latest?.instances ?? [];
  const slow = latest?.slow ?? [];
  const healthyCount = instances.filter((i) => i.status === "healthy").length;

  return (
    <div
      ref={wrapRef}
      className={cn(
        "rounded-2xl border border-cyan-400/20 bg-[#05070d] p-4 text-slate-200 shadow-[0_0_60px_-30px_rgba(34,211,238,0.8)] sm:p-5",
        fullscreen &&
          "flex h-screen w-full flex-col overflow-y-auto rounded-none border-0",
      )}
    >
      <header className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-100">
            {labels.title}
          </h2>
          <p className="text-xs text-slate-500">{labels.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm tabular-nums text-slate-400">
            {latest ? formatClock(latest.at) : "--:--:--"}
          </span>
          <span
            className={
              paused
                ? "inline-flex items-center gap-1.5 rounded-full border border-slate-600/50 bg-slate-800/60 px-3 py-1 text-xs text-slate-400"
                : "inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300"
            }
          >
            <span
              className={
                paused
                  ? "h-1.5 w-1.5 rounded-full bg-slate-400"
                  : "h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"
              }
            />
            {paused ? labels.paused : labels.live}
          </span>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            {paused ? labels.resume : labels.pause}
          </button>
          {dropped > 0 ? (
            <span
              title={labels.dropped.replace("{count}", String(dropped))}
              className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-400/10 px-2.5 py-1 font-mono text-[11px] tabular-nums text-rose-300"
            >
              {labels.dropped.replace("{count}", String(dropped))}
            </span>
          ) : null}
          <button
            type="button"
            aria-label={fullscreen ? labels.exitFullscreen : labels.fullscreen}
            title={fullscreen ? labels.exitFullscreen : labels.fullscreen}
            onClick={toggleFullscreen}
            className="grid size-7 place-items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            {fullscreen ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
          </button>
        </div>
      </header>

      <div className="grid shrink-0 grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div
        className={cn(
          "mt-3 grid gap-3 lg:grid-cols-3",
          fullscreen ? "min-h-0 flex-1" : "lg:h-[280px]",
        )}
      >
        <Panel
          title={labels.traffic}
          hint={labels.qps}
          className="lg:col-span-2"
        >
          <Chart option={trafficOption} className="h-60 w-full lg:h-full" />
        </Panel>

        <Panel title={labels.resources} bodyClassName="flex gap-2 overflow-hidden">
          <div className="min-w-0 flex-1">
            <Chart
              option={gauge(latest?.cpu ?? 0, COLORS.cyan, labels.cpu)}
              className="h-40 w-full lg:h-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Chart
              option={gauge(latest?.memory ?? 0, COLORS.violet, labels.memory)}
              className="h-40 w-full lg:h-full"
            />
          </div>
        </Panel>
      </div>

      <div
        className={cn(
          "mt-3 grid gap-3 lg:grid-cols-3",
          fullscreen ? "min-h-0 flex-1" : "lg:h-[280px]",
        )}
      >
        <Panel
          title={labels.bandwidth}
          hint={`${latest?.bandwidth.inMbps ?? 0} ${labels.bandwidthIn} · ${latest?.bandwidth.outMbps ?? 0} ${labels.bandwidthOut} ${labels.unitMbps}`}
          className="lg:col-span-2"
        >
          <Chart option={bandwidthOption} className="h-48 w-full lg:h-full" />
        </Panel>

        <Panel
          title={labels.instances}
          hint={`${healthyCount}/${instances.length} ${labels.healthy}`}
          className="@container"
        >
          <div className="grid grid-cols-2 gap-1.5 @md:grid-cols-4">
            {instances.map((instance) => {
              const meta = INSTANCE_STATUS_META[instance.status];
              const statusLabel = labels[instance.status];
              return (
                <div
                  key={instance.id}
                  title={`${instance.id} · ${instance.zone} · ${statusLabel}`}
                  className="flex flex-col justify-center gap-1 rounded-lg border border-cyan-400/10 bg-slate-900/60 px-2 py-1"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate font-mono text-[10px] text-slate-400">
                      {instance.id}
                    </span>
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        meta.dot,
                        instance.status === "offline" && "animate-pulse",
                      )}
                    />
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{
                        width: `${instance.cpu}%`,
                        backgroundColor: meta.bar,
                        opacity: instance.status === "offline" ? 0.4 : 1,
                      }}
                    />
                  </div>
                  <div
                    className={cn(
                      "text-right font-mono text-[9px] tabular-nums",
                      meta.text,
                    )}
                  >
                    {instance.cpu}%
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div
        className={cn(
          "mt-3 grid gap-3 lg:grid-cols-3",
          fullscreen ? "min-h-0 flex-1" : "lg:h-[280px]",
        )}
      >
        <Panel title={labels.slowRequests} hint={`${slow.length}`}>
          <div className="h-48 space-y-1 overflow-y-auto pr-1 font-mono text-xs lg:h-full">
            {slow.length === 0 ? (
              <p className="text-slate-600">…</p>
            ) : (
              slow.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-2 border-b border-white/5 pb-1 last:border-0"
                >
                  <span
                    className={cn(
                      "w-9 shrink-0 font-semibold",
                      METHOD_STYLES[entry.method] ?? "text-slate-400",
                    )}
                  >
                    {entry.method}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-slate-300">
                    {entry.path}
                  </span>
                  <span
                    className={
                      entry.status === 200
                        ? "shrink-0 text-emerald-300"
                        : "shrink-0 text-rose-300"
                    }
                  >
                    {entry.status}
                  </span>
                  <span
                    className={cn(
                      "w-16 shrink-0 text-right font-semibold tabular-nums",
                      entry.ms >= 800 ? "text-rose-300" : "text-amber-300",
                    )}
                  >
                    {entry.ms}ms
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel
          title={labels.eventLog}
          className="lg:col-span-2"
          hint={`${logs.length}`}
        >
          <div className="h-48 space-y-1 overflow-y-auto pr-1 font-mono text-xs lg:h-full">
            {logs.length === 0 ? (
              <p className="text-slate-600">…</p>
            ) : (
              logs.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-2 border-b border-white/5 pb-1 last:border-0"
                >
                  <span className="shrink-0 text-slate-600">
                    {formatClock(entry.at)}
                  </span>
                  <span className={`shrink-0 uppercase ${LEVEL_STYLES[entry.level]}`}>
                    {entry.level}
                  </span>
                  <span className="min-w-0 truncate text-slate-300">
                    {entry.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
