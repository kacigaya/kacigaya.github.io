import { describe, expect, test } from "bun:test";
import { GET } from "@/app/feed.xml/route";
import {
  featuredPosts,
  getAdjacentPosts,
  getAllPosts,
  getHeadings,
  getPost,
  parseFrontmatter,
  readingTime,
  slugify,
} from "@/lib/posts";

describe("posts", () => {
  test("loads valid posts once with stable metadata", () => {
    const posts = getAllPosts();

    expect(posts.length).toBeGreaterThan(0);
    expect(posts).toEqual([...posts].sort((a, b) => b.date.localeCompare(a.date)));
    for (const post of posts) {
      expect(new Date(`${post.date}T00:00:00Z`).toISOString().slice(0, 10)).toBe(post.date);
      expect(post.minutes).toBeGreaterThan(0);
      expect(getPost(post.slug)?.minutes).toBe(post.minutes);
    }
  });

  test("splits frontmatter from body and tolerates its absence", () => {
    expect(
      parseFrontmatter(
        ['---', 'title: "A"', 'tags: ["x", "y"]', '---', '', 'body ---- text'].join("\r\n"),
      ),
    ).toEqual({ data: { title: "A", tags: ["x", "y"] }, content: "\r\nbody ---- text" });

    expect(parseFrontmatter("# no frontmatter")).toEqual({
      data: {},
      content: "# no frontmatter",
    });
    expect(parseFrontmatter("---\n42\n---\nbody").data).toEqual({});
  });

  test("rounds reading time up to at least one minute", () => {
    expect(readingTime("")).toBe(1);
    expect(readingTime(Array(221).fill("word").join(" "))).toBe(2);
  });

  test("collects h2 and h3 headings, ignoring fenced code", () => {
    const headings = getHeadings(
      [
        "intro text",
        "## First `heading`",
        "### Nested one",
        "```sh",
        "## not a heading",
        "```",
        "#### too deep",
        "# also skipped",
        "## Second",
      ].join("\n"),
    );

    expect(headings).toEqual([
      { id: "first-heading", text: "First heading", level: 2 },
      { id: "nested-one", text: "Nested one", level: 3 },
      { id: "second", text: "Second", level: 2 },
    ]);
  });

  test("closes a fence only on a matching run", () => {
    const headings = getHeadings(
      [
        "~~~md",
        "```",
        "## inside a nested fence",
        "```",
        "~~~",
        "## After",
      ].join("\n"),
    );

    expect(headings).toEqual([{ id: "after", text: "After", level: 2 }]);
  });

  test("slugifies heading text to anchor-safe ids", () => {
    expect(slugify("Why TLS 1.3 / ECH?")).toBe("why-tls-1-3-ech");
    expect(slugify("---edge---")).toBe("edge");
  });

  test("walks neighbours in date order and ends at the boundaries", () => {
    const posts = getAllPosts();
    const newest = getAdjacentPosts(posts[0].slug);
    const oldest = getAdjacentPosts(posts[posts.length - 1].slug);

    expect(newest.newer).toBeNull();
    expect(newest.older?.slug).toBe(posts[1].slug);
    expect(oldest.older).toBeNull();
    expect(oldest.newer?.slug).toBe(posts[posts.length - 2].slug);
    expect(getAdjacentPosts("missing")).toEqual({ older: null, newer: null });
  });

  test("generates an escaped RSS feed for every post", async () => {
    const response = GET();
    const xml = await response.text();

    expect(response.headers.get("content-type")).toContain("application/rss+xml");
    expect(xml).toStartWith('<?xml version="1.0" encoding="UTF-8"?>');
    for (const post of getAllPosts()) {
      expect(xml).toContain(`/blog/${encodeURIComponent(post.slug)}`);
      expect(xml).toContain(`<title>${post.title.replaceAll("&", "&amp;")}</title>`);
    }
  });
  test("features flagged posts, falling back to the newest", () => {
    const post = (slug: string, featured?: boolean) => ({
      slug,
      title: slug,
      date: "2025-01-01",
      description: "",
      minutes: 1,
      featured,
    });
    const posts = [post("a"), post("b", true), post("c"), post("d", true)];
    expect(featuredPosts(posts).map((p) => p.slug)).toEqual(["b", "d"]);
    expect(featuredPosts(posts, 1).map((p) => p.slug)).toEqual(["b"]);
    const plain = [post("a"), post("b"), post("c")];
    expect(featuredPosts(plain, 2).map((p) => p.slug)).toEqual(["a", "b"]);
  });
});
