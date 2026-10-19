// Both come from next.config.ts, derived from SITE_URL at build time.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kacigaya.github.io";

// Path prefix under which the site is served; empty at a domain root. Link,
// fonts, and chunks get it from next.config; plain <a href> must add it.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const FEED_PATH = `${BASE_PATH}/feed.xml`;

// Next merges metadata shallowly: a page that sets any openGraph field drops
// the root layout's whole block, image included. Pages spread this back in.
// A file in public/ rather than the app/opengraph-image convention: under a
// basePath the convention prefixes the path twice.
export const OG_DEFAULTS = {
  type: "website" as const,
  images: [
    {
      url: "/opengraph-image.png",
      width: 1200,
      height: 630,
      alt: "Gaya KACI, cybersecurity student and web security researcher",
    },
  ],
};

// Stable node ids let every page's JSON-LD point at one Person and one
// WebSite instead of repeating anonymous copies.
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const AUTHOR = {
  name: "Gaya KACI",
  jobTitle: "Cybersecurity student and web security researcher",
};
