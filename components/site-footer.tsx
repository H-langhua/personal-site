import Link from "next/link";
import { AtSign, Code2, Link as LinkIcon, Mail } from "lucide-react";

import { siteConfig } from "@/data/site";
import { getDictionary } from "@/lib/dictionaries";
import { getCurrentYear } from "@/lib/format";
import { localizedPath, type Locale } from "@/lib/i18n";
import { navItems } from "@/lib/nav";

const socials = [
  { key: "github", href: siteConfig.social.github, Icon: Code2 },
  { key: "twitter", href: siteConfig.social.twitter, Icon: AtSign },
  { key: "linkedin", href: siteConfig.social.linkedin, Icon: LinkIcon },
  { key: "email", href: `mailto:${siteConfig.email}`, Icon: Mail },
] as const;

export async function SiteFooter({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale);
  const year = await getCurrentYear();

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-heading text-base font-semibold">
            <span className="grid size-7 place-items-center rounded-md bg-brand text-xs font-bold text-brand-foreground">
              {siteConfig.initials}
            </span>
            <span>{siteConfig.name[locale]}</span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            {dict.home.tagline}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">{dict.footer.sitemap}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={localizedPath(locale, item.href)}
                  className="transition-colors hover:text-foreground"
                >
                  {dict.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">{dict.footer.connect}</h3>
          <div className="flex items-center gap-2">
            {socials.map(({ key, href, Icon }) => (
              <a
                key={key}
                href={href}
                target={key === "email" ? undefined : "_blank"}
                rel="noreferrer"
                aria-label={key}
                className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>
            © {year} {siteConfig.name[locale]}. {dict.footer.rights}
          </p>
          <p>{dict.footer.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}
