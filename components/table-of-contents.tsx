import type { Heading } from "@/lib/content";

export function TableOfContents({
  headings,
  label,
}: {
  headings: Heading[];
  label: string;
}) {
  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 hidden text-sm lg:block">
      <p className="mb-3 font-medium text-foreground">{label}</p>
      <ul className="space-y-2 border-l border-border/60">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: heading.depth === 3 ? 24 : 12 }}
          >
            <a
              href={`#${heading.id}`}
              className="-ml-px block border-l border-transparent pl-3 text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
