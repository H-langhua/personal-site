import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";

export const mdxComponents = {
  a: ({ href = "", ...props }: ComponentPropsWithoutRef<"a">) => {
    if (href.startsWith("http")) {
      return <a href={href} target="_blank" rel="noreferrer" {...props} />;
    }
    return <Link href={href} {...props} />;
  },
};
