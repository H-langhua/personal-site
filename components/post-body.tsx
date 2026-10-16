import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "./mdx-components";

export async function PostBody({ source }: { source: string }) {
  return (
    <div
      data-article
      className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-heading prose-headings:scroll-mt-24 prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-code:before:content-none prose-code:after:content-none prose-pre:my-4 prose-pre:bg-[#0d1117] prose-pre:ring-1 prose-pre:ring-white/10"
    >
      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [rehypePrettyCode, { theme: "github-dark-default", keepBackground: true }],
            ],
          },
        }}
      />
    </div>
  );
}
