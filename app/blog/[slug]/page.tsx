import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache, Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { createMarkdownComponents } from "@/components/markdown";
import { Nav } from "@/components/nav";
import { Separator } from "@/components/separator";
import { SkipLink } from "@/components/skip-link";
import {
  getAdjacentPosts,
  getAllPosts,
  getHeadings,
  getPost,
  type PostMeta,
} from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { AUTHOR, PERSON_ID, SITE_URL, WEBSITE_ID } from "@/lib/site";
import "./prose.css";

const getCachedPost = cache(getPost);

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

function AdjacentPost({
  post,
  direction,
}: {
  post: PostMeta;
  direction: "older" | "newer";
}) {
  const older = direction === "older";
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex min-w-0 flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-accent ${older ? "items-end text-right" : ""}`}
    >
      <span className="flex items-center gap-1 text-xs text-muted-foreground uppercase">
        {!older && <ArrowLeft aria-hidden="true" className="size-3.5" />}
        {older ? "older" : "newer"}
        {older && <ArrowRight aria-hidden="true" className="size-3.5" />}
      </span>
      <span className="text-sm leading-snug text-pretty wrap-anywhere">
        {post.title}
      </span>
    </Link>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getCachedPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `/blog/${slug}`,
      // The opengraph-image route in this segment renders the PNG, but a static
      // export writes it extensionless, which GitHub Pages serves with a
      // non-image MIME type. postbuild-og.mjs renames it to .png, so the URL is
      // set by hand here (overriding the convention's extensionless default) to
      // match the renamed file.
      images: [`/blog/${slug}/opengraph-image.png`],
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      tags: post.tags,
    },
  };
}

function BlogPostSkeleton() {
  return (
    <main
      id="main"
      aria-busy="true"
      className="mx-auto max-w-3xl px-6 pt-24 pb-32 md:px-8"
    >
      <span className="sr-only" role="status">Loading post…</span>
      <div className="h-4 w-40 rounded bg-muted" />
      <div className="mt-6 border-b pb-6">
        <div className="h-8 max-w-xl rounded bg-muted" />
        <div className="mt-3 h-4 w-48 rounded bg-muted" />
      </div>
      <div className="mt-8 space-y-3">
        <div className="h-4 rounded bg-muted" />
        <div className="h-4 rounded bg-muted" />
        <div className="h-4 w-4/5 rounded bg-muted" />
      </div>
    </main>
  );
}

async function BlogPostContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getCachedPost(slug);
  if (!post) notFound();

  const headings = getHeadings(post.content);
  const { older, newer } = getAdjacentPosts(slug);

  const url = `${SITE_URL}/blog/${slug}/`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      url,
      mainEntityOfPage: url,
      image: `${SITE_URL}/blog/${slug}/opengraph-image.png`,
      keywords: post.tags,
      inLanguage: "en",
      isPartOf: { "@id": WEBSITE_ID },
      author: { "@type": "Person", "@id": PERSON_ID, name: AUTHOR.name, url: `${SITE_URL}/` },
      publisher: { "@id": PERSON_ID },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Writing", item: `${SITE_URL}/blog/` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 md:px-8 pt-24 pb-32">
        <JsonLd data={jsonLd} />
        <p className="text-sm text-muted-foreground">/blog/{post.slug}.md</p>
        <header className="mt-6 border-b pb-6">
          <h1 className="md-h1 text-2xl md:text-3xl leading-tight text-balance">
            {post.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="tabular-nums">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.updated && (
                <>
                  {" "}· updated{" "}
                  <time dateTime={post.updated}>{formatDate(post.updated)}</time>
                </>
              )}{" "}
              · {post.minutes} min read
            </span>
            {post.tags && post.tags.length > 0 && (
              <span className="flex flex-wrap gap-1">
                {post.tags.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </span>
            )}
            {post.repo && (
              <Button
                variant="outline"
                size="xs"
                render={<a href={post.repo} target="_blank" rel="noreferrer" />}
              >
                source repo
                <span className="sr-only">(opens in new tab)</span>
                <ArrowUpRight aria-hidden="true" />
              </Button>
            )}
          </div>
        </header>
        {/* short posts do not need an index, and a two-item one is noise */}
        {headings.length >= 3 && (
          <nav aria-label="table of contents" className="mt-8 rounded-lg border p-4">
            <p className="text-xs text-muted-foreground uppercase">contents</p>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm">
              {headings.map((h) => (
                <li key={h.id} className={h.level === 3 ? "pl-4" : undefined}>
                  <a
                    href={`#${h.id}`}
                    className="text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <article className="prose prose-blog mt-8">
          <ReactMarkdown
            components={createMarkdownComponents(headings)}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
          >
            {post.content}
          </ReactMarkdown>
        </article>
        <aside aria-label="about the author" className="mt-12 rounded-lg border p-4 text-sm">
          <p className="text-xs text-muted-foreground uppercase">written by</p>
          <p className="mt-2">
            <Link
              href="/"
              rel="author"
              className="underline decoration-border underline-offset-4 hover:text-muted-foreground"
            >
              {AUTHOR.name}
            </Link>
            <span className="text-muted-foreground">
              {" "}· {AUTHOR.jobTitle.toLowerCase()} in Paris.
            </span>
          </p>
        </aside>
        <Separator className="mt-12" />
        {(older || newer) && (
          <nav
            aria-label="more posts"
            className="mt-6 grid gap-3 sm:grid-cols-2"
          >
            {/* the spacer only exists to push a lone older post to the right
                column, so it must not add a row on a stacked layout */}
            {newer ? (
              <AdjacentPost post={newer} direction="newer" />
            ) : (
              <div className="hidden sm:block" />
            )}
            {older && <AdjacentPost post={older} direction="older" />}
          </nav>
        )}
        <Button
          variant="outline"
          size="sm"
          className="mt-6"
          render={<Link href="/blog" />}
        >
          <span className="bracketed">back to /blog</span>
        </Button>
    </main>
  );
}

export default function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <>
      <SkipLink />
      <Nav />
      <Suspense fallback={<BlogPostSkeleton />}>
        <BlogPostContent params={params} />
      </Suspense>
      <Footer className="pt-0" />
    </>
  );
}
