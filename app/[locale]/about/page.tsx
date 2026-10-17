import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/data/site";
import { skillGroups } from "@/data/skills";
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
  return { title: dict.about.title, description: dict.about.subtitle };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <PageHeader title={dict.about.title} subtitle={dict.about.subtitle} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-10">
            <div>
              <h2 className="font-heading text-lg font-semibold">
                {dict.about.skills}
              </h2>
              <dl className="mt-6 space-y-5">
                {skillGroups.map((group) => (
                  <div key={group.title.en}>
                    <dt className="text-xs text-muted-foreground">
                      {group.title[locale]}
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="rounded-xl border border-border/60 p-5 text-sm">
              <h2 className="text-sm font-medium">{dict.footer.connect}</h2>
              <p className="mt-3 text-muted-foreground">{siteConfig.email}</p>
            </div>
          </aside>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading title={dict.home.contactTitle} />
      </Section>
    </>
  );
}
