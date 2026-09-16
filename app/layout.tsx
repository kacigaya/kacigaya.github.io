import type { Metadata, Viewport } from "next";
import { jetbrains } from "./fonts";
import { THEME_INIT_SCRIPT } from "@/components/theme-provider";
import { SITE_URL } from "@/lib/site";
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
    title: "Gaya KACI",
    description:
      "Cybersecurity student and web security researcher building developer tools, browser automation, and security software.",
    type: "website",
    url: "/",
    // a file in public/ rather than the app/opengraph-image convention: under
    // a basePath the convention prefixes the path twice
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Gaya KACI, cybersecurity student and web security researcher",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Gaya KACI",
          url: SITE_URL,
          jobTitle: "Cybersecurity student and web security researcher",
          sameAs: [socials.github, socials.linkedin, socials.x],
        }).replace(/</g, "\\u003c") }} />
        {children}
      </body>
    </html>
  );
}
