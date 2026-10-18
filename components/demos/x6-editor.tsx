"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Cell, Edge, Graph, Node } from "@antv/x6";
import type { MiniMap } from "@antv/x6-plugin-minimap";
import {
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  Check,
  CircleStop,
  CopyPlus,
  Database,
  FileCode2,
  FileJson,
  GitBranch,
  Image as ImageIcon,
  Keyboard,
  Loader2,
  Map as MapIcon,
  Maximize,
  Maximize2,
  Minimize2,
  Minus,
  Play,
  Plus,
  Redo2,
  RotateCcw,
  Settings2,
  Square,
  SquareDashed,
  Trash2,
  Undo2,
  Upload,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EditorLabels = {
  palette: string;
  dragHint: string;
  properties: string;
  label: string;
  kind: string;
  edgeLabel: string;
  noSelection: string;
  undo: string;
  redo: string;
  delete: string;
  duplicate: string;
  fit: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  minimap: string;
  exportJson: string;
  exportPng: string;
  exportSvg: string;
  importJson: string;
  importFailed: string;
  clear: string;
  loadSample: string;
  run: string;
  stopRun: string;
  runProgress: string;
  runDone: string;
  fullscreen: string;
  exitFullscreen: string;
  loading: string;
  emptyHint: string;
  align: string;
  alignHint: string;
  alignLeft: string;
  alignCenterX: string;
  alignRight: string;
  alignTop: string;
  alignCenterY: string;
  alignBottom: string;
  selectionCount: string;
  nodeCount: string;
  edgeCount: string;
  shortcuts: string;
  shortcutNav: string;
  shortcutEdit: string;
  shortcutHistory: string;
  shortcutSelect: string;
  branchYes: string;
  branchNo: string;
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

type AlignMode = "left" | "centerX" | "right" | "top" | "centerY" | "bottom";

type SelectionPanel =
  | { type: "none" }
  | { type: "node"; id: string; kind: NodeKind }
  | { type: "edge"; id: string }
  | { type: "multi"; count: number; nodes: number };

type RunItem = { id: string; kind: "node" | "edge" };

type RunState = { done: boolean; label: string; index: number; total: number };

type UiStats = {
  canUndo: boolean;
  canRedo: boolean;
  nodes: number;
  edges: number;
  selected: number;
  zoom: number;
};

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2;

const RUN_NODE_MS = 640;
const RUN_EDGE_MS = 520;
const RUN_DONE_LINGER = 1500;

const KIND_META: Record<
  NodeKind,
  { color: string; ring: string; soft: string; icon: LucideIcon }
> = {
  start: {
    color: "#34d399",
    ring: "rgba(52,211,153,0.35)",
    soft: "rgba(52,211,153,0.14)",
    icon: Play,
  },
  process: {
    color: "#60a5fa",
    ring: "rgba(96,165,250,0.35)",
    soft: "rgba(96,165,250,0.14)",
    icon: Settings2,
  },
  decision: {
    color: "#fbbf24",
    ring: "rgba(251,191,36,0.35)",
    soft: "rgba(251,191,36,0.14)",
    icon: GitBranch,
  },
  data: {
    color: "#a78bfa",
    ring: "rgba(167,139,250,0.35)",
    soft: "rgba(167,139,250,0.14)",
    icon: Database,
  },
  end: {
    color: "#fb7185",
    ring: "rgba(251,113,133,0.35)",
    soft: "rgba(251,113,133,0.14)",
    icon: CircleStop,
  },
};

const KINDS: NodeKind[] = ["start", "process", "decision", "data", "end"];

const PORTS = {
  groups: {
    in: {
      position: "left",
      attrs: {
        circle: {
          r: 3.5,
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
          r: 3.5,
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

const EDGE_STROKE = "#64748b";

const EDGE_LINE_ATTRS = {
  stroke: EDGE_STROKE,
  strokeWidth: 1.5,
  targetMarker: { name: "block", size: 6 },
};

const EDGE_LABEL_ATTRS = {
  label: { fill: "#94a3b8", fontSize: 10, fontWeight: 500 },
  body: { fill: "rgba(100,116,139,0.16)", stroke: "none", rx: 3 },
};

let registered = false;

function FlowNode({ node }: { node: Node }) {
  const data = (node.getData() ?? {}) as Partial<NodeData>;
  const kind = data.kind ?? "process";
  const meta = KIND_META[kind] ?? KIND_META.process;
  const Icon = meta.icon;

  return (
    <div
      className="flow-node-card flex h-full w-full items-center gap-2.5 rounded-xl border bg-card px-3 shadow-sm"
      style={{ borderColor: meta.ring }}
    >
      <span
        className="grid size-6 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: meta.soft, color: meta.color }}
      >
        <Icon className="size-3.5" />
      </span>
      <span className="truncate text-sm font-medium">{data.label}</span>
    </div>
  );
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
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

function edgeLabelText(edge: Edge): string {
  const labels = edge.getLabels();
  const attrs = labels[0]?.attrs as { label?: { text?: string } } | undefined;
  return attrs?.label?.text ?? "";
}

function buildEdgeLabel(text: string) {
  return {
    attrs: {
      label: { ...EDGE_LABEL_ATTRS.label, text },
      body: { ...EDGE_LABEL_ATTRS.body },
    },
  };
}

function setEdgeLabel(edge: Edge, text: string) {
  edge.setLabels(text.trim() ? [buildEdgeLabel(text)] : []);
}

function markSelection(graph: Graph, cell: Cell, selected: boolean) {
  const view = graph.findViewByCell(cell);
  if (!view) return;
  const className = cell.isNode() ? "flow-node-selected" : "flow-edge-selected";
  if (selected) view.addClass(className);
  else view.removeClass(className);
}

const RUN_NODE_CLASSES = ["flow-node-running", "flow-node-passed"] as const;
const RUN_EDGE_CLASSES = ["flow-edge-flowing", "flow-edge-passed"] as const;

function brandColor(): string {
  if (typeof window === "undefined") return EDGE_STROKE;
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--brand")
      .trim() || EDGE_STROKE
  );
}

function paintEdge(edge: Edge, color: string) {
  edge.attr("line/stroke", color, { ignoreHistory: true });
  edge.attr(
    "line/targetMarker",
    { name: "block", size: 6, fill: color },
    { ignoreHistory: true },
  );
}

function setRunState(graph: Graph, item: RunItem, state: "active" | "passed") {
  const cell = graph.getCellById(item.id);
  if (!cell) return;
  const view = graph.findViewByCell(cell);
  if (!view) return;

  if (item.kind === "node") {
    const [active, passed] = RUN_NODE_CLASSES;
    if (state === "active") {
      view.removeClass(passed);
      view.addClass(active);
    } else {
      view.removeClass(active);
      view.addClass(passed);
    }
    return;
  }

  const edge = cell as Edge;
  const [flowing, passed] = RUN_EDGE_CLASSES;
  if (state === "active") {
    view.removeClass(passed);
    view.addClass(flowing);
  } else {
    view.removeClass(flowing);
    view.addClass(passed);
  }
  paintEdge(edge, brandColor());
}

function clearRunState(graph: Graph, plan: RunItem[]) {
  plan.forEach((item) => {
    const cell = graph.getCellById(item.id);
    if (!cell) return;
    const view = graph.findViewByCell(cell);
    if (item.kind === "node") {
      view?.removeClass(RUN_NODE_CLASSES[0]);
      view?.removeClass(RUN_NODE_CLASSES[1]);
    } else {
      view?.removeClass(RUN_EDGE_CLASSES[0]);
      view?.removeClass(RUN_EDGE_CLASSES[1]);
      paintEdge(cell as Edge, EDGE_STROKE);
    }
  });
}

function pickOutgoingEdge(
  graph: Graph,
  node: Node,
  yesLabel: string,
): Edge | null {
  const outgoing = graph.getOutgoingEdges(node) ?? [];
  const preferred = outgoing.find((edge) => edgeLabelText(edge) === yesLabel);
  return preferred ?? outgoing[0] ?? null;
}

function duplicateSelection(graph: Graph) {
  const cells = graph.getSelectedCells();
  if (cells.length === 0) return;
  graph.copy(cells);
  const pasted = graph.paste({ offset: 28 });
  if (pasted.length > 0) {
    graph.cleanSelection();
    graph.select(pasted);
  }
}

function alignNodes(graph: Graph, mode: AlignMode) {
  const nodes = graph
    .getSelectedCells()
    .filter((cell): cell is Node => cell.isNode());
  if (nodes.length < 2) return;

  const boxes = nodes.map((node) => ({ node, box: node.getBBox() }));
  const left = Math.min(...boxes.map((item) => item.box.x));
  const right = Math.max(...boxes.map((item) => item.box.x + item.box.width));
  const top = Math.min(...boxes.map((item) => item.box.y));
  const bottom = Math.max(...boxes.map((item) => item.box.y + item.box.height));
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;

  graph.batchUpdate("align", () => {
    boxes.forEach(({ node, box }) => {
      switch (mode) {
        case "left":
          node.setPosition(left, box.y);
          break;
        case "centerX":
          node.setPosition(centerX - box.width / 2, box.y);
          break;
        case "right":
          node.setPosition(right - box.width, box.y);
          break;
        case "top":
          node.setPosition(box.x, top);
          break;
        case "centerY":
          node.setPosition(box.x, centerY - box.height / 2);
          break;
        case "bottom":
          node.setPosition(box.x, bottom - box.height);
          break;
      }
    });
  });
}

export function X6Editor({ labels }: { labels: EditorLabels }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapHostRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const labelsRef = useRef(labels);

  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState<UiStats>({
    canUndo: false,
    canRedo: false,
    nodes: 0,
    edges: 0,
    selected: 0,
    zoom: 1,
  });
  const [panel, setPanel] = useState<SelectionPanel>({ type: "none" });
  const [labelValue, setLabelValue] = useState("");
  const [minimapOn, setMinimapOn] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [importError, setImportError] = useState(false);
  const [run, setRun] = useState<RunState | null>(null);
  const runTimerRef = useRef<number | null>(null);
  const runTokenRef = useRef(0);
  const runPlanRef = useRef<RunItem[]>([]);

  useEffect(() => {
    labelsRef.current = labels;
  }, [labels]);

  useEffect(() => {
    let disposed = false;
    let graph: Graph | null = null;

    (async () => {
      const [
        core,
        shapes,
        history,
        selection,
        snapline,
        keyboard,
        clipboard,
        exportPlugin,
        transformPlugin,
      ] = await Promise.all([
        import("@antv/x6"),
        import("@antv/x6-react-shape"),
        import("@antv/x6-plugin-history"),
        import("@antv/x6-plugin-selection"),
        import("@antv/x6-plugin-snapline"),
        import("@antv/x6-plugin-keyboard"),
        import("@antv/x6-plugin-clipboard"),
        import("@antv/x6-plugin-export"),
        import("@antv/x6-plugin-transform"),
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
        scaling: { min: ZOOM_MIN, max: ZOOM_MAX },
        grid: {
          visible: true,
          size: 16,
          type: "dot",
          args: { color: "rgba(148,163,184,0.28)", thickness: 1 },
        },
        panning: true,
        mousewheel: {
          enabled: true,
          modifiers: ["ctrl", "meta"],
          minScale: ZOOM_MIN,
          maxScale: ZOOM_MAX,
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
              attrs: { line: { ...EDGE_LINE_ATTRS } },
              zIndex: 0,
            });
          },
        },
        highlighting: {
          magnetAvailable: {
            name: "stroke",
            args: { padding: 3, attrs: { strokeWidth: 3, stroke: "#38bdf8" } },
          },
          magnetAdsorbed: {
            name: "stroke",
            args: { padding: 3, attrs: { strokeWidth: 3, stroke: "#34d399" } },
          },
        },
      });

      graph.use(
        new history.History({
          enabled: true,
          beforeAddCommand: (_event, args) =>
            !(args as { options?: { ignoreHistory?: boolean } } | undefined)
              ?.options?.ignoreHistory,
        }),
      );
      graph.use(
        new selection.Selection({
          enabled: true,
          rubberband: true,
          multiple: true,
          showNodeSelectionBox: false,
        }),
      );
      graph.use(new snapline.Snapline({ enabled: true, tolerance: 8 }));
      graph.use(new clipboard.Clipboard({ enabled: true }));
      graph.use(new keyboard.Keyboard({ enabled: true }));
      graph.use(new exportPlugin.Export());
      graph.use(
        new transformPlugin.Transform({
          rotating: false,
          resizing: {
            enabled: true,
            orthogonal: false,
            minWidth: 140,
            maxWidth: 360,
            minHeight: 44,
            maxHeight: 140,
            allowReverse: false,
          },
        }),
      );

      const syncStats = () => {
        if (!graph) return;
        setStats({
          canUndo: graph.canUndo(),
          canRedo: graph.canRedo(),
          nodes: graph.getNodes().length,
          edges: graph.getEdges().length,
          selected: graph.getSelectedCellCount(),
          zoom: graph.zoom(),
        });
      };

      const syncPanel = () => {
        if (!graph) return;
        const cells = graph.getSelectedCells();
        if (cells.length === 1 && cells[0].isNode()) {
          const node = cells[0] as Node;
          const data = node.getData() as NodeData | undefined;
          setPanel({ type: "node", id: node.id, kind: data?.kind ?? "process" });
          setLabelValue(data?.label ?? "");
        } else if (cells.length === 1 && cells[0].isEdge()) {
          const edge = cells[0] as Edge;
          setPanel({ type: "edge", id: edge.id });
          setLabelValue(edgeLabelText(edge));
        } else if (cells.length > 1) {
          setPanel({
            type: "multi",
            count: cells.length,
            nodes: cells.filter((cell) => cell.isNode()).length,
          });
        } else {
          setPanel({ type: "none" });
        }
      };

      const handleSelectionChanged = () => {
        if (!graph) return;
        syncStats();
        syncPanel();
        const cells = graph.getSelectedCells();
        if (cells.length === 1 && cells[0].isNode()) {
          graph.createTransformWidget(cells[0] as Node);
        } else {
          graph.clearTransformWidgets();
        }
      };

      graph.on("selection:changed", handleSelectionChanged);
      (
        [
          "history:change",
          "cell:added",
          "cell:removed",
          "scale",
          "model:reseted",
        ] as const
      ).forEach((name) => graph?.on(name, syncStats));
      graph.on("cell:selected", ({ cell }) => {
        if (graph) markSelection(graph, cell, true);
      });
      graph.on("cell:unselected", ({ cell }) => {
        if (graph) markSelection(graph, cell, false);
      });

      graph.bindKey(["backspace", "delete"], (event) => {
        if (isEditableTarget(event.target)) return true;
        if (!graph) return true;
        const cells = graph.getSelectedCells();
        if (cells.length) {
          graph.removeCells(cells);
          return false;
        }
        return true;
      });
      graph.bindKey(["ctrl+c", "meta+c"], (event) => {
        if (isEditableTarget(event.target)) return true;
        if (!graph) return true;
        const cells = graph.getSelectedCells();
        if (cells.length) {
          graph.copy(cells);
          return false;
        }
        return true;
      });
      graph.bindKey(["ctrl+v", "meta+v"], (event) => {
        if (isEditableTarget(event.target)) return true;
        if (!graph) return true;
        if (graph.getCellsInClipboard().length) {
          graph.paste({ offset: 24 });
          return false;
        }
        return true;
      });
      graph.bindKey(["ctrl+d", "meta+d"], (event) => {
        if (isEditableTarget(event.target)) return true;
        if (graph) duplicateSelection(graph);
        return false;
      });
      graph.bindKey(["ctrl+z", "meta+z"], (event) => {
        if (isEditableTarget(event.target)) return true;
        if (!graph) return true;
        if (graph.canUndo()) {
          graph.undo();
          return false;
        }
        return true;
      });
      graph.bindKey(
        ["ctrl+shift+z", "meta+shift+z", "ctrl+y", "meta+y"],
        (event) => {
          if (isEditableTarget(event.target)) return true;
          if (!graph) return true;
          if (graph.canRedo()) {
            graph.redo();
            return false;
          }
          return true;
        },
      );
      graph.bindKey(["ctrl+a", "meta+a"], (event) => {
        if (isEditableTarget(event.target)) return true;
        if (graph) graph.select(graph.getCells());
        return false;
      });
      graph.bindKey(["esc", "escape"], (event) => {
        if (isEditableTarget(event.target)) return true;
        if (graph) graph.cleanSelection();
        return false;
      });

      graphRef.current = graph;
      setReady(true);
    })();

    return () => {
      disposed = true;
      runTokenRef.current += 1;
      if (runTimerRef.current !== null) {
        window.clearTimeout(runTimerRef.current);
        runTimerRef.current = null;
      }
      graph?.dispose();
      graphRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !minimapOn) return;
    let disposed = false;
    let minimap: MiniMap | null = null;

    (async () => {
      const graph = graphRef.current;
      const host = minimapHostRef.current;
      if (!graph || !host) return;
      const { MiniMap: MiniMapClass } = await import(
        "@antv/x6-plugin-minimap"
      );
      if (disposed || !graphRef.current) return;
      minimap = new MiniMapClass({
        container: host,
        width: 168,
        height: 104,
        padding: 12,
        scalable: true,
      });
      graph.use(minimap);
    })();

    return () => {
      disposed = true;
      minimap?.dispose();
    };
  }, [ready, minimapOn]);

  useEffect(() => {
    const handle = () => {
      setFullscreen(document.fullscreenElement === wrapRef.current);
    };
    document.addEventListener("fullscreenchange", handle);
    return () => document.removeEventListener("fullscreenchange", handle);
  }, []);

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
      graph.cleanSelection();
      graph.select(node);
    },
    [labels.nodes],
  );

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const kind = event.dataTransfer.getData(
      "application/x-node-kind",
    ) as NodeKind;
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
    if (!graph || panel.type === "none" || panel.type === "multi") return;
    const cell = graph.getCellById(panel.id);
    if (!cell) return;
    if (cell.isNode()) {
      cell.setData({ ...(cell.getData() as NodeData), label: value });
    } else if (cell.isEdge()) {
      setEdgeLabel(cell as Edge, value);
    }
  };

  const switchKind = (kind: NodeKind) => {
    const graph = graphRef.current;
    if (!graph || panel.type !== "node") return;
    const cell = graph.getCellById(panel.id);
    if (!cell || !cell.isNode()) return;
    cell.setData({ ...(cell.getData() as NodeData), kind });
    setPanel({ type: "node", id: panel.id, kind });
  };

  const deleteSelection = () => {
    const graph = graphRef.current;
    if (!graph) return;
    graph.removeCells(graph.getSelectedCells());
  };

  const duplicateSelected = () => {
    const graph = graphRef.current;
    if (graph) duplicateSelection(graph);
  };

  const fitView = () =>
    graphRef.current?.zoomToFit({ padding: 32, maxScale: 1 });

  const zoomIn = () => {
    const graph = graphRef.current;
    if (!graph) return;
    graph.zoom(Math.min(0.1, ZOOM_MAX - graph.zoom()));
  };

  const zoomOut = () => {
    const graph = graphRef.current;
    if (!graph) return;
    graph.zoom(Math.max(-0.1, ZOOM_MIN - graph.zoom()));
  };

  const resetZoom = () => graphRef.current?.zoomTo(1);

  const exportJson = () => {
    const graph = graphRef.current;
    if (!graph) return;
    download("flow.json", JSON.stringify(graph.toJSON(), null, 2));
  };

  const exportPng = () => {
    const graph = graphRef.current;
    if (!graph) return;
    graph.exportPNG("flow.png", {
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#0b0f19"
        : "#ffffff",
      padding: 24,
    });
  };

  const exportSvg = () => {
    const graph = graphRef.current;
    if (!graph) return;
    graph.exportSVG("flow.svg", { preserveDimensions: true });
  };

  const stopRun = useCallback((clear = true) => {
    runTokenRef.current += 1;
    if (runTimerRef.current !== null) {
      window.clearTimeout(runTimerRef.current);
      runTimerRef.current = null;
    }
    const graph = graphRef.current;
    if (clear && graph) clearRunState(graph, runPlanRef.current);
    runPlanRef.current = [];
    setRun(null);
  }, []);

  const buildRunPlan = useCallback((graph: Graph): RunItem[] => {
    const nodes = graph.getNodes();
    if (!nodes.length) return [];
    const byId = new Map(nodes.map((node) => [node.id, node]));
    const start =
      nodes.find(
        (node) => (node.getData() as NodeData | undefined)?.kind === "start",
      ) ?? nodes[0];
    const plan: RunItem[] = [];
    const visited = new Set<string>();
    let current: Node | null = start;
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      plan.push({ id: current.id, kind: "node" });
      const edge = pickOutgoingEdge(graph, current, labelsRef.current.branchYes);
      if (!edge) break;
      plan.push({ id: edge.id, kind: "edge" });
      current = byId.get(edge.getTargetCellId()) ?? null;
    }
    return plan;
  }, []);

  const startRun = useCallback(() => {
    const graph = graphRef.current;
    if (!graph) return;
    stopRun(false);
    const plan = buildRunPlan(graph);
    if (!plan.length) return;
    runPlanRef.current = plan;
    runTokenRef.current += 1;
    const token = runTokenRef.current;
    let index = 0;

    const step = () => {
      if (runTokenRef.current !== token) return;
      const item = plan[index];
      if (!item) {
        setRun((prev) => (prev ? { ...prev, done: true } : prev));
        runTimerRef.current = window.setTimeout(() => {
          if (runTokenRef.current !== token) return;
          clearRunState(graph, plan);
          runPlanRef.current = [];
          setRun(null);
        }, RUN_DONE_LINGER);
        return;
      }
      const cell = graph.getCellById(item.id);
      if (!cell) {
        stopRun();
        return;
      }
      const previous = plan[index - 1];
      if (previous) setRunState(graph, previous, "passed");
      setRunState(graph, item, "active");
      const label = cell.isNode()
        ? ((cell.getData() as NodeData | undefined)?.label ?? "")
        : edgeLabelText(cell as Edge);
      setRun({ done: false, label, index: index + 1, total: plan.length });
      index += 1;
      runTimerRef.current = window.setTimeout(
        step,
        cell.isNode() ? RUN_NODE_MS : RUN_EDGE_MS,
      );
    };

    step();
  }, [buildRunPlan, stopRun]);

  const handleImportFile = async (file: File) => {
    const graph = graphRef.current;
    if (!graph) return;
    stopRun();
    try {
      const data = JSON.parse(await file.text()) as Parameters<
        Graph["fromJSON"]
      >[0];
      graph.fromJSON(data);
      graph.cleanSelection();
      graph.centerContent();
      setImportError(false);
    } catch {
      setImportError(true);
    }
  };

  const loadSample = () => {
    const graph = graphRef.current;
    if (!graph) return;
    stopRun();
    const dict = labelsRef.current;
    const nodes = [
      { id: "n1", kind: "start" as NodeKind, x: 80, y: 140 },
      { id: "n2", kind: "process" as NodeKind, x: 330, y: 140 },
      { id: "n3", kind: "decision" as NodeKind, x: 580, y: 140 },
      { id: "n4", kind: "data" as NodeKind, x: 580, y: 320 },
      { id: "n5", kind: "end" as NodeKind, x: 860, y: 140 },
    ];
    graph.fromJSON({
      nodes: nodes.map((item) => ({
        id: item.id,
        shape: "flow-node",
        x: item.x,
        y: item.y,
        data: { kind: item.kind, label: dict.nodes[item.kind] },
        ports: PORTS,
      })),
      edges: [
        { source: "n1", target: "n2" },
        { source: "n2", target: "n3" },
        { source: "n3", target: "n5", label: dict.branchYes },
        { source: "n3", target: "n4", label: dict.branchNo },
        { source: "n4", target: "n5" },
      ].map((edge) => ({
        source: edge.source,
        target: edge.target,
        attrs: { line: { ...EDGE_LINE_ATTRS } },
        labels: edge.label ? [buildEdgeLabel(edge.label)] : undefined,
      })),
    });
    graph.cleanSelection();
    graph.centerContent();
    setImportError(false);
  };

  const clearAll = () => {
    const graph = graphRef.current;
    if (!graph) return;
    stopRun();
    graph.clearCells();
    setImportError(false);
  };

  const toggleFullscreen = () => {
    const element = wrapRef.current;
    if (!element) return;
    if (document.fullscreenElement === element) {
      void document.exitFullscreen();
    } else {
      void element.requestFullscreen().catch(() => {});
    }
  };

  const alignActions: { mode: AlignMode; label: string; icon: LucideIcon }[] = [
    { mode: "left", label: labels.alignLeft, icon: AlignHorizontalJustifyStart },
    {
      mode: "centerX",
      label: labels.alignCenterX,
      icon: AlignHorizontalJustifyCenter,
    },
    { mode: "right", label: labels.alignRight, icon: AlignHorizontalJustifyEnd },
    { mode: "top", label: labels.alignTop, icon: AlignVerticalJustifyStart },
    {
      mode: "centerY",
      label: labels.alignCenterY,
      icon: AlignVerticalJustifyCenter,
    },
    {
      mode: "bottom",
      label: labels.alignBottom,
      icon: AlignVerticalJustifyEnd,
    },
  ];

  const inputClass =
    "h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

  const running = run !== null && !run.done;

  return (
    <div
      ref={wrapRef}
      className={cn(
        "w-full",
        fullscreen && "flex h-full min-h-screen flex-col bg-background p-4 sm:p-6",
      )}
    >
      <div
        className={cn(
          "grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)_250px]",
          fullscreen && "min-h-0 flex-1",
        )}
      >
        <aside
          className={cn(
            "rounded-xl border border-border/60 p-3",
            fullscreen && "overflow-y-auto",
          )}
        >
          <p className="px-1 text-sm font-medium">{labels.palette}</p>
          <p className="mt-1 px-1 text-xs text-muted-foreground">
            {labels.dragHint}
          </p>
          <div className="mt-3 space-y-2">
            {KINDS.map((kind) => {
              const meta = KIND_META[kind];
              const Icon = meta.icon;
              return (
                <button
                  key={kind}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      "application/x-node-kind",
                      kind,
                    );
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onClick={() => addAtCenter(kind)}
                  className="flex w-full cursor-grab items-center gap-2.5 rounded-lg border border-border/60 bg-card px-3 py-2 text-left text-sm transition-colors hover:border-brand/50 active:cursor-grabbing"
                >
                  <span
                    className="grid size-5 shrink-0 place-items-center rounded-md"
                    style={{ backgroundColor: meta.soft, color: meta.color }}
                  >
                    <Icon className="size-3" />
                  </span>
                  {labels.nodes[kind]}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              size="icon-sm"
              variant="outline"
              aria-label={labels.undo}
              title={labels.undo}
              disabled={!stats.canUndo}
              onClick={() => graphRef.current?.undo()}
            >
              <Undo2 className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label={labels.redo}
              title={labels.redo}
              disabled={!stats.canRedo}
              onClick={() => graphRef.current?.redo()}
            >
              <Redo2 className="size-4" />
            </Button>
            <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
            <Button
              size="icon-sm"
              variant="outline"
              aria-label={labels.delete}
              title={labels.delete}
              disabled={stats.selected === 0}
              onClick={deleteSelection}
            >
              <Trash2 className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label={labels.duplicate}
              title={labels.duplicate}
              disabled={stats.selected === 0}
              onClick={duplicateSelected}
            >
              <CopyPlus className="size-4" />
            </Button>
            <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
            <Button
              size="icon-sm"
              variant="outline"
              aria-label={labels.zoomOut}
              title={labels.zoomOut}
              disabled={stats.zoom <= ZOOM_MIN + 0.001}
              onClick={zoomOut}
            >
              <Minus className="size-4" />
            </Button>
            <button
              type="button"
              onClick={resetZoom}
              title={labels.resetZoom}
              aria-label={labels.resetZoom}
              className="h-7 min-w-12 rounded-lg border border-border px-2 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {Math.round(stats.zoom * 100)}%
            </button>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label={labels.zoomIn}
              title={labels.zoomIn}
              disabled={stats.zoom >= ZOOM_MAX - 0.001}
              onClick={zoomIn}
            >
              <Plus className="size-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={fitView}>
              <Maximize className="size-4" />
              {labels.fit}
            </Button>
            <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
            <Button size="sm" variant="outline" onClick={exportJson}>
              <FileJson className="size-4" />
              JSON
            </Button>
            <Button size="sm" variant="outline" onClick={exportPng}>
              <ImageIcon className="size-4" />
              PNG
            </Button>
            <Button size="sm" variant="outline" onClick={exportSvg}>
              <FileCode2 className="size-4" />
              SVG
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              {labels.importJson}
            </Button>
            <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
            <Button size="sm" variant="outline" onClick={loadSample}>
              <RotateCcw className="size-4" />
              {labels.loadSample}
            </Button>
            <Button size="sm" variant="outline" onClick={clearAll}>
              <SquareDashed className="size-4" />
              {labels.clear}
            </Button>
            <Button
              size="sm"
              variant={running ? "outline" : "default"}
              disabled={!running && stats.nodes === 0}
              onClick={() => {
                if (running) stopRun();
                else startRun();
              }}
            >
              {running ? (
                <Square className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
              {running ? labels.stopRun : labels.run}
            </Button>
            <div className="ml-auto flex items-center gap-1.5">
              <Button
                size="icon-sm"
                variant={minimapOn ? "default" : "outline"}
                aria-label={labels.minimap}
                title={labels.minimap}
                onClick={() => setMinimapOn((value) => !value)}
              >
                <MapIcon className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                aria-label={
                  fullscreen ? labels.exitFullscreen : labels.fullscreen
                }
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
          </div>

          <div
            className={cn(
              "x6-workbench relative overflow-hidden rounded-xl border border-border/60",
              "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_45%)]",
              fullscreen ? "min-h-0 flex-1" : "h-[560px]",
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

            {ready && stats.nodes === 0 && stats.edges === 0 ? (
              <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/70 bg-background/70 px-6 py-5 text-center backdrop-blur-sm">
                  <SquareDashed className="size-5 text-muted-foreground" />
                  <p className="max-w-56 text-xs text-muted-foreground">
                    {labels.emptyHint}
                  </p>
                </div>
              </div>
            ) : null}

            {minimapOn ? (
              <div className="absolute bottom-3 right-3 z-10 overflow-hidden rounded-[10px] border border-border/60 bg-background/85 shadow-sm backdrop-blur">
                <div ref={minimapHostRef} />
              </div>
            ) : null}

            <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex max-w-[calc(100%-13rem)] items-center gap-1.5 truncate rounded-full border border-border/60 bg-background/75 px-3 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
              {importError ? (
                <span className="text-destructive">{labels.importFailed}</span>
              ) : (
                <>
                  <span>
                    {labels.nodeCount.replace("{count}", String(stats.nodes))}
                  </span>
                  <span aria-hidden>·</span>
                  <span>
                    {labels.edgeCount.replace("{count}", String(stats.edges))}
                  </span>
                  {stats.selected > 0 ? (
                    <>
                      <span aria-hidden>·</span>
                      <span>
                        {labels.selectionCount.replace(
                          "{count}",
                          String(stats.selected),
                        )}
                      </span>
                    </>
                  ) : null}
                </>
              )}
            </div>

            {run ? (
              <div className="pointer-events-none absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-brand/40 bg-background/85 px-3 py-1 text-[11px] font-medium text-foreground backdrop-blur">
                {run.done ? (
                  <Check className="size-3 text-brand" />
                ) : (
                  <Play className="size-3 text-brand" />
                )}
                <span className="max-w-52 truncate">
                  {run.done
                    ? labels.runDone
                    : labels.runProgress
                        .replace("{label}", run.label)
                        .replace("{index}", String(run.index))
                        .replace("{total}", String(run.total))}
                </span>
              </div>
            ) : null}

            {!ready ? (
              <div className="absolute inset-0 z-30 grid place-items-center bg-background/70 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  {labels.loading}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <aside
          className={cn(
            "rounded-xl border border-border/60 p-4",
            fullscreen && "overflow-y-auto",
          )}
        >
          <p className="text-sm font-medium">{labels.properties}</p>

          {panel.type === "node" ? (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
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
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{labels.kind}</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {KINDS.map((kind) => {
                    const meta = KIND_META[kind];
                    const Icon = meta.icon;
                    const active = panel.kind === kind;
                    return (
                      <button
                        key={kind}
                        type="button"
                        title={labels.nodes[kind]}
                        aria-label={labels.nodes[kind]}
                        onClick={() => switchKind(kind)}
                        className={cn(
                          "grid h-8 place-items-center rounded-lg border transition-colors",
                          active
                            ? "border-transparent bg-accent"
                            : "border-border/60 hover:bg-muted",
                        )}
                        style={
                          active
                            ? { boxShadow: `0 0 0 1.5px ${meta.color}` }
                            : undefined
                        }
                      >
                        <Icon
                          className="size-3.5"
                          style={{ color: meta.color }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={duplicateSelected}
                >
                  <CopyPlus className="size-4" />
                  {labels.duplicate}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={deleteSelection}
                >
                  <Trash2 className="size-4" />
                  {labels.delete}
                </Button>
              </div>
            </div>
          ) : panel.type === "edge" ? (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="edge-label"
                  className="text-xs text-muted-foreground"
                >
                  {labels.edgeLabel}
                </label>
                <input
                  id="edge-label"
                  value={labelValue}
                  onChange={(event) => commitLabel(event.target.value)}
                  className={inputClass}
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={deleteSelection}
              >
                <Trash2 className="size-4" />
                {labels.delete}
              </Button>
            </div>
          ) : panel.type === "multi" ? (
            <div className="mt-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                {labels.selectionCount.replace("{count}", String(panel.count))}
              </p>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{labels.align}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {alignActions.map((action) => (
                    <Button
                      key={action.mode}
                      size="icon-sm"
                      variant="outline"
                      aria-label={action.label}
                      title={action.label}
                      disabled={panel.nodes < 2}
                      onClick={() => {
                        const graph = graphRef.current;
                        if (graph) alignNodes(graph, action.mode);
                      }}
                    >
                      <action.icon className="size-4" />
                    </Button>
                  ))}
                </div>
                {panel.nodes < 2 ? (
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {labels.alignHint}
                  </p>
                ) : null}
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={deleteSelection}
              >
                <Trash2 className="size-4" />
                {labels.delete}
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              {labels.noSelection}
            </p>
          )}

          <div className="mt-6 border-t border-border/60 pt-4">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Keyboard className="size-3.5" />
              {labels.shortcuts}
            </p>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li>{labels.shortcutNav}</li>
              <li>{labels.shortcutEdit}</li>
              <li>{labels.shortcutHistory}</li>
              <li>{labels.shortcutSelect}</li>
            </ul>
          </div>
        </aside>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleImportFile(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
