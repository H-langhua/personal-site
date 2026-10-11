import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { educations, experiences } from "@/data/experience";
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
                {dict.about.experience}
              </h2>
              <ol className="mt-6 space-y-8 border-l border-border/60 pl-6">
                {experiences.map((item) => (
                  <li key={`${item.company}-${item.period}`} className="relative">
                    <span className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full border-2 border-background bg-brand" />
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium">{item.role[locale]}</span>
                      <span className="text-muted-foreground">
                        @ {item.company}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{item.period}</span>
                      <span aria-hidden>·</span>
                      <span>{item.location[locale]}</span>
                    </div>
                    <ul className="mt-3 space-y-1.5">
                      {item.points[locale].map((point) => (
                        <li
                          key={point}
                          className="flex gap-2 text-sm text-muted-foreground"
                        >
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold">
                {dict.about.education}
              </h2>
              <ul className="mt-6 space-y-4">
                {educations.map((item) => (
                  <li key={item.school} className="text-sm">
                    <p className="font-medium">{item.school}</p>
                    <p className="mt-1 text-muted-foreground">
                      {item.major[locale]} · {item.period}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="rounded-xl border border-border/60 p-5">
              <h2 className="text-sm font-medium">{dict.about.skills}</h2>
              <dl className="mt-4 space-y-4">
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
