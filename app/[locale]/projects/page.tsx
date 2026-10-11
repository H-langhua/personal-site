import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { ProjectsExplorer } from "@/components/projects-explorer";
import { Section } from "@/components/section";
import { projectCategories, projects } from "@/data/projects";
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
  return { title: dict.projects.title, description: dict.projects.subtitle };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const categories = projectCategories.map((category) => ({
    value: category.value,
    label: category.label[locale],
  }));

  return (
    <>
      <PageHeader
        title={dict.projects.title}
        subtitle={dict.projects.subtitle}
      />
      <Section>
        <ProjectsExplorer
          projects={projects}
          categories={categories}
          locale={locale}
          emptyLabel={dict.projects.empty}
        />
      </Section>
    </>
  );
}
