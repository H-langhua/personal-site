"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales, localeLabels, type Locale } from "@/lib/i18n";

export function LocaleSwitcher({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const pathname = usePathname() || `/${locale}`;
  const rest = pathname.replace(/^\/(zh|en)/, "");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label} title={label}>
          <Globe className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {locales.map((item) => (
          <DropdownMenuItem key={item} asChild>
            <Link
              href={`/${item}${rest}`}
              className="flex items-center justify-between gap-3"
            >
              <span>{localeLabels[item]}</span>
              {item === locale ? <Check className="size-3.5" /> : null}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
