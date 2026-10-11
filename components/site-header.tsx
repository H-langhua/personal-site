import Link from "next/link";
import { Code2 } from "lucide-react";

import { siteConfig } from "@/data/site";
import { getDictionary } from "@/lib/dictionaries";
import { localizedPath, type Locale } from "@/lib/i18n";
import { navItems } from "@/lib/nav";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale);
  const items = navItems.map((item) => ({
    href: item.href,
    label: dict.nav[item.key],
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={localizedPath(locale, "/")}
          className="flex items-center gap-2 font-heading text-base font-semibold"
        >
          <span className="grid size-7 place-items-center rounded-md bg-brand text-xs font-bold text-brand-foreground">
            {siteConfig.initials}
          </span>
          <span>{siteConfig.name[locale]}</span>
        </Link>

        <NavLinks locale={locale} items={items} className="hidden md:flex" />

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <a
              href={siteConfig.social.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              title="GitHub"
            >
              <Code2 className="size-4" />
            </a>
          </Button>
          <LocaleSwitcher locale={locale} label={dict.common.language} />
          <ThemeToggle label={dict.common.theme} />
          <MobileNav
            locale={locale}
            items={items}
            label={dict.common.menu}
            brand={siteConfig.name[locale]}
          />
        </div>
      </div>
    </header>
  );
}
