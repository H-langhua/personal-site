import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { X6Editor } from "@/components/demos/x6-editor";
import { RealtimeDashboard } from "@/components/demos/realtime-dashboard";
import { ThreeScene } from "@/components/demos/three-scene";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { getLab, labs } from "@/data/labs";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, locales, localizedPath } from "@/lib/i18n";

type LabParams = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    labs.map((lab) => ({ locale, slug: lab.slug })),
  );
}

export async function generateMetadata({
  params,
}: LabParams): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const lab = getLab(slug);
  if (!lab) return {};
  return { title: lab.title[locale], description: lab.summary[locale] };
}

export default function LabDetailPage({ params }: LabParams) {
  return (
    <Section className="py-12">
      <Suspense fallback={<LabDetailFallback />}>
        <LabDetail params={params} />
      </Suspense>
    </Section>
  );
}

async function LabDetail({ params }: LabParams) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const lab = getLab(slug);
  if (!lab) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <Link
        href={localizedPath(locale, "/labs")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {dict.labs.backToList}
      </Link>

      <header className="mt-8 mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {lab.title[locale]}
          </h1>
          <Badge variant={lab.status === "wip" ? "outline" : "secondary"}>
            {lab.status === "wip" ? "WIP" : "Stable"}
          </Badge>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {lab.summary[locale]}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {lab.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      {slug === "three-scene" ? (
        <ThreeScene labels={dict.threeScene} />
      ) : null}
      {slug === "x6-editor" ? <X6Editor labels={dict.editor} /> : null}
      {slug === "realtime-dashboard" ? (
        <RealtimeDashboard labels={dict.dashboard} />
      ) : null}
    </>
  );
}

function LabDetailFallback() {
  return (
    <div className="mt-8 space-y-3" aria-hidden>
      <div className="h-7 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
    </div>
  );
}
