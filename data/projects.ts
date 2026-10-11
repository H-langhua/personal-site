export type ProjectCategory = "web" | "miniapp" | "tool";

export type Project = {
  slug: string;
  title: { zh: string; en: string };
  summary: { zh: string; en: string };
  description: { zh: string; en: string };
  category: ProjectCategory;
  tags: string[];
  year: string;
  role: { zh: string; en: string };
  highlights: { zh: string[]; en: string[] };
  links?: { demo?: string; source?: string };
  featured?: boolean;
};

export const projectCategories: {
  value: ProjectCategory | "all";
  label: { zh: string; en: string };
}[] = [
  { value: "all", label: { zh: "全部", en: "All" } },
  { value: "web", label: { zh: "Web 应用", en: "Web Apps" } },
  { value: "miniapp", label: { zh: "多端小程序", en: "Mini Programs" } },
  { value: "tool", label: { zh: "工具与组件", en: "Tools & Components" } },
];

export const projects: Project[] = [
  {
    slug: "dadi-score",
    title: { zh: "大地记分 · 多端计分应用", en: "Dadi Score · Multi-platform Scoring App" },
    summary: {
      zh: "面向球类运动的实时计分工具，一套代码发布到微信小程序、H5 与 App。",
      en: "A real-time scoring tool for ball sports, shipped to WeChat Mini Program, H5 and App from one codebase.",
    },
    description: {
      zh: "基于 uni-app + Vue 3 构建的跨端计分应用，支持比分实时记录、历史对局回看与本地持久化。通过统一的状态管理与条件编译，在保证交互一致性的同时适配不同小程序平台的能力差异。",
      en: "A cross-platform scoring app built with uni-app + Vue 3. It records scores in real time, replays match history and persists data locally. A unified state layer and conditional compilation keep the UX consistent across Mini Program platforms.",
    },
    category: "miniapp",
    tags: ["uni-app", "Vue 3", "TypeScript"],
    year: "2024",
    role: { zh: "独立开发", en: "Solo developer" },
    highlights: {
      zh: [
        "一套代码多端发布，覆盖微信/支付宝等小程序",
        "实时计分状态机，支持撤销与历史回看",
        "本地持久化，离线可用",
      ],
      en: [
        "One codebase, multiple platforms including WeChat & Alipay",
        "Real-time scoring state machine with undo and history replay",
        "Local persistence, works offline",
      ],
    },
    links: { demo: "#", source: "#" },
    featured: true,
  },
  {
    slug: "flow-studio",
    title: { zh: "Flow Studio · 低代码流程编排器", en: "Flow Studio · Low-code Flow Builder" },
    summary: {
      zh: "基于 AntV X6 的可视化流程编排器，支持拖拽建模、连线与图数据导出。",
      en: "A visual flow builder powered by AntV X6, supporting drag-and-drop modeling, connections and graph export.",
    },
    description: {
      zh: "以 AntV X6 为画布内核，配合自定义 React 节点与插件体系，实现节点物料拖拽生成、连线规则校验、属性面板编辑、撤销重做以及 JSON/PNG 导出。该项目用于验证复杂图形交互在前端的可维护实现方式。",
      en: "With AntV X6 as the canvas core, custom React nodes and a plugin architecture, it supports drag-to-create nodes, connection validation, a property panel, undo/redo and JSON/PNG export. It explores a maintainable approach to complex graph interactions.",
    },
    category: "web",
    tags: ["AntV X6", "React", "TypeScript", "Zustand"],
    year: "2025",
    role: { zh: "核心开发", en: "Core developer" },
    highlights: {
      zh: [
        "自定义 React 节点与端口，交互高度可定制",
        "拖拽生成、吸附对齐、撤销重做完整闭环",
        "画布数据与业务状态解耦，便于持久化",
      ],
      en: [
        "Custom React nodes and ports for rich interactions",
        "Drag-to-create, snapping and undo/redo in one loop",
        "Canvas data decoupled from app state for easy persistence",
      ],
    },
    links: { demo: "/labs/x6-editor" },
    featured: true,
  },
  {
    slug: "insight-dashboard",
    title: { zh: "Insight · 实时数据可视化大屏", en: "Insight · Real-time Data Dashboard" },
    summary: {
      zh: "面向运营的实时数据大屏，支持多图表联动与自适应布局。",
      en: "A real-time operations dashboard with linked charts and responsive layout.",
    },
    description: {
      zh: "使用 ECharts 与自定义 Canvas 图层构建可配置的数据大屏，通过 WebSocket 订阅实时指标，结合虚拟化与节流策略在高频更新下保持流畅。内置主题系统与布局栅格，支持大屏与移动端自适配。",
      en: "A configurable dashboard built with ECharts and custom Canvas layers. It subscribes to real-time metrics over WebSocket and stays smooth under high-frequency updates via virtualization and throttling. A theme system and layout grid adapt it to big screens and mobile.",
    },
    category: "web",
    tags: ["ECharts", "Canvas", "WebSocket"],
    year: "2024",
    role: { zh: "前端负责人", en: "Frontend lead" },
    highlights: {
      zh: [
        "多图表联动与全局筛选",
        "高频数据下的渲染性能优化",
        "可配置主题与自适应栅格布局",
      ],
      en: [
        "Linked charts with global filtering",
        "Rendering performance tuning under high-frequency data",
        "Configurable themes and an adaptive grid layout",
      ],
    },
    links: { demo: "/labs/realtime-dashboard", source: "#" },
    featured: true,
  },
  {
    slug: "ui-kit",
    title: { zh: "Pulse UI · 企业级组件库", en: "Pulse UI · Enterprise Component Library" },
    summary: {
      zh: "内部复用的 React 组件库，覆盖表单、表格与图表等高频场景。",
      en: "An internal React component library covering forms, tables and charts.",
    },
    description: {
      zh: "沉淀团队高频 UI 场景，提供类型完备、可主题化的组件，配套文档站点与可视化测试。通过设计令牌（Design Tokens）统一视觉规范，降低多业务线之间的实现差异。",
      en: "Distills frequently used UI patterns into type-safe, themeable components with a docs site and visual tests. Design tokens unify the visual language and reduce inconsistency across business lines.",
    },
    category: "tool",
    tags: ["React", "Design Tokens", "Storybook"],
    year: "2023",
    role: { zh: "维护者", en: "Maintainer" },
    highlights: {
      zh: ["设计令牌驱动主题", "完整类型与文档站点", "可视化回归测试"],
      en: ["Token-driven theming", "Complete types with a docs site", "Visual regression testing"],
    },
    links: { source: "#" },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
