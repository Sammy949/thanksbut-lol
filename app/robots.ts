import type { MetadataRoute } from "next";

import { SITE } from "@/constants/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/manage/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
