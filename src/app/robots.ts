import type { MetadataRoute } from "next";
import { indexable, siteOrigin } from "@/lib/site";

export const dynamic = "force-static";

// Keep the configurable admin URL out of this public file. Admin responses are
// noindex, and server-side authentication protects access.
const privatePaths = ["/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: indexable
      ? [
          { userAgent: "*", disallow: privatePaths },
          { userAgent: "OAI-SearchBot", disallow: privatePaths },
        ]
      : [
          { userAgent: "*", disallow: "/" },
          { userAgent: "OAI-SearchBot", disallow: "/" },
        ],
    ...(indexable ? { sitemap: `${siteOrigin}/sitemap.xml` } : {}),
  };
}
