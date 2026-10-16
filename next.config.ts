import type { NextConfig } from "next";

// Set at build time to host under a sub-path (e.g. GitHub Pages project sites
// build with NEXT_PUBLIC_BASE_PATH=/personal-site). Left empty for root hosting
// (Cloudflare Pages / Netlify / a custom domain).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Fully static export: no server required (works on GitHub Pages,
  // Cloudflare Pages, Netlify, S3, nginx, ...).
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(basePath ? { basePath } : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
