import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { PostBody } from "@/components/post-body";
import { Section } from "@/components/section";
import { TableOfContents } from "@/components/table-of-contents";
import { Badge } from "@/components/ui/badge";
import { getAllPosts, getPost, getPostSlugs, extractHeadings } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate } from "@/lib/format";
import { isLocale, locales, localizedPath } from "@/lib/i18n";

type PostParams = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getPostSlugs(locale).map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: PostParams): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const post = getPost(locale, slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default function PostPage({ params }: PostParams) {
  return (
    <Section className="py-12">
      <Suspense fallback={<PostDetailFallback />}>
        <PostDetail params={params} />
      </Suspense>
    </Section>
  );
}

async function PostDetail({ params }: PostParams) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const post = getPost(locale, slug);
  if (!post) notFound();
  const dict = await getDictionary(locale);

  const posts = getAllPosts(locale);
  const index = posts.findIndex((item) => item.slug === slug);
  const prev = index >= 0 ? posts[index + 1] : undefined;
  const next = index > 0 ? posts[index - 1] : undefined;
  const headings = extractHeadings(post.content);

  return (
    <>
      <Link
        href={localizedPath(locale, "/blog")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {dict.blog.backToList}
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
        <article className="min-w-0">
          <header className="border-b border-border/60 pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <time dateTime={post.date}>
                {dict.blog.publishedOn} {formatDate(post.date, locale)}
              </time>
              <span aria-hidden>·</span>
              <span>
                {dict.blog.readingTime.replace(
                  "{minutes}",
                  String(post.readingMinutes),
                )}
              </span>
            </div>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              {post.description}
            </p>
            {post.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </header>

          <div className="pt-8">
            <PostBody source={post.content} />
          </div>

          {(prev || next) && (
            <nav className="mt-12 grid gap-4 border-t border-border/60 pt-8 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={localizedPath(locale, `/blog/${prev.slug}`)}
                  className="group rounded-lg border border-border/60 p-4 transition-colors hover:border-brand/50"
                >
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ArrowLeft className="size-3.5" />
                    {dict.blog.prev}
                  </span>
                  <span className="mt-1 block text-sm group-hover:text-brand">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={localizedPath(locale, `/blog/${next.slug}`)}
                  className="group rounded-lg border border-border/60 p-4 text-right transition-colors hover:border-brand/50"
                >
                  <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                    {dict.blog.next}
                    <ArrowRight className="size-3.5" />
                  </span>
                  <span className="mt-1 block text-sm group-hover:text-brand">
                    {next.title}
                  </span>
                </Link>
              ) : null}
            </nav>
          )}
        </article>

        <aside>
          <TableOfContents headings={headings} label={dict.blog.toc} />
        </aside>
      </div>
    </>
  );
}

function PostDetailFallback() {
  return (
    <div className="mt-8 space-y-4" aria-hidden>
      <div className="h-9 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div className="mt-8 space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
        <div className="h-4 w-10/12 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
