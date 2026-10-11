"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";

import { cn } from "@/lib/utils";

import { Chart } from "./chart";

export function withAlpha(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Panel({
  title,
  hint,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  hint?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-xl border border-cyan-400/15 bg-slate-950/70 p-4 shadow-[0_0_30px_-18px_rgba(34,211,238,0.6)]",
        className,
      )}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <span className="h-3 w-1 rounded-full bg-cyan-400" />
          {title}
        </h3>
        {hint ? (
          <span className="shrink-0 text-xs text-slate-500">{hint}</span>
        ) : null}
      </header>
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}

export function KpiCard({
  label,
  value,
  unit,
  series,
  color,
}: {
  label: string;
  value: string | number;
  unit?: string;
  series: number[];
  color: string;
}) {
  const option = useMemo<EChartsOption>(() => {
    return {
      animation: false,
      grid: { left: 0, right: 0, top: 4, bottom: 0 },
      xAxis: {
        type: "category",
        show: false,
        boundaryGap: false,
        data: series.map((_, i) => i),
      },
      yAxis: {
        type: "value",
        show: false,
        min: "dataMin",
        max: "dataMax",
      },
      series: [
        {
          type: "line",
          data: series,
          smooth: true,
          symbol: "none",
          lineStyle: { width: 1.6, color },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: withAlpha(color, 0.45) },
                { offset: 1, color: withAlpha(color, 0) },
              ],
            },
          },
        },
      ],
    };
  }, [series, color]);

  return (
    <div className="rounded-xl border border-cyan-400/15 bg-slate-950/70 p-3 shadow-[0_0_30px_-20px_rgba(34,211,238,0.7)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400">{label}</span>
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className="font-mono text-2xl font-semibold tabular-nums"
          style={{ color }}
        >
          {value}
        </span>
        {unit ? <span className="text-xs text-slate-500">{unit}</span> : null}
      </div>
      <Chart option={option} className="mt-1 h-9 w-full" />
    </div>
  );
}
