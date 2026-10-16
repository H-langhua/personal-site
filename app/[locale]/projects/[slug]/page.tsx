import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Code2, ExternalLink } from "lucide-react";

import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProject, projects } from "@/data/projects";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, locales, localizedPath } from "@/lib/i18n";

type ProjectParams = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    projects.map((project) => ({ locale, slug: project.slug })),
  );
}

export async function generateMetadata({
  params,
}: ProjectParams): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title[locale],
    description: project.summary[locale],
  };
}

export default function ProjectDetailPage({ params }: ProjectParams) {
  return (
    <Section className="py-12">
      <Suspense fallback={<ProjectDetailFallback />}>
        <ProjectDetail params={params} />
      </Suspense>
    </Section>
  );
}

async function ProjectDetail({ params }: ProjectParams) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const project = getProject(slug);
  if (!project) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <Link
        href={localizedPath(locale, "/projects")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {dict.projects.backToList}
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{project.year}</span>
            <span aria-hidden>·</span>
            <span>
              {dict.projects.role}: {project.role[locale]}
            </span>
          </div>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {project.title[locale]}
          </h1>
          <p className="mt-4 text-base text-foreground/90">
            {project.summary[locale]}
          </p>

          <div className="prose prose-neutral mt-6 max-w-none dark:prose-invert">
            <p>{project.description[locale]}</p>
          </div>

          <h2 className="mt-10 font-heading text-lg font-semibold">
            {dict.projects.highlights}
          </h2>
          <ul className="mt-4 space-y-2">
            {project.highlights[locale].map((item) => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div>
            <h2 className="text-sm font-medium">{dict.projects.tech}</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {project.links?.demo || project.links?.source ? (
            <div className="flex flex-col gap-2">
              {project.links?.demo ? (
                <Button asChild>
                  {project.links.demo.startsWith("/") ? (
                    // Use next/link so basePath is applied (static export on a
                    // sub-path, e.g. GitHub Pages project sites).
                    <Link href={localizedPath(locale, project.links.demo)}>
                      <ExternalLink className="size-4" />
                      {dict.common.visit}
                    </Link>
                  ) : (
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="size-4" />
                      {dict.common.visit}
                    </a>
                  )}
                </Button>
              ) : null}
              {project.links?.source ? (
                <Button variant="outline" asChild>
                  <a
                    href={project.links.source}
                    target={project.links.source.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                  >
                    <Code2 className="size-4" />
                    {dict.common.source}
                  </a>
                </Button>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}

function ProjectDetailFallback() {
  return (
    <div className="mt-8 space-y-3" aria-hidden>
      <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
    </div>
  );
}
