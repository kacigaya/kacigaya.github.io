import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves plain files, so the build writes a static site to
  // out/. Data fetched in server components is fetched once, at build time.
  output: "export",
  // Don't advertise the framework. The static host sets no other headers; the
  // content security policy lives in a meta tag in app/layout.tsx.
  poweredByHeader: false,
};

export default nextConfig;
