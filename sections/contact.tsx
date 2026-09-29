import { CodeXml, Mail } from "lucide-react";
import { Button } from "@/components/button";
import { Card, CardPanel } from "@/components/card";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/icons";
import { Separator } from "@/components/separator";
import { socials } from "@/lib/socials";
import { cn } from "@/lib/utils";

const lines = [
  {
    icon: Mail,
    label: "mail",
    value: socials.email,
    href: `mailto:${socials.email}`,
  },
  {
    icon: GithubIcon,
    label: "git",
    value: socials.githubLabel,
    href: socials.github,
  },
  {
    icon: LinkedinIcon,
    label: "in",
    value: socials.linkedinLabel,
    href: socials.linkedin,
  },
  {
    icon: XIcon,
    label: "x",
    value: socials.xLabel,
    href: socials.x,
  },
  {
    icon: CodeXml,
    label: "g.dev",
    value: socials.googleDeveloperLabel,
    href: socials.googleDeveloper,
  },
];

export function Contact() {
  return (
    <section id="contact" className="mt-12 border-t pt-12">
      <h2 className="md-h2 text-base uppercase">contact</h2>
      <p className="mt-2 text-xs text-muted-foreground">
        email works best
      </p>
      <Card className="mt-4">
        <CardPanel className="flex flex-col p-2">
          {lines.map(({ icon: Icon, label, value, href }, index) => {
            const external = href.startsWith("http");
            // mail is the primary channel, so it carries the filled variant and
            // the profile links stay quiet.
            const primary = index === 0;
            return (
              <div key={label} className="flex flex-col">
                {index > 0 && <Separator className="my-1" />}
                <Button
                  variant={primary ? "default" : "ghost"}
                  className={cn(
                    // the email is a single unbreakable run and the button is
                    // nowrap by default, which pushed the card past the
                    // viewport on a narrow phone. Let the row grow instead.
                    "h-auto min-h-9 flex-wrap justify-start gap-x-3 gap-y-1 whitespace-normal py-2 text-left sm:h-auto sm:min-h-8",
                    !primary && "text-muted-foreground",
                  )}
                  render={
                    <a
                      href={href}
                      {...(external && { target: "_blank", rel: "noreferrer" })}
                    />
                  }
                >
                  <Icon aria-hidden="true" />
                  <span
                    className={cn(
                      "text-xs uppercase",
                      primary
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 wrap-anywhere underline underline-offset-4 decoration-muted-foreground",
                      !primary && "text-foreground",
                    )}
                    translate="no"
                  >
                    {value}
                  </span>
                  {external && (
                    <span className="sr-only">(opens in new tab)</span>
                  )}
                </Button>
              </div>
            );
          })}
        </CardPanel>
      </Card>
    </section>
  );
}
