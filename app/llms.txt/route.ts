import { getAllPosts } from "@/lib/posts";
import { AUTHOR, SITE_URL } from "@/lib/site";

// the static export writes this handler's response to out/llms.txt at build.
// Format: https://llmstxt.org. Search engines ignore it; some AI tools read it.
export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts()
    .map((post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}/): ${post.description}`)
    .join("\n");
  const text = `# ${AUTHOR.name}

> ${AUTHOR.jobTitle} in Paris. Technical notes on browser security, automation, and reverse engineering.

## Pages

- [Home](${SITE_URL}/): about, projects, contributions, writing, and contact
- [Writing](${SITE_URL}/blog/): all posts, newest first
- [RSS feed](${SITE_URL}/feed.xml)

## Posts

${posts}
`;
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
