export type SkillGroup = {
  title: { zh: string; en: string };
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: { zh: "核心语言", en: "Core" },
    items: ["TypeScript", "JavaScript", "HTML", "CSS"],
  },
  {
    title: { zh: "框架与生态", en: "Frameworks" },
    items: ["React", "Next.js", "Vue 3", "Nuxt", "uni-app"],
  },
  {
    title: { zh: "可视化", en: "Visualization" },
    items: ["AntV X6", "AntV G2", "ECharts", "Canvas", "WebGL"],
  },
  {
    title: { zh: "工程化", en: "Engineering" },
    items: ["Vite", "Turbopack", "Vitest", "ESLint", "GitHub Actions", "Docker"],
  },
];
