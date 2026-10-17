export const siteConfig = {
  name: {
    zh: "黄浪发",
    en: "Langfa Huang",
  },
  initials: "HL",
  role: {
    zh: "前端开发工程师",
    en: "Frontend Engineer",
  },
  email: "huanglangfa@gmail.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://huanglangfa.vercel.app",
  social: {
    github: "https://github.com/huanglangfa",
    twitter: "",
    linkedin: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
