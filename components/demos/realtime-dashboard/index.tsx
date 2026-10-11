"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";

import { Chart } from "./chart";
import { KpiCard, Panel, withAlpha } from "./panels";
import { useMetrics } from "./use-metrics";

export type DashboardLabels = {
  title: string;
  subtitle: string;
  live: string;
  paused: string;
  pause: string;
  resume: string;
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
  statusCodes: string;
  endpoints: string;
  regions: string;
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

export function RealtimeDashboard({ labels }: { labels: DashboardLabels }) {
  const [paused, setPaused] = useState(false);
  const { latest, history, logs } = useMetrics({
    paused,
    regionNames: labels.regionNames,
  });

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
    };
  }, [history, times, labels]);

  const statusOption = useMemo<EChartsOption>(() => {
    const status = latest?.status ?? { ok: 0, client: 0, server: 0 };
    return {
      animation: false,
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(2,6,23,0.92)",
        borderColor: "rgba(34,211,238,0.35)",
        textStyle: { color: "#e2e8f0", fontSize: 11 },
      },
      legend: {
        bottom: 0,
        textStyle: { color: "#94a3b8", fontSize: 11 },
        itemWidth: 12,
        itemHeight: 8,
      },
      series: [
        {
          type: "pie",
          radius: ["55%", "78%"],
          center: ["50%", "44%"],
          itemStyle: { borderColor: "#020617", borderWidth: 2 },
          label: { show: false },
          data: [
            { name: "2xx", value: status.ok, itemStyle: { color: COLORS.emerald } },
            { name: "4xx", value: status.client, itemStyle: { color: COLORS.amber } },
            { name: "5xx", value: status.server, itemStyle: { color: COLORS.rose } },
          ],
        },
      ],
    };
  }, [latest]);

  const endpointsOption = useMemo<EChartsOption>(() => {
    const endpoints = latest?.endpoints ?? [];
    return {
      animation: false,
      grid: { left: 92, right: 40, top: 6, bottom: 6 },
      xAxis: { type: "value", show: false },
      yAxis: {
        type: "category",
        inverse: true,
        data: endpoints.map((e) => e.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
      },
      series: [
        {
          type: "bar",
          data: endpoints.map((e) => e.rps),
          barWidth: 9,
          itemStyle: {
            borderRadius: 5,
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: withAlpha(COLORS.cyan, 0.35) },
                { offset: 1, color: COLORS.cyan },
              ],
            },
          },
          label: {
            show: true,
            position: "right",
            color: "#cbd5e1",
            fontSize: 10,
          },
        },
      ],
    };
  }, [latest]);

  const regionsOption = useMemo<EChartsOption>(() => {
    const regions = latest?.regions ?? [];
    return {
      animation: false,
      grid: { left: 34, right: 12, top: 16, bottom: 22 },
      xAxis: {
        type: "category",
        data: regions.map((r) => r.name),
        axisLine: { lineStyle: { color: GRID_LINE } },
        axisTick: { show: false },
        axisLabel: { color: AXIS_TEXT, fontSize: 10 },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: AXIS_TEXT, fontSize: 10 },
        splitLine: { lineStyle: { color: GRID_LINE, type: "dashed" } },
      },
      series: [
        {
          type: "bar",
          data: regions.map((r) => r.value),
          barWidth: 18,
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: COLORS.violet },
                { offset: 1, color: withAlpha(COLORS.violet, 0.15) },
              ],
            },
          },
        },
      ],
    };
  }, [latest]);

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

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-[#05070d] p-4 text-slate-200 shadow-[0_0_60px_-30px_rgba(34,211,238,0.8)] sm:p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Panel
          title={labels.traffic}
          hint={labels.qps}
          className="lg:col-span-2"
        >
          <Chart option={trafficOption} className="h-64 w-full" />
        </Panel>

        <Panel title={labels.resources} bodyClassName="flex gap-2 overflow-hidden">
          <div className="min-w-0 flex-1">
            <Chart
              option={gauge(latest?.cpu ?? 0, COLORS.cyan, labels.cpu)}
              className="h-40 w-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Chart
              option={gauge(latest?.memory ?? 0, COLORS.violet, labels.memory)}
              className="h-40 w-full"
            />
          </div>
        </Panel>

        <Panel title={labels.statusCodes}>
          <Chart option={statusOption} className="h-56 w-full" />
        </Panel>

        <Panel title={labels.endpoints}>
          <Chart option={endpointsOption} className="h-56 w-full" />
        </Panel>

        <Panel title={labels.regions}>
          <Chart option={regionsOption} className="h-56 w-full" />
        </Panel>
      </div>

      <Panel title={labels.eventLog} className="mt-3" hint={`${logs.length}`}>
        <div className="h-44 space-y-1 overflow-y-auto pr-1 font-mono text-xs">
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
  );
}
