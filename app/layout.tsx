import type { Metadata, Viewport } from "next";
import { jetbrains } from "./fonts";
import { THEME_INIT_SCRIPT } from "@/components/theme-provider";
import { JsonLd } from "@/components/json-ld";
import { AUTHOR, OG_DEFAULTS, PERSON_ID, SITE_URL } from "@/lib/site";
import { socials } from "@/lib/socials";
import "./globals.css";

// GitHub Pages sets no response headers, so the policy ships in the document.
// Off-origin loads stay blocked. 'unsafe-inline' is unavoidable on a static
// export: there is no server to mint nonces, and Next inlines a per-page RSC
// payload script whose hash changes with every edit. A meta policy cannot
// carry frame-ancestors or report-uri. Production only: dev needs eval and a
// websocket for HMR.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export const metadata: Metadata = {
  title: {
    default: "Gaya KACI | Cybersecurity and web security",
    template: "%s | Gaya KACI",
  },
  description:
    "Cybersecurity student and web security researcher building developer tools, browser automation, and security software.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Gaya KACI",
    description:
      "Cybersecurity student and web security researcher building developer tools, browser automation, and security software.",
    url: "/",
  },
  // No robots field: index, follow is the default, and a root value would
  // ship beside the noindex Next adds to the 404 page.
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f8" },
    { media: "(prefers-color-scheme: dark)", color: "#151516" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jetbrains.variable} dark`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {process.env.NODE_ENV === "production" && (
          <meta httpEquiv="Content-Security-Policy" content={CSP} />
        )}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": PERSON_ID,
          name: AUTHOR.name,
          url: `${SITE_URL}/`,
          jobTitle: AUTHOR.jobTitle,
          worksFor: { "@type": "Organization", name: "Société Générale Assurance" },
          alumniOf: {
            "@type": "CollegeOrUniversity",
            name: "Efrei Paris – Panthéon-Assas Université",
          },
          address: { "@type": "PostalAddress", addressLocality: "Paris", addressCountry: "FR" },
          knowsAbout: [
            "web security",
            "browser automation",
            "browser fingerprinting",
            "reverse engineering",
            "penetration testing",
          ],
          sameAs: [socials.github, socials.linkedin, socials.x, socials.googleDeveloper],
        }} />
        {children}
      </body>
    </html>
  );
}
