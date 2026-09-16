import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import { utcDate } from "@/lib/utils";

// static export writes this route to a file at build
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/cookies`, changeFrequency: "yearly", priority: 0.3 },
    ...getAllPosts().map((post) => ({ url: `${SITE_URL}/blog/${post.slug}`, lastModified: utcDate(post.date), changeFrequency: "yearly" as const, priority: 0.7 })),
  ];
}
