import Link from "next/link";
import { ArrowRight, Mail, Sparkles } from "lucide-react";

import { LabCard } from "@/components/lab-card";
import { PostCard } from "@/components/post-card";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import { Button } from "@/components/ui/button";
import { labs } from "@/data/labs";
import { projects } from "@/data/projects";
import { siteConfig } from "@/data/site";
import { skillGroups } from "@/data/skills";
import { getAllPosts } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, localizedPath } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const featured = projects.filter((project) => project.featured);
  const posts = getAllPosts(locale).slice(0, 3);
  const stats = [
    { value: "7+", label: dict.home.stats.years },
    { value: `${projects.length}`, label: dict.home.stats.projects },
    { value: `${labs.length}`, label: dict.home.stats.demos },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
        <div className="pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5 text-brand" />
              {dict.home.role}
            </span>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight sm:text-6xl">
              {dict.home.greeting}{" "}
              <span className="glow-text text-brand">
                {dict.home.name}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg text-foreground/90">
              {dict.home.tagline}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              {dict.home.intro}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href={localizedPath(locale, "/projects")}>
                  {dict.home.ctaProjects}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={`mailto:${siteConfig.email}`}>
                  <Mail className="size-4" />
                  {dict.home.ctaContact}
                </a>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs text-muted-foreground">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-heading text-2xl font-semibold text-brand">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <Section id="skills">
        <SectionHeading
          title={dict.home.skillsTitle}
          subtitle={dict.home.skillsSubtitle}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map((group, index) => (
            <Reveal key={group.title.en} delay={index * 0.05}>
              <div className="h-full rounded-xl border border-border/60 p-5">
                <h3 className="text-sm font-medium text-brand">
                  {group.title[locale]}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="projects" className="border-t border-border/60">
        <SectionHeading
          title={dict.home.projectsTitle}
          subtitle={dict.home.projectsSubtitle}
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href={localizedPath(locale, "/projects")}>
                {dict.common.viewAll}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((project, index) => (
            <Reveal key={project.slug} delay={index * 0.05} className="h-full">
              <ProjectCard project={project} locale={locale} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="labs" className="border-t border-border/60">
        <SectionHeading
          title={dict.home.labsTitle}
          subtitle={dict.home.labsSubtitle}
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href={localizedPath(locale, "/labs")}>
                {dict.common.viewAll}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {labs.map((lab, index) => (
            <Reveal key={lab.slug} delay={index * 0.05} className="h-full">
              <LabCard lab={lab} locale={locale} />
            </Reveal>
          ))}
        </div>
      </Section>

      {posts.length > 0 ? (
        <Section id="posts" className="border-t border-border/60">
          <SectionHeading
            title={dict.home.postsTitle}
            subtitle={dict.home.postsSubtitle}
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link href={localizedPath(locale, "/blog")}>
                  {dict.common.viewAll}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((post, index) => (
              <Reveal key={post.slug} delay={index * 0.05} className="h-full">
                <PostCard
                  post={post}
                  locale={locale}
                  readingLabel={dict.blog.readingTime.replace(
                    "{minutes}",
                    String(post.readingMinutes),
                  )}
                />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      <Section className="border-t border-border/60">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-border/60 p-8 sm:p-12">
            <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-40" />
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand/15 blur-3xl" />
            <div className="relative">
              <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
                {dict.home.contactTitle}
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                {dict.home.contactDesc}
              </p>
              <Button className="mt-6" size="lg" asChild>
                <a href={`mailto:${siteConfig.email}`}>
                  <Mail className="size-4" />
                  {dict.home.contactCta}
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
