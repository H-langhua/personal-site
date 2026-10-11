"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { localizedPath, type Locale } from "@/lib/i18n";

export type NavLinkItem = { href: string; label: string };

export function NavLinks({
  locale,
  items,
  className,
  onNavigate,
}: {
  locale: Locale;
  items: NavLinkItem[];
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {items.map((item) => {
        const href = localizedPath(locale, item.href);
        const active =
          item.href === "/"
            ? pathname === `/${locale}` || pathname === `/${locale}/`
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={item.href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
              active && "text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
