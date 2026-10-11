"use client";

import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import type { Project } from "@/data/projects";
import type { Locale } from "@/lib/i18n";

export function ProjectsExplorer({
  projects,
  categories,
  locale,
  emptyLabel,
}: {
  projects: Project[];
  categories: { value: string; label: string }[];
  locale: Locale;
  emptyLabel: string;
}) {
  const [active, setActive] = useState("all");

  const filtered = useMemo(
    () =>
      active === "all"
        ? projects
        : projects.filter((project) => project.category === active),
    [active, projects],
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.value}
            size="sm"
            variant={active === category.value ? "default" : "outline"}
            onClick={() => setActive(category.value)}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </div>
  );
}
