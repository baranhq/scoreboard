import type { MetadataRoute } from "next";
import { indexable, siteOrigin } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: indexable
      ? [
          { userAgent: "*", allow: "/" },
          { userAgent: "OAI-SearchBot", allow: "/" },
        ]
      : [
          { userAgent: "*", disallow: "/" },
          { userAgent: "OAI-SearchBot", disallow: "/" },
        ],
    ...(indexable ? { sitemap: `${siteOrigin}/sitemap.xml` } : {}),
  };
}
