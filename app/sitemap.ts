import type { MetadataRoute } from "next";

import { labs } from "@/data/labs";
import { projects } from "@/data/projects";
import { siteConfig } from "@/data/site";
import { getAllPosts } from "@/lib/content";
import { locales } from "@/lib/i18n";

export const dynamic = "force-static";

type ChangeFreq = MetadataRoute.Sitemap[number]["changeFrequency"];

function url(locale: string, path: string) {
  return `${siteConfig.url}/${locale}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const staticRoutes: { path: string; priority: number; freq: ChangeFreq }[] = [
      { path: "", priority: 1, freq: "weekly" },
      { path: "/projects", priority: 0.9, freq: "monthly" },
      { path: "/blog", priority: 0.8, freq: "weekly" },
      { path: "/labs", priority: 0.8, freq: "weekly" },
      { path: "/about", priority: 0.7, freq: "monthly" },
    ];

    for (const route of staticRoutes) {
      entries.push({
        url: url(locale, route.path),
        lastModified: new Date(),
        changeFrequency: route.freq,
        priority: route.priority,
      });
    }

    for (const project of projects) {
      entries.push({
        url: url(locale, `/projects/${project.slug}`),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    for (const lab of labs) {
      entries.push({
        url: url(locale, `/labs/${lab.slug}`),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    for (const post of getAllPosts(locale)) {
      entries.push({
        url: url(locale, `/blog/${post.slug}`),
        lastModified: new Date(post.updated ?? post.date),
        changeFrequency: "yearly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
