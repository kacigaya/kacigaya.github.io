import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";
import { utcDate } from "@/lib/utils";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

// Replaces gray-matter, which is pinned to the js-yaml 3 API (`safeLoad`) that
// the security override in package.json no longer provides. Every field is
// validated below anyway, so the block only has to be split off and parsed.
export function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const match = FRONTMATTER.exec(raw);
  if (!match) return { data: {}, content: raw };
  const data = load(match[1]);
  return {
    data: data && typeof data === "object" ? (data as Record<string, unknown>) : {},
    content: raw.slice(match[0].length),
  };
}

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  minutes: number;
  tags?: string[];
  repo?: string;
  featured?: boolean;
};

export type Post = PostMeta & { content: string };

function metadata(
  slug: string,
  data: Record<string, unknown>,
  content: string,
): PostMeta {
  if (typeof data.title !== "string" || typeof data.date !== "string" || typeof data.description !== "string") {
    throw new Error(`${slug}: title, date, and description must be strings`);
  }
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`${slug}: invalid slug`);
  const date = utcDate(data.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== data.date) {
    throw new Error(`${slug}: date must be YYYY-MM-DD`);
  }
  if (data.tags !== undefined && (!Array.isArray(data.tags) || !data.tags.every((tag) => typeof tag === "string"))) {
    throw new Error(`${slug}: tags must be strings`);
  }
  if (data.repo !== undefined && (typeof data.repo !== "string" || !URL.canParse(data.repo) || !/^https?:$/.test(new URL(data.repo).protocol))) {
    throw new Error(`${slug}: repo must be an HTTP(S) URL`);
  }
  if (data.featured !== undefined && typeof data.featured !== "boolean") {
    throw new Error(`${slug}: featured must be a boolean`);
  }
  return {
    slug,
    title: data.title,
    date: data.date,
    description: data.description,
    minutes: readingTime(content),
    tags: data.tags as string[] | undefined,
    repo: data.repo as string | undefined,
    featured: data.featured as boolean | undefined,
  };
}

export function readingTime(content: string): number {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 220));
}

export type Heading = { id: string; text: string; level: 2 | 3 };

// Must stay in sync with the id the rendered headings get in the post page:
// the table of contents links to these.
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

// The text a heading renders as: link syntax collapses to its label, emphasis
// and code markers disappear, entities resolve. Must match what the rendered
// heading contains, since ids are matched on it.
function headingText(raw: string): string {
  return raw
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_]/g, "")
    .replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity])
    .trim();
}

// Headings inside fenced code are comments, not structure. A fence only closes
// on a run of the same character at least as long as the one that opened it,
// so a ``` line inside a ~~~ block does not end it.
export function getHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  let fence: { char: string; length: number } | null = null;

  for (const line of content.split("\n")) {
    const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      const [char, length] = [fenceMatch[1][0], fenceMatch[1].length];
      if (!fence) fence = { char, length };
      else if (fence.char === char && length >= fence.length) fence = null;
      continue;
    }
    if (fence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = headingText(match[2]);
    if (!text) continue;

    // two headings with the same text would otherwise share an id, and every
    // link to it would land on the first one.
    const slug = slugify(text);
    const count = seen.get(slug) ?? 0;
    seen.set(slug, count + 1);

    headings.push({
      id: count === 0 ? slug : `${slug}-${count + 1}`,
      text,
      level: match[1].length as 2 | 3,
    });
  }
  return headings;
}

// getAllPosts is newest first, so the next entry is the older post.
export function getAdjacentPosts(slug: string): {
  older: PostMeta | null;
  newer: PostMeta | null;
} {
  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return { older: null, newer: null };
  return {
    older: posts[index + 1] ?? null,
    newer: posts[index - 1] ?? null,
  };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf8");
      const { data, content } = parseFrontmatter(raw);
      return metadata(slug, data, content);
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// The homepage leads with research rather than the newest post, so it shows
// the posts flagged `featured` (newest first). With none flagged it falls back
// to the latest few, so the section is never empty.
export function getFeaturedPosts(limit = 4): PostMeta[] {
  const posts = getAllPosts();
  const featured = posts.filter((p) => p.featured);
  return (featured.length > 0 ? featured : posts).slice(0, limit);
}

export function getPost(slug: string): Post | null {
  const file = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = parseFrontmatter(raw);
  return { ...metadata(slug, data, content), content };
}
