import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LabCard } from "@/components/lab-card";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { labs } from "@/data/labs";
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
  return { title: dict.labs.title, description: dict.labs.subtitle };
}

export default async function LabsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <PageHeader title={dict.labs.title} subtitle={dict.labs.subtitle} />
      <Section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {labs.map((lab) => (
            <LabCard key={lab.slug} lab={lab} locale={locale} />
          ))}
        </div>
      </Section>
    </>
  );
}
