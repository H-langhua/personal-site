"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Graph, Node } from "@antv/x6";
import {
  Download,
  DownloadCloud,
  Focus,
  Image as ImageIcon,
  Loader2,
  Maximize,
  Minus,
  Plus,
  Redo2,
  RotateCcw,
  Trash2,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EditorLabels = {
  palette: string;
  dragHint: string;
  properties: string;
  label: string;
  noSelection: string;
  undo: string;
  redo: string;
  delete: string;
  fit: string;
  zoomIn: string;
  zoomOut: string;
  exportJson: string;
  exportPng: string;
  clear: string;
  loadSample: string;
  nodes: {
    start: string;
    process: string;
    decision: string;
    data: string;
    end: string;
  };
};

type NodeKind = keyof EditorLabels["nodes"];

type NodeData = { kind: NodeKind; label: string };

const KIND_META: Record<NodeKind, { color: string; ring: string }> = {
  start: { color: "#34d399", ring: "rgba(52,211,153,0.35)" },
  process: { color: "#60a5fa", ring: "rgba(96,165,250,0.35)" },
  decision: { color: "#fbbf24", ring: "rgba(251,191,36,0.35)" },
  data: { color: "#a78bfa", ring: "rgba(167,139,250,0.35)" },
  end: { color: "#fb7185", ring: "rgba(251,113,133,0.35)" },
};

const KINDS: NodeKind[] = ["start", "process", "decision", "data", "end"];

const PORTS = {
  groups: {
    in: {
      position: "left",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#64748b",
          strokeWidth: 1.5,
          fill: "#0b0f19",
        },
      },
    },
    out: {
      position: "right",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#64748b",
          strokeWidth: 1.5,
          fill: "#0b0f19",
        },
      },
    },
  },
  items: [{ group: "in" }, { group: "out" }],
};

let registered = false;

function FlowNode({ node }: { node: Node }) {
  const data = (node.getData() ?? {}) as Partial<NodeData>;
  const kind = data.kind ?? "process";
  const meta = KIND_META[kind];

  return (
    <div
      className="flex h-full w-full items-center gap-2 rounded-lg border bg-card px-3 text-sm text-card-foreground shadow-sm"
      style={{ borderColor: meta.ring }}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      <span className="truncate font-medium">{data.label}</span>
    </div>
  );
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function X6Editor({ labels }: { labels: EditorLabels }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [ready, setReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [labelValue, setLabelValue] = useState("");

  const addNode = useCallback(
    (kind: NodeKind, x: number, y: number) => {
      const graph = graphRef.current;
      if (!graph) return;
      const node = graph.addNode({
        shape: "flow-node",
        x: x - 88,
        y: y - 26,
        data: { kind, label: labels.nodes[kind] } satisfies NodeData,
        ports: PORTS,
      });
      graph.select(node);
    },
    [labels.nodes],
  );

  useEffect(() => {
    let disposed = false;
    let graph: Graph | null = null;

    (async () => {
      const [core, shapes, history, selection, snapline, keyboard, clipboard, exportPlugin] =
        await Promise.all([
          import("@antv/x6"),
          import("@antv/x6-react-shape"),
          import("@antv/x6-plugin-history"),
          import("@antv/x6-plugin-selection"),
          import("@antv/x6-plugin-snapline"),
          import("@antv/x6-plugin-keyboard"),
          import("@antv/x6-plugin-clipboard"),
          import("@antv/x6-plugin-export"),
        ]);

      if (disposed || !containerRef.current) return;

      if (!registered) {
        shapes.register({
          shape: "flow-node",
          width: 176,
          height: 52,
          component: FlowNode,
          effect: ["data"],
          ports: PORTS,
        });
        registered = true;
      }

      const { Graph: GraphClass, Shape } = core;

      graph = new GraphClass({
        container: containerRef.current,
        autoResize: true,
        background: { color: "transparent" },
        grid: {
          visible: true,
          size: 16,
          type: "dot",
          args: { color: "rgba(148,163,184,0.30)", thickness: 1 },
        },
        panning: true,
        mousewheel: {
          enabled: true,
          modifiers: ["ctrl", "meta"],
          minScale: 0.4,
          maxScale: 2,
        },
        connecting: {
          snap: { radius: 24 },
          allowBlank: false,
          allowLoop: false,
          allowMulti: false,
          highlight: true,
          router: { name: "manhattan" },
          connector: { name: "rounded" },
          createEdge() {
            return new Shape.Edge({
              attrs: {
                line: {
                  stroke: "#64748b",
                  strokeWidth: 1.6,
                  targetMarker: { name: "block", size: 6 },
                },
              },
              zIndex: 0,
            });
          },
        },
        highlighting: {
          magnetAvailable: {
            name: "stroke",
            args: { padding: 3, attrs: { strokeWidth: 3, stroke: "#38bdf8" } },
          },
        },
      });

      graph.use(
        new history.History({ enabled: true, beforeAddCommand: () => true }),
      );
      graph.use(
        new selection.Selection({
          enabled: true,
          rubberband: true,
          showNodeSelectionBox: true,
          multiple: true,
        }),
      );
      graph.use(new snapline.Snapline({ enabled: true }));
      graph.use(new clipboard.Clipboard({ enabled: true }));
      graph.use(new keyboard.Keyboard({ enabled: true }));
      graph.use(new exportPlugin.Export());

      graph.bindKey(["backspace", "delete"], () => {
        const cells = graph!.getSelectedCells();
        if (cells.length) {
          graph!.removeCells(cells);
          return false;
        }
        return true;
      });
      graph.bindKey(["ctrl+c", "meta+c"], () => {
        const cells = graph!.getSelectedCells();
        if (cells.length) {
          graph!.copy(cells);
          return false;
        }
        return true;
      });
      graph.bindKey(["ctrl+v", "meta+v"], () => {
        if (graph!.getCellsInClipboard().length) {
          graph!.paste({ offset: 24 });
          return false;
        }
        return true;
      });
      graph.bindKey(["ctrl+z", "meta+z"], () => {
        if (graph!.canUndo()) {
          graph!.undo();
          return false;
        }
        return true;
      });

      graph.on("node:click", ({ node }) => {
        setSelectedId(node.id);
        setLabelValue((node.getData() as NodeData | undefined)?.label ?? "");
      });
      graph.on("blank:click", () => setSelectedId(null));

      graphRef.current = graph;
      setReady(true);
    })();

    return () => {
      disposed = true;
      graph?.dispose();
      graphRef.current = null;
    };
  }, []);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const kind = event.dataTransfer.getData("application/x-node-kind") as NodeKind;
    const graph = graphRef.current;
    if (!graph || !kind || !KINDS.includes(kind)) return;
    const point = graph.clientToLocal(event.clientX, event.clientY);
    addNode(kind, point.x, point.y);
  };

  const addAtCenter = (kind: NodeKind) => {
    const graph = graphRef.current;
    const container = containerRef.current;
    if (!graph || !container) return;
    const rect = container.getBoundingClientRect();
    const point = graph.clientToLocal(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
    addNode(kind, point.x, point.y);
  };

  const commitLabel = (value: string) => {
    setLabelValue(value);
    const graph = graphRef.current;
    if (!graph || !selectedId) return;
    const node = graph.getCellById(selectedId) as Node | null;
    if (!node) return;
    node.setData({ ...(node.getData() as NodeData), label: value }, { silent: false });
  };

  const applyLabel = () => {
    const graph = graphRef.current;
    if (!graph || !selectedId) return;
    const node = graph.getCellById(selectedId) as Node | null;
    if (!node) return;
    const data = node.getData() as NodeData;
    node.setData({ ...data, label: labelValue });
  };

  const loadSample = () => {
    const graph = graphRef.current;
    if (!graph) return;
    const nodes = [
      { id: "n1", kind: "start" as NodeKind, x: 80, y: 80 },
      { id: "n2", kind: "process" as NodeKind, x: 340, y: 80 },
      { id: "n3", kind: "decision" as NodeKind, x: 600, y: 80 },
      { id: "n4", kind: "data" as NodeKind, x: 340, y: 240 },
      { id: "n5", kind: "end" as NodeKind, x: 600, y: 240 },
    ];
    graph.fromJSON({
      nodes: nodes.map((item) => ({
        id: item.id,
        shape: "flow-node",
        x: item.x,
        y: item.y,
        data: { kind: item.kind, label: labels.nodes[item.kind] },
        ports: PORTS,
      })),
      edges: [
        { source: "n1", target: "n2" },
        { source: "n2", target: "n3" },
        { source: "n2", target: "n4" },
        { source: "n3", target: "n5" },
        { source: "n4", target: "n5" },
      ].map((edge) => ({
        ...edge,
        attrs: {
          line: {
            stroke: "#64748b",
            strokeWidth: 1.6,
            targetMarker: { name: "block", size: 6 },
          },
        },
      })),
    });
    graph.centerContent();
  };

  const exportJson = () => {
    const graph = graphRef.current;
    if (!graph) return;
    download("flow.json", JSON.stringify(graph.toJSON(), null, 2));
  };

  const exportPng = () => {
    const graph = graphRef.current as unknown as {
      exportPNG?: (name: string, options?: Record<string, unknown>) => void;
    } | null;
    graph?.exportPNG?.("flow.png", {
      backgroundColor: "#0b0f19",
      padding: 24,
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)_240px]">
      <aside className="rounded-xl border border-border/60 p-3">
        <p className="px-1 text-sm font-medium">{labels.palette}</p>
        <p className="mt-1 px-1 text-xs text-muted-foreground">
          {labels.dragHint}
        </p>
        <div className="mt-3 space-y-2">
          {KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("application/x-node-kind", kind);
                event.dataTransfer.effectAllowed = "move";
              }}
              onClick={() => addAtCenter(kind)}
              className="flex w-full cursor-grab items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-left text-sm transition-colors hover:border-brand/50 active:cursor-grabbing"
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: KIND_META[kind].color }}
              />
              {labels.nodes[kind]}
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => graphRef.current?.undo()}
          >
            <Undo2 className="size-4" />
            {labels.undo}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => graphRef.current?.redo()}
          >
            <Redo2 className="size-4" />
            {labels.redo}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const graph = graphRef.current;
              if (graph) graph.removeCells(graph.getSelectedCells());
            }}
          >
            <Trash2 className="size-4" />
            {labels.delete}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => graphRef.current?.zoomToFit({ padding: 32, maxScale: 1 })}
          >
            <Maximize className="size-4" />
            {labels.fit}
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={labels.zoomIn}
            title={labels.zoomIn}
            onClick={() => graphRef.current?.zoom(0.1)}
          >
            <Plus className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={labels.zoomOut}
            title={labels.zoomOut}
            onClick={() => graphRef.current?.zoom(-0.1)}
          >
            <Minus className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={exportJson}>
            <Download className="size-4" />
            {labels.exportJson}
          </Button>
          <Button variant="outline" size="sm" onClick={exportPng}>
            <ImageIcon className="size-4" />
            {labels.exportPng}
          </Button>
          <Button variant="outline" size="sm" onClick={loadSample}>
            <RotateCcw className="size-4" />
            {labels.loadSample}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => graphRef.current?.clearCells()}
          >
            <Trash2 className="size-4" />
            {labels.clear}
          </Button>
        </div>

        <div
          className={cn(
            "relative h-[560px] w-full overflow-hidden rounded-xl border border-border/60",
            "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_45%)]",
          )}
        >
          <div
            ref={containerRef}
            onDrop={handleDrop}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            className="h-full w-full"
          />
          {!ready ? (
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Loading canvas…
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <aside className="rounded-xl border border-border/60 p-4">
        <p className="text-sm font-medium">{labels.properties}</p>
        {selectedId ? (
          <div className="mt-4 space-y-2">
            <label
              htmlFor="node-label"
              className="text-xs text-muted-foreground"
            >
              {labels.label}
            </label>
            <input
              id="node-label"
              value={labelValue}
              onChange={(event) => commitLabel(event.target.value)}
              onBlur={applyLabel}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">
            {labels.noSelection}
          </p>
        )}

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Focus className="size-3.5" />
          <span>Ctrl / Cmd + 滚轮缩放 · 拖拽平移</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <DownloadCloud className="size-3.5" />
          <span>Delete 删除 · Ctrl+C / Ctrl+V · Ctrl+Z 撤销</span>
        </div>
      </aside>
    </div>
  );
}
