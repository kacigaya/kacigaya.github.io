import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/badge";
import { Card, CardPanel } from "@/components/card";
import { Separator } from "@/components/separator";
import { certifications, foundational } from "@/lib/certifications";
import { cn } from "@/lib/utils";

export function Certifications() {
  return (
    <section id="certifications" className="mt-12 border-t pt-12">
      <h2 className="md-h2 text-base uppercase">certifications</h2>
      <p className="mt-2 text-xs text-muted-foreground">
        linked rows open credentials or provider profiles
      </p>
      <Card className="mt-4">
        <CardPanel className="flex flex-col p-2">
          {certifications.map((cert, index) => (
            <div key={cert.name} className="flex flex-col">
              {index > 0 && <Separator className="my-1" />}
              {/* the name link stretches over the row, so the whole row opens
                  the credential; rows without one stay inert */}
              <div
                className={cn(
                  "relative flex items-center justify-between gap-3 rounded-lg px-3 py-2.5",
                  cert.url &&
                    "stretched-focus transition-colors hover:bg-accent has-[a:focus-visible]:bg-accent",
                )}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm text-foreground wrap-anywhere">
                    {cert.url ? (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noreferrer"
                        className="outline-none after:absolute after:inset-0"
                      >
                        {cert.name}
                        <span className="sr-only">
                          {" "}
                          credential (opens in new tab)
                        </span>
                      </a>
                    ) : (
                      cert.name
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {cert.issuer}
                  </span>
                </div>
                {cert.url && (
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 shrink-0 opacity-80"
                  />
                )}
              </div>
            </div>
          ))}
        </CardPanel>
      </Card>
      <h3 className="md-h3 mt-6 text-sm uppercase">course badges</h3>
      <ul className="mt-2 flex flex-wrap gap-1">
        {foundational.map((cert) => (
          <li key={cert.name}>
            <Badge variant="outline" className="text-muted-foreground">
              {cert.name}
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  );
}
