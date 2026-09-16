import { ArrowUpRight, ChevronDown } from "lucide-react";
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
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/collapsible";
import { loadProjects } from "@/lib/projects";

export async function Projects() {
  const { pinned, more } = await loadProjects();

  return (
    <section id="projects" className="mt-12 border-t pt-12">
      <h2 className="md-h2 text-base uppercase">projects</h2>
      <p className="mt-2 text-xs text-muted-foreground tabular-nums">
        selected open-source work · demos where available
      </p>
      <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {pinned.map((p) => (
          <li key={p.name}>
            {/* the title link stretches over the card, so the whole card opens
                the repo; the demo button is raised back above it */}
            <Card
              className="stretched-focus h-full transition-colors hover:bg-accent has-[a:focus-visible]:bg-accent"
              as="article"
            >
              <CardHeader className="p-4">
                <CardTitle as="h3">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="outline-none after:absolute after:inset-0"
                  >
                    {p.name}
                    <span className="sr-only"> (source, opens in new tab)</span>
                  </a>
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  {p.desc}
                </CardDescription>
                <CardAction>
                  <ArrowUpRight aria-hidden="true" className="size-4 opacity-80" />
                </CardAction>
              </CardHeader>
              <CardFooter className="mt-auto flex-col items-start gap-3 p-4">
                <div className="flex flex-wrap gap-1">
                  {p.stack.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
                {p.homepage && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="z-10"
                    render={
                      <a href={p.homepage} target="_blank" rel="noreferrer" />
                    }
                  >
                    live demo
                    <span className="sr-only">
                      {" "}
                      for {p.name} (opens in new tab)
                    </span>
                    <ArrowUpRight aria-hidden="true" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
      <Collapsible className="mt-6">
        <CollapsibleTrigger
          render={
            <Button variant="outline" size="sm">
              show {more.length} more projects
              <ChevronDown
                aria-hidden="true"
                className="transition-transform in-[[data-panel-open]]:rotate-180"
              />
            </Button>
          }
        />
        <CollapsiblePanel>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {more.map((project) => (
              <li
                key={project.name}
                className="before:text-muted-foreground before:content-['-_']"
              >
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  {project.name}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </CollapsiblePanel>
      </Collapsible>
    </section>
  );
}
