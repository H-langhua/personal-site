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
    slug: "station-load-balancing",
    title: {
      zh: "智能运维平台 · 场站负载均衡",
      en: "Ops Platform · Station Load Balancing",
    },
    summary: {
      zh: "通过可视化一键向导实现电力资源高效分配，支持多级线路组网与枪维度实时状态监测。",
      en: "A one-click visual wizard for power load balancing across stations, with multi-level line topology and real-time per-charger monitoring.",
    },
    description: {
      zh: "支持一代/二代设备、AC/DC 混合组网与多级线路组网的一键向导式配置，支持电流功率模式切换，分时电流、TIC 合约配置。查看态实时显示枪维度 WiSUN 状态、功率与电流数据，实时监测系统运行状态，提升运维效率。",
      en: "A guided one-click configuration flow covering first/second-generation devices, mixed AC/DC grids and multi-level line topology, with current/power mode switching plus time-of-use current and TIC contract settings. The runtime view streams per-charger WiSUN status, power and current data for real-time monitoring.",
    },
    category: "web",
    tags: ["Vue 3", "TypeScript", "AntV X6", "SortableJS", "Pinia"],
    year: "2025",
    role: { zh: "核心开发", en: "Core developer" },
    highlights: {
      zh: [
        "多层级拓扑拖拽、线路折叠与响应式节点尺寸，基于 BBox 计算包围圈自适应画布宽度",
        "从桩拖拽排序与分支线路自由组合，节点高亮并自动滚动至搜索结果",
        "封装配置向导、主设备、分支节点与批量配置组件，深度参与接口泛型设计",
      ],
      en: [
        "Multi-level draggable topology with collapsible lines and BBox-based canvas fitting for responsive node sizing",
        "Drag-and-drop charger reordering, free branch composition, node highlight and auto-scroll to search hits",
        "Built the configuration wizard, master device, branch node and batch-config components, co-designing typed API contracts",
      ],
    },
    featured: true,
  },
  {
    slug: "ai-assistant",
    title: { zh: "AI 智能助手（Agent）", en: "AI Assistant (Agent)" },
    summary: {
      zh: "可投放到弹窗/固定窗/全屏/看板侧栏多容器的 AI 助手，覆盖充电桩、场站、工单体系的自然语言问答。",
      en: "A multi-container AI assistant (dialog, docked, fullscreen, dashboard sidebar) answering natural language across chargers, stations and tickets.",
    },
    description: {
      zh: "基于智能运维语料，功能覆盖充电桩、充电场站、uptime、dashboard、工单体系的自然语言应答并给出专业建议，提高运维效率。基于 SSE 实现流式响应，基于 TOOL_CALL 渗入业务组件，实现 AI 场景化能力。",
      en: "Built on operations corpora, it answers in natural language and offers professional advice across chargers, stations, uptime, dashboards and the ticket system. Streaming responses run on SSE, while TOOL_CALL reaches into business components for scenario-driven AI.",
    },
    category: "web",
    tags: ["Vue 3", "TypeScript", "SSE", "Pinia", "markdown-it"],
    year: "2025",
    role: { zh: "独立开发", en: "Solo developer" },
    highlights: {
      zh: [
        "全局聊天内核挂载于 App 级，经 Teleport 将同一套聊天内容投放到弹窗/固定窗/全屏/侧栏多容器",
        "基于 fetch + ReadableStream 手写 SSE 解析：心跳、无消息 watchdog、握手校验、Abort 中断与指数退避重连",
        "TOOL_CALL(intentKey) 驱动全屏业务组件路由联动，统一 useFilterParams 自动注入参数并刷新数据",
      ],
      en: [
        "A global chat core mounted at app level, teleporting one chat into dialog, docked, fullscreen and sidebar containers",
        "Hand-written SSE parsing over fetch + ReadableStream: heartbeat, idle watchdog, handshake check, abort and exponential-backoff reconnects",
        "TOOL_CALL(intentKey) routes into fullscreen business components, with a shared useFilterParams for param injection and data refresh",
      ],
    },
    featured: true,
  },
  {
    slug: "diagnosis-3d",
    title: { zh: "3D 可视化诊断系统", en: "3D Visualization Diagnosis System" },
    summary: {
      zh: "面向充电桩运维的“拓扑告警 + 3D 整机/柜内可视化 + 热力温度视图 + 爆炸图定位”一体化诊断页面。",
      en: "An integrated diagnosis page combining topology alarms, 3D cabinet visualization, thermal heatmaps and exploded-view part locating.",
    },
    description: {
      zh: "基于 WebSocket 与事件总线 mitt 实现实时告警联动、设备切换、全屏与缓存优化；借助 Cache API 模型缓存与资源深度清理，显著减少二次进入的下载与首屏等待，提升故障定位效率。",
      en: "Real-time alarm linkage, device switching, fullscreen and caching are driven by a global WebSocket plus an mitt event bus. Cache API model caching and thorough resource disposal make repeat visits instant, improving fault-locating efficiency.",
    },
    category: "web",
    tags: ["Three.js", "WebGL", "AntV X6", "WebSocket", "mitt"],
    year: "2025",
    role: { zh: "主导开发", en: "Lead developer" },
    highlights: {
      zh: [
        "Three.js：WebGLRenderer + CSS2D/CSS3D Renderer、OrbitControls、GLTF/KTX2 模型解析",
        "Cache API 磁盘缓存、懒渲染/KeepAlive、ResizeObserver 自适应，显著减少二次进入等待",
        "overlay mesh 叠加策略实现告警变红与 hover 高亮，不破坏原始贴图材质并可叠加多层效果",
        "全局 WebSocket + mitt 驱动 X6 拓扑 / 3D 标签 / 爆炸图同步刷新；机型经 config 配置化扩展",
      ],
      en: [
        "Three.js: WebGLRenderer with CSS2D/CSS3D renderers, OrbitControls and GLTF/KTX2 model parsing",
        "Cache API disk caching, lazy rendering/KeepAlive and ResizeObserver adaptivity for near-instant repeat visits",
        "Overlay-mesh strategy for alarm tinting and hover highlight without touching original textures",
        "Global WebSocket + mitt keep the X6 topology, 3D labels and exploded view in sync; new models rest on config additions",
      ],
    },
    featured: true,
  },
  {
    slug: "retail-display",
    title: { zh: "门店管理 · 陈列方案设计", en: "Store Display Design Studio" },
    summary: {
      zh: "基于门店装修平面图的陈列展览设计工具，标准化体验桌、边柜、车灯摆放设计与审核流程。",
      en: "A store display design tool built on renovation floor plans, standardizing how display tables, cabinets and lamps are placed and reviewed.",
    },
    description: {
      zh: "商品与物料可拖拽、缩放、旋转、镜像、图层控制并合成缩略图，支持多选对齐与富文本标注，将门店陈列设计到审核的全流程组件化。",
      en: "Products and fixtures can be dragged, scaled, rotated, mirrored and layer-managed with composed thumbnails, multi-select alignment and rich-text annotations, covering the whole design-to-review flow.",
    },
    category: "web",
    tags: ["Vue 3", "TypeScript", "Quill", "Canvas"],
    year: "2024",
    role: { zh: "核心开发", en: "Core developer" },
    highlights: {
      zh: [
        "基于 vue-draggable-resizable 封装可拖拽商品组件，辅助线定位与自动吸附",
        "自定义右键菜单：镜像、置顶（底）层、左/右/上/下对齐",
        "刻度坐标轴、富文本编辑器与图层、角度、翻转控制面板",
      ],
      en: [
        "Draggable product components on vue-draggable-resizable with guides and snapping",
        "Custom context menu: mirror, bring to front/back and edge alignment",
        "Ruler axes, a rich-text editor plus layer, angle and flip control panels",
      ],
    },
  },
  {
    slug: "smart-car-bu",
    title: { zh: "车 BU · 智选车", en: "Smart Car BU · Sales Analytics" },
    summary: {
      zh: "面向车业务销售过程的商业指标分析应用，覆盖试驾、邀约、下定、战报与车型销量对比。",
      en: "A sales analytics app for the automotive business covering test drives, invitations, orders, battle reports and model comparisons.",
    },
    description: {
      zh: "深度分析车业务一线数据，保障销售质量；拆分门店视角与管理层视角，一套 Vite 多端打包脚本发布到 phx-h5、工作台小程序与销售助手 H5。",
      en: "It dives into frontline sales data to safeguard quality, splits store and manager perspectives, and ships to phx-h5, the workbench mini program and sales-assistant H5 from one Vite multi-target script.",
    },
    category: "miniapp",
    tags: ["uni-app", "Vue 3", "TypeScript", "ECharts"],
    year: "2023",
    role: { zh: "核心开发", en: "Core developer" },
    highlights: {
      zh: [
        "封装 Vite 打包多端脚本，支持 phx-h5、工作台小程序、销售助手 H5",
        "封装 ECharts：精细化设置纵轴刻度、自定义 tooltip 与图例面板",
        "多层 SlideUp 弹出层与滑动手势、Tab、日期维度切换",
      ],
      en: [
        "A Vite multi-target build script for phx-h5, workbench mini program and sales-assistant H5",
        "Wrapped ECharts with fine-grained axes, custom tooltips and legend panels",
        "Layered SlideUp sheets with swipe gestures, tabs and date-dimension switching",
      ],
    },
  },
  {
    slug: "doc-library",
    title: { zh: "线上文库管理", en: "Online Document Library" },
    summary: {
      zh: "覆盖 20+ 类型文件的上传、下载、预览，以及树形文件资源管理器的完整管理能力。",
      en: "Upload, download and preview for 20+ file types, plus a full tree-based file explorer.",
    },
    description: {
      zh: "支持文件夹新建、删除、重命名、拖拽排序与合并；音视频、PDF、Excel、Word、PPT 在线预览，超大文件切片上传与断点续传。",
      en: "Folders can be created, renamed, reordered and merged; audio, video, PDF, Excel, Word and PPT preview inline, while huge files upload in chunks with resumable transfer.",
    },
    category: "tool",
    tags: ["Vue 3", "TypeScript", "Web Worker", "spark-md5"],
    year: "2023",
    role: { zh: "核心开发", en: "Core developer" },
    highlights: {
      zh: [
        "Blob 切片 + spark-md5 在 Web Worker 线程计算 hash，postMessage 回传主线程",
        "hash 校验实现断点续传与秒传，构建树形文件资源管理器",
        "video / iframe / file-viewer 多方案组合实现在线预览",
      ],
      en: [
        "Blob chunking with spark-md5 hashing inside a Web Worker, posted back via postMessage",
        "Hash-based resume and instant upload, powering a tree-shaped file explorer",
        "Inline previews composed from video, iframe and file-viewer",
      ],
    },
  },
  {
    slug: "store-location",
    title: { zh: "门店选址", en: "Store Site Selection" },
    summary: {
      zh: "基于百度、华为地图的门店选址分析平台，测算目标位置的经营可行性。",
      en: "A site-selection platform on Baidu and Huawei maps that estimates the viability of candidate locations.",
    },
    description: {
      zh: "可分析圈定范围内我司、友商门店分布、商圈消费力与商业价值，为新建门店提供基础建店数据。",
      en: "It analyzes own and rival store distribution plus the consumption power and commercial value within a circled area, providing base data for new stores.",
    },
    category: "web",
    tags: ["Vue 2", "TypeScript", "Baidu Map", "Map Kit"],
    year: "2022",
    role: { zh: "核心开发", en: "Core developer" },
    highlights: {
      zh: [
        "各级组织区域遮罩层，支持悬停、下钻与地图缩放联动",
        "自定义信息窗，悬停门店展示品牌、销量与门店等级",
        "可缩放范围圈定组件，圈选完成即获取范围内商圈、商城与门店",
      ],
      en: [
        "Organization masks per level with hover, drill-down and zoom linkage",
        "Custom info windows showing brand, sales and store tier on hover",
        "Scalable circle selection resolving business districts, malls and stores inside",
      ],
    },
  },
  {
    slug: "battle-screen",
    title: { zh: "作战大屏", en: "Sales Battle Screen" },
    summary: {
      zh: "新品实时销售大屏：区域目标达成、销量冠军、实时数字时钟与省市销量分布。",
      en: "A real-time new-product sales wall: regional targets, best sellers, a live clock and province-level distribution.",
    },
    description: {
      zh: "支持任意比例屏幕 100% 填充或可配置固定比例展示，基于 WebSocket 接收服务端推送，实时刷新销售数据。",
      en: "It fills any aspect ratio at 100% or honors a configurable fixed ratio, refreshing sales figures in real time over WebSocket pushes.",
    },
    category: "web",
    tags: ["Vue 2", "ECharts", "DataV", "WebSocket"],
    year: "2022",
    role: { zh: "核心开发", en: "Core developer" },
    highlights: {
      zh: [
        "封装 ECharts 组件：多样化边框样式与图表类型",
        "地图点击下钻展示区域销售数据，最低层级选中高亮",
        "WebSocket 服务端推送驱动大屏实时更新",
      ],
      en: [
        "Wrapped ECharts with themed borders and varied chart types",
        "Clickable map drill-down with highlight at the leaf level",
        "WebSocket pushes driving live wall updates",
      ],
    },
  },
  {
    slug: "digital-ops",
    title: { zh: "数字化运营", en: "Digital Operations Platform" },
    summary: {
      zh: "面向零售业务的数字化运营平台：多维筛选、趋势分析、明细表格与导出。",
      en: "A digital operations platform for retail: multi-dimension filters, trend analysis, detail tables and export.",
    },
    description: {
      zh: "基于数据仓库与数据可视化技术，以任意维度（天周月年、省市县区、门店等级）将数据转化为洞察，为管理与业务人员提供查询、分析与决策支持。",
      en: "Built on the data warehouse and visualization, it turns data into insight across any dimension (day/week/month/year, region, store tier), supporting query, analysis and decisions for managers and staff.",
    },
    category: "web",
    tags: ["Vue 2", "TypeScript", "ECharts", "Axios"],
    year: "2020",
    role: { zh: "核心开发", en: "Core developer" },
    highlights: {
      zh: [
        "路由懒加载与守卫构建单页应用，封装公共筛选区组件",
        "Vuex 管理用户权限，封装 axios 拦截器与错误处理",
        "封装 ECharts、可操作表格、动态 Tab 与表格导出等复用组件",
      ],
      en: [
        "Routed SPA with lazy routes and guards, plus shared filter-section components",
        "Vuex-managed permissions and a wrapped axios with interceptors and error mapping",
        "Reusable ECharts, operable tables, dynamic tabs and table export",
      ],
    },
  },
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
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
