import Link from "next/link";
import { ArrowUpRight, Rss } from "lucide-react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { getAllPosts } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { FEED_PATH } from "@/lib/site";

export function Blogs() {
  const posts = getAllPosts();

  return (
    <section id="blogs" className="mt-12 border-t pt-12">
      <h2 className="md-h2 text-base uppercase">writing</h2>
      <p className="mt-2 text-xs text-muted-foreground tabular-nums">
        {posts.length} {posts.length === 1 ? "entry" : "entries"} · notes and
        write-ups
      </p>
      <ul className="mt-6 grid grid-cols-1 gap-3">
        {posts.map((p) => (
          <li key={p.slug}>
            {/* the title link stretches over the card, so the whole card is the hit target */}
            <Card className="stretched-focus transition-colors hover:bg-accent has-[a:focus-visible]:bg-accent">
              <CardHeader className="p-4">
                <CardTitle as="h3">
                  <Link
                    href={`/blog/${p.slug}`}
                    className="outline-none after:absolute after:inset-0"
                  >
                    {p.title}
                  </Link>
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  {p.description}
                </CardDescription>
                <CardAction>
                  <ArrowUpRight aria-hidden="true" className="size-4 opacity-80" />
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-wrap items-center gap-2 p-4">
                <span className="text-xs text-muted-foreground tabular-nums">
                  <time dateTime={p.date}>{formatDate(p.date)}</time> ·{" "}
                  {p.minutes} min
                </span>
                {p.tags?.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" render={<Link href="/blog" />}>
          browse all posts
          <ArrowUpRight aria-hidden="true" />
        </Button>
        <Button variant="outline" size="sm" render={<a href={FEED_PATH} />}>
          <Rss aria-hidden="true" />
          rss
        </Button>
      </div>
    </section>
  );
}
