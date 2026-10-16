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
  email: "hi@example.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://h-langhua.github.io/personal-site",
  social: {
    github: "https://github.com/",
    twitter: "https://twitter.com/",
    linkedin: "https://www.linkedin.com/",
  },
} as const;

export type SiteConfig = typeof siteConfig;
