export type ExperienceItem = {
  company: string;
  role: { zh: string; en: string };
  period: string;
  location: { zh: string; en: string };
  points: { zh: string[]; en: string[] };
};

export const experiences: ExperienceItem[] = [
  {
    company: "某科技公司",
    role: { zh: "高级前端工程师", en: "Senior Frontend Engineer" },
    period: "2023 — 至今",
    location: { zh: "深圳", en: "Shenzhen" },
    points: {
      zh: [
        "负责核心 B 端产品的架构设计与性能优化",
        "主导组件库与可视化方案的沉淀与推广",
        "推动前端工程化与 CI/CD 流程落地",
      ],
      en: [
        "Led architecture design and performance work for core B2B products",
        "Drove the design system and visualization toolkit",
        "Established frontend engineering and CI/CD practices",
      ],
    },
  },
  {
    company: "某互联网公司",
    role: { zh: "前端工程师", en: "Frontend Engineer" },
    period: "2021 — 2023",
    location: { zh: "广州", en: "Guangzhou" },
    points: {
      zh: [
        "从 0 到 1 搭建多端小程序与 H5 活动页",
        "负责数据可视化大屏的开发与维护",
        "参与需求评审与技术方案设计",
      ],
      en: [
        "Built multi-platform mini programs and H5 campaigns from scratch",
        "Developed and maintained data dashboard screens",
        "Took part in requirement reviews and technical design",
      ],
    },
  },
];

export type EducationItem = {
  school: string;
  major: { zh: string; en: string };
  period: string;
};

export const educations: EducationItem[] = [
  {
    school: "某大学",
    major: { zh: "计算机科学与技术", en: "Computer Science" },
    period: "2017 — 2021",
  },
];
