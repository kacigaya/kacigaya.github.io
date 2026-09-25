import { socials } from "@/lib/socials";
import { BASE_PATH, FEED_PATH } from "@/lib/site";
import { cn } from "@/lib/utils";

const links = [
  { href: socials.github, label: "github", external: true },
  { href: socials.linkedin, label: "linkedin", external: true },
  { href: socials.x, label: "x", external: true },
  { href: socials.googleDeveloper, label: "g.dev", external: true },
  { href: FEED_PATH, label: "rss", external: false },
  { href: `${BASE_PATH}/privacy`, label: "privacy", external: false },
  { href: `${BASE_PATH}/cookies`, label: "cookies", external: false },
];

export function Footer({ className }: { className?: string }) {
  // evaluated at build time; the daily rebuild rolls it over in January
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        // last element on the page, so it is what a notch or a home indicator
        // lands on in landscape and at the end of the scroll.
        "mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-6 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pl-[calc(env(safe-area-inset-left)+1.5rem)] pr-[calc(env(safe-area-inset-right)+1.5rem)] text-xs text-muted-foreground md:pl-[calc(env(safe-area-inset-left)+2rem)] md:pr-[calc(env(safe-area-inset-right)+2rem)]",
        className,
      )}
    >
      <span>© Gaya KACI · built with next.js · {year}</span>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {links.map(({ href, label, external }) => (
          <li key={label}>
            <a
              href={href}
              {...(external && { target: "_blank", rel: "noreferrer" })}
              className="underline decoration-border underline-offset-4 hover:text-foreground"
            >
              <span className="bracketed">{label}</span>
              {external && <span className="sr-only"> (opens in new tab)</span>}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
