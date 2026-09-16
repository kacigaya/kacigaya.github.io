import type { NextConfig } from "next";

// The Pages workflow sets SITE_URL from the repository's Pages configuration.
// This repo is the user site (kacigaya.github.io), so it serves at the domain
// root and basePath is empty; local builds default to the same URL. The http->
// https rewrite guards the window where Pages reports http:// before a cert is
// issued, so canonical and feed URLs never inherit the insecure scheme.
const siteUrl = (process.env.SITE_URL ?? "https://kacigaya.github.io")
  .replace(/^http:/, "https:")
  .replace(/\/$/, "");
const basePath = new URL(siteUrl).pathname.replace(/\/$/, "");

const nextConfig: NextConfig = {
  // GitHub Pages serves plain files, so the build writes a static site to
  // out/. Data fetched in server components is fetched once, at build time.
  output: "export",
  // Emit each route as a directory index (blog/index.html) rather than a
  // sibling file (blog.html). GitHub Pages serves that for both /blog/ and
  // /blog (it 301s the bare form to the slash), so neither shape 404s. The
  // static-file default (blog.html) only answered /blog and returned 404 for
  // the trailing-slash form that older links and the address bar produce.
  trailingSlash: true,
  basePath,
  // inlined for lib/site.ts, which client components also import
  env: { NEXT_PUBLIC_SITE_URL: siteUrl, NEXT_PUBLIC_BASE_PATH: basePath },
  // Don't advertise the framework. The static host sets no other headers; the
  // content security policy lives in a meta tag in app/layout.tsx.
  poweredByHeader: false,
};

export default nextConfig;
