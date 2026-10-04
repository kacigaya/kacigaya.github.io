import { getAllPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import { utcDate } from "@/lib/utils";

// the static export writes this handler's response to out/feed.xml at build
export const dynamic = "force-static";

const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function GET() {
  // trailingSlash: true makes every route canonical with a trailing slash, so
  // the feed links to the slash form; the bare path would 301 on each click.
  const items = getAllPosts().map((post) => {
    const url = escape(`${SITE_URL}/blog/${encodeURIComponent(post.slug)}/`);
    return `<item><title>${escape(post.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${utcDate(post.date).toUTCString()}</pubDate><description>${escape(post.description)}</description></item>`;
  }).join("");
  const self = escape(`${SITE_URL}/feed.xml`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Gaya KACI</title><link>${SITE_URL}/blog/</link><atom:link href="${self}" rel="self" type="application/rss+xml"/><description>Technical notes on browser security, automation, and reverse engineering.</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
