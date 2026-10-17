export type SkillGroup = {
  title: { zh: string; en: string };
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: { zh: "核心语言", en: "Core" },
    items: ["TypeScript", "JavaScript (ES6+)", "HTML", "CSS"],
  },
  {
    title: { zh: "框架与生态", en: "Frameworks" },
    items: ["Vue 3", "Vue 2", "Pinia", "React", "Next.js", "uni-app"],
  },
  {
    title: { zh: "可视化", en: "Visualization" },
    items: ["Three.js", "WebGL", "AntV X6", "ECharts", "Canvas"],
  },
  {
    title: { zh: "工程化与协作", en: "Engineering & Tooling" },
    items: ["Vite", "Webpack", "pnpm", "Node.js", "Git", "WebSocket / SSE"],
  },
];
