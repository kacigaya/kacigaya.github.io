import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import { utcDate } from "@/lib/utils";
import { LEGAL_UPDATED } from "./(legal)/updated";

// static export writes this route to a file at build
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // trailingSlash: true makes every route canonical with a trailing slash, so
  // the sitemap must match; a bare-path entry would list the URL that 301s.
  const posts = getAllPosts().map((post) => ({ slug: post.slug, modified: post.updated ?? post.date }));
  // the blog index changes when any post does
  const blogModified = posts.reduce((latest, p) => (p.modified > latest ? p.modified : latest), "");
  return [
    // the homepage embeds GitHub data refreshed by the daily rebuild, so the
    // build itself is its last change
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/blog/`, ...(blogModified && { lastModified: utcDate(blogModified) }), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/privacy/`, lastModified: utcDate(LEGAL_UPDATED), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/cookies/`, lastModified: utcDate(LEGAL_UPDATED), changeFrequency: "yearly", priority: 0.3 },
    ...posts.map((post) => ({ url: `${SITE_URL}/blog/${post.slug}/`, lastModified: utcDate(post.modified), changeFrequency: "yearly" as const, priority: 0.7 })),
  ];
}
