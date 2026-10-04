import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getAllPosts, getPost } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Blog post by Gaya KACI";

// one image per post, same set the post pages are built for
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

// read once at module scope: the fonts do not depend on the slug. These are the
// site's JetBrains subset, decompressed to TTF because satori cannot parse
// WOFF2. assets/ is outside public/, so the TTFs are bundled, not published.
const bold = readFileSync(join(process.cwd(), "assets/JetBrainsMono-Bold.ttf"));
const regular = readFileSync(
  join(process.cwd(), "assets/JetBrainsMono-Regular.ttf"),
);

const BG = "#151516";
const FG = "#f7f7f8";
const MUTED = "#8a8a8e";
const BORDER = "#2a2a2c";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? "Gaya KACI";
  const meta = post ? `${formatDate(post.date)} · ${post.minutes} min read` : "";
  const tags = post?.tags?.slice(0, 4) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: FG,
          padding: "64px 72px",
          fontFamily: "JetBrains",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: MUTED }}>
          $ cat /blog/{slug}.md
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 48 ? 56 : 68,
            fontWeight: 700,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 28,
            fontSize: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: FG }}>Gaya KACI</span>
            <span style={{ color: MUTED, fontSize: 20 }}>{meta}</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  display: "flex",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 20,
                  color: MUTED,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "JetBrains", data: regular, weight: 400, style: "normal" },
        { name: "JetBrains", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
