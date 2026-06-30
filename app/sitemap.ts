import type { MetadataRoute } from "next";

import { SITE } from "@/constants/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${SITE.url}/about`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/faq`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
