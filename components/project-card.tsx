import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Project } from "@/data/projects";
import { localizedPath, type Locale } from "@/lib/i18n";

export function ProjectCard({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  return (
    <Link
      href={localizedPath(locale, `/projects/${project.slug}`)}
      className="group block h-full"
    >
      <Card className="h-full transition-all group-hover:-translate-y-1 group-hover:ring-brand/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="group-hover:text-brand">
              {project.title[locale]}
            </CardTitle>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
          </div>
          <CardDescription>{project.summary[locale]}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </Link>
  );
}
