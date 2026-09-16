import type { Metadata } from "next";
import Link from "next/link";
import { Rss } from "lucide-react";
import { Button } from "@/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { SkipLink } from "@/components/skip-link";
import { getAllPosts } from "@/lib/posts";
import { FEED_PATH } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on browser security, automation, reverse engineering, and web development.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <>
      <SkipLink />
      <Nav />
      <main id="main" className="mx-auto max-w-3xl px-6 pt-24 pb-32 md:px-8">
        <h1 className="md-h1 text-2xl md:text-3xl uppercase">Writing</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Notes from my work on browser security, automation, reverse
          engineering, and web development.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-5"
          render={<a href={FEED_PATH} />}
        >
          <Rss aria-hidden="true" />
          rss
        </Button>
        <ul className="mt-10 flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.slug}>
              {/* the title link stretches over the card, so the whole card is the hit target */}
              <Card className="stretched-focus transition-colors hover:bg-accent has-[a:focus-visible]:bg-accent">
                <CardHeader className="p-4">
                  <CardTitle as="h2">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="outline-none after:absolute after:inset-0"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-4">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    <time dateTime={post.date}>{formatDate(post.date)}</time> ·{" "}
                    {post.minutes} min read
                  </span>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      </main>
      <Footer className="pt-0" />
    </>
  );
}
