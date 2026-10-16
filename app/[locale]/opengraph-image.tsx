import { ImageResponse } from "next/og";

import { siteConfig } from "@/data/site";
import { locales } from "@/lib/i18n";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Langfa Huang — Frontend Engineer";
export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0f19",
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgba(56,189,248,0.22), transparent 55%)",
          padding: 72,
          color: "#e5edf7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#38bdf8",
              color: "#0b0f19",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {siteConfig.initials}
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600 }}>
            {siteConfig.name.en}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 74,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.1,
            }}
          >
            Frontend Engineer
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#94a3b8",
              maxWidth: 900,
            }}
          >
            Web experience, visualization and engineering.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["Next.js", "React", "TypeScript", "AntV X6"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                fontSize: 24,
                color: "#cbd5f5",
                border: "1px solid rgba(148,163,184,0.35)",
                borderRadius: 999,
                padding: "8px 20px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
