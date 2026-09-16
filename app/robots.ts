import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// static export writes this route to a file at build
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml` };
}
