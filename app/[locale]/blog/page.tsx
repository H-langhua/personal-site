import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
import { Section } from "@/components/section";
import { getAllPosts } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.blog.title, description: dict.blog.subtitle };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const posts = getAllPosts(locale);

  return (
    <>
      <PageHeader title={dict.blog.title} subtitle={dict.blog.subtitle} />
      <Section>
        {posts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard
                key={post.slug}
                post={post}
                locale={locale}
                readingLabel={dict.blog.readingTime.replace(
                  "{minutes}",
                  String(post.readingMinutes),
                )}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{dict.blog.empty}</p>
        )}
      </Section>
    </>
  );
}
