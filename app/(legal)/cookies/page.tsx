import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/button";
import { socials } from "@/lib/socials";
import { formatDate } from "@/lib/utils";
import { LEGAL_UPDATED } from "../updated";

export const metadata: Metadata = {
  title: "Cookies policy",
  description:
    "This site sets no cookies. It stores one theme preference in your browser, and nothing else.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPolicy() {
  return (
    <>
      <h1 className="md-h1 text-2xl uppercase md:text-3xl">cookies policy</h1>
      <p className="mt-4 text-xs text-muted-foreground tabular-nums">
        last updated{" "}
        <time dateTime={LEGAL_UPDATED}>{formatDate(LEGAL_UPDATED)}</time>
      </p>

      <p className="mt-8">
        <strong>This site sets no cookies.</strong> Not one, first or third
        party. No analytics cookie, no session cookie, no advertising or
        consent-management cookie. Nothing on this domain writes to{" "}
        <code>document.cookie</code>, and nothing sends a{" "}
        <code>Set-Cookie</code> header back to your browser.
      </p>
      <p>
        That is also why there is no consent banner. A banner exists to collect
        permission for storage that is not strictly necessary, and there is
        nothing here to ask about.
      </p>

      <h2 className="md-h2 mt-10 text-base uppercase">
        what is stored instead
      </h2>
      <p>
        One thing, and only if you use the theme toggle: your choice of the
        light or dark theme, written to your browser&rsquo;s local storage.
      </p>
      <ul>
        <li>
          <strong>Key:</strong> <code>theme</code>
        </li>
        <li>
          <strong>Value:</strong> <code>light</code> or <code>dark</code>
        </li>
        <li>
          <strong>Why:</strong> so the page renders in the theme you picked
          instead of flashing the other one first.
        </li>
        <li>
          <strong>Lifetime:</strong> until you clear it. Local storage does not
          expire on its own.
        </li>
        <li>
          <strong>Where it goes:</strong> nowhere. Local storage is not attached
          to requests the way a cookie is, so it never leaves your browser.
        </li>
      </ul>
      <p>
        It holds no identifier and cannot be used to recognise you, on this site
        or any other. If you never touch the toggle, nothing is written and the
        site follows your system&rsquo;s light or dark preference.
      </p>

      <h2 className="md-h2 mt-10 text-base uppercase">removing it</h2>
      <p>
        Clearing site data for this domain in your browser removes it: in
        Chrome, Edge, and Firefox it is under the padlock or site-information
        icon in the address bar, then site settings or cookies and site data;
        Safari keeps it under Settings, Privacy, Manage Website Data. Private or
        incognito windows discard it when you close them. Nothing on the site
        breaks afterwards; the theme simply follows your system again.
      </p>

      <h2 className="md-h2 mt-10 text-base uppercase">third parties</h2>
      <p>
        None are embedded, so none can set a cookie here. There are no ads, no
        embedded videos, no social widgets, no hosted fonts, and no tag
        managers. Every asset comes from this domain, and a content security
        policy declared in each page blocks off-origin loads outright. GitHub
        data shown on the home page is fetched when the site is built, not
        when you open it.
      </p>
      <p>
        Links out to GitHub, LinkedIn, or X will of course set cookies once you
        are on those sites, under their policies rather than this one.
      </p>

      <h2 className="md-h2 mt-10 text-base uppercase">if this changes</h2>
      <p>
        Should the site ever need a cookie, this page will name it, say what it
        does and how long it lasts, before it is set, and anything beyond the
        strictly necessary will ask you first. Questions go to{" "}
        <a href={`mailto:${socials.email}`}>{socials.email}</a>.
      </p>
      <p>
        The request logs GitHub keeps as the host are separate from anything
        stored in your browser and are described in the{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>

      <Button
        variant="outline"
        size="sm"
        className="mt-10"
        render={<Link href="/privacy" />}
      >
        <span className="bracketed">privacy policy</span>
      </Button>
    </>
  );
}
