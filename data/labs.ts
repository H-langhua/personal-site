export type Lab = {
  slug: string;
  title: { zh: string; en: string };
  summary: { zh: string; en: string };
  tags: string[];
  status: "stable" | "wip";
};

export const labs: Lab[] = [
  {
    slug: "three-scene",
    title: { zh: "Three.js 交互 3D 场景", en: "Three.js Interactive 3D Scene" },
    summary: {
      zh: "程序化生成的 WebGL 场景：轨道相机、悬浮几何体、粒子星尘与泛光后处理，支持悬停高亮、点击聚焦与主题自适应。",
      en: "A procedurally generated WebGL scene: orbit camera, floating geometries, particle dust and bloom post-processing, with hover highlight, click-to-focus and theme adaptivity.",
    },
    tags: ["Three.js", "WebGL", "TypeScript"],
    status: "stable",
  },
  {
    slug: "x6-editor",
    title: { zh: "AntV X6 图形编辑器", en: "AntV X6 Graph Editor" },
    summary: {
      zh: "基于 AntV X6 的可视化流程编排器：拖拽生成节点、连线、编辑属性并导出图数据。",
      en: "A visual flow builder on top of AntV X6: drag to create nodes, connect them, edit properties and export the graph.",
    },
    tags: ["AntV X6", "React", "TypeScript"],
    status: "wip",
  },
  {
    slug: "realtime-dashboard",
    title: { zh: "实时数据可视化大屏", en: "Realtime Data Dashboard" },
    summary: {
      zh: "深色霓虹监控大屏：基于 ECharts 的实时流量、延迟、资源与日志可视化，数据为前端模拟、每秒刷新。",
      en: "A dark neon monitoring wall built with ECharts: live traffic, latency, resource and log panels driven by a simulated feed that refreshes every second.",
    },
    tags: ["ECharts", "React", "Realtime"],
    status: "wip",
  },
];

export function getLab(slug: string): Lab | undefined {
  return labs.find((lab) => lab.slug === slug);
}
