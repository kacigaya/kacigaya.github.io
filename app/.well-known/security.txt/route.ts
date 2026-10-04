import { SITE_URL } from "@/lib/site";
import { socials } from "@/lib/socials";

// the static export writes this to out/.well-known/security.txt at build. The
// daily rebuild rolls Expires forward, so it never goes stale (RFC 9116 wants
// it under a year out).
export const dynamic = "force-static";

export function GET() {
  const expires = new Date();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  const body = [
    `Contact: mailto:${socials.email}`,
    `Expires: ${expires.toISOString()}`,
    `Canonical: ${SITE_URL}/.well-known/security.txt`,
    "Preferred-Languages: en, fr",
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
