// Both come from next.config.ts, derived from SITE_URL at build time.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gayakaci.com";

// Path prefix under which the site is served; empty at a domain root. Link,
// fonts, and chunks get it from next.config; plain <a href> must add it.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const FEED_PATH = `${BASE_PATH}/feed.xml`;
