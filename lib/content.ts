import fs from "node:fs";
import path from "node:path";

import GithubSlugger from "github-slugger";
import matter from "gray-matter";

import type { Locale } from "./i18n";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags?: string[];
  draft?: boolean;
};

export type PostMeta = PostFrontmatter & {
  slug: string;
  locale: Locale;
  readingMinutes: number;
};

export type Post = PostMeta & {
  content: string;
};

function blogDir(locale: Locale) {
  return path.join(BLOG_DIR, locale);
}

function estimateReadingMinutes(content: string): number {
  const text = content.replace(/```[\s\S]*?```/g, " ");
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const words = (text.match(/[A-Za-z0-9]+/g) ?? []).length;
  const minutes = cjk / 350 + words / 200;
  return Math.max(1, Math.round(minutes));
}

function readFile(locale: Locale, slug: string): Post | null {
  const file = path.join(blogDir(locale), `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;
  return {
    ...frontmatter,
    slug,
    locale,
    content,
    readingMinutes: estimateReadingMinutes(content),
  };
}

export function getPostSlugs(locale: Locale): string[] {
  const dir = blogDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => name.replace(/\.mdx$/, ""));
}

export function getPost(locale: Locale, slug: string): Post | null {
  return readFile(locale, slug);
}

function toMeta(post: Post): PostMeta {
  return {
    slug: post.slug,
    locale: post.locale,
    title: post.title,
    description: post.description,
    date: post.date,
    updated: post.updated,
    tags: post.tags,
    draft: post.draft,
    readingMinutes: post.readingMinutes,
  };
}

export type Heading = { id: string; text: string; depth: number };

export function extractHeadings(content: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;

  for (const line of content.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const text = match[2]
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .trim();

    headings.push({ id: slugger.slug(text), text, depth: match[1].length });
  }

  return headings;
}

export function getAllPosts(locale: Locale): PostMeta[] {
  const posts = getPostSlugs(locale)
    .map((slug) => readFile(locale, slug))
    .filter((post): post is Post => post !== null)
    .filter((post) => !post.draft)
    .map(toMeta);
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllTags(locale: Locale): string[] {
  const tags = new Set<string>();
  for (const post of getAllPosts(locale)) {
    for (const tag of post.tags ?? []) tags.add(tag);
  }
  return [...tags].sort();
}
