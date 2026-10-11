import Link from "next/link";
import { FlaskConical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Lab } from "@/data/labs";
import { localizedPath, type Locale } from "@/lib/i18n";

export function LabCard({ lab, locale }: { lab: Lab; locale: Locale }) {
  return (
    <Link
      href={localizedPath(locale, `/labs/${lab.slug}`)}
      className="group block h-full"
    >
      <Card className="h-full transition-all group-hover:-translate-y-1 group-hover:ring-brand/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-md bg-brand/15 text-brand">
              <FlaskConical className="size-4" />
            </span>
            <CardTitle className="group-hover:text-brand">
              {lab.title[locale]}
            </CardTitle>
          </div>
          <CardDescription>{lab.summary[locale]}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto flex flex-wrap gap-1.5">
          <Badge variant={lab.status === "wip" ? "outline" : "secondary"}>
            {lab.status === "wip" ? "WIP" : "Stable"}
          </Badge>
          {lab.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </Link>
  );
}
