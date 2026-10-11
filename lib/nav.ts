export type NavKey = "home" | "projects" | "blog" | "labs" | "about";

export const navItems: { key: NavKey; href: string }[] = [
  { key: "home", href: "/" },
  { key: "projects", href: "/projects" },
  { key: "blog", href: "/blog" },
  { key: "labs", href: "/labs" },
  { key: "about", href: "/about" },
];
