"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Locale } from "@/lib/i18n";
import { NavLinks, type NavLinkItem } from "./nav-links";

export function MobileNav({
  locale,
  items,
  label,
  brand,
}: {
  locale: Locale;
  items: NavLinkItem[];
  label: string;
  brand: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label} className="md:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64">
        <SheetHeader>
          <SheetTitle>{brand}</SheetTitle>
        </SheetHeader>
        <NavLinks
          locale={locale}
          items={items}
          className="flex-col items-stretch gap-1 px-4"
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
