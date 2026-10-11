import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { PostMeta } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { localizedPath, type Locale } from "@/lib/i18n";

export function PostCard({
  post,
  locale,
  readingLabel,
}: {
  post: PostMeta;
  locale: Locale;
  readingLabel: string;
}) {
  return (
    <Link
      href={localizedPath(locale, `/blog/${post.slug}`)}
      className="group flex flex-col rounded-xl border border-border/60 p-5 transition-colors hover:border-brand/50 hover:bg-muted/30"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
        <span aria-hidden>·</span>
        <span>{readingLabel}</span>
      </div>
      <h3 className="mt-2 font-heading text-base font-medium group-hover:text-brand">
        {post.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
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
    </Link>
  );
}
