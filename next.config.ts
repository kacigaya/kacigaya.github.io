import type { NextConfig } from "next";

// The Pages workflow sets SITE_URL from the repository's Pages configuration:
// https://kacigaya.github.io/portfolio while the site is a project page, the
// bare custom domain once one is attached. Local builds default to the domain.
const siteUrl = (process.env.SITE_URL ?? "https://gayakaci.com").replace(/\/$/, "");
const basePath = new URL(siteUrl).pathname.replace(/\/$/, "");

const nextConfig: NextConfig = {
  // GitHub Pages serves plain files, so the build writes a static site to
  // out/. Data fetched in server components is fetched once, at build time.
  output: "export",
  basePath,
  // inlined for lib/site.ts, which client components also import
  env: { NEXT_PUBLIC_SITE_URL: siteUrl, NEXT_PUBLIC_BASE_PATH: basePath },
  // Don't advertise the framework. The static host sets no other headers; the
  // content security policy lives in a meta tag in app/layout.tsx.
  poweredByHeader: false,
};

export default nextConfig;
