import type { MetadataRoute } from "next";

import { SITE } from "@/constants/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      changeFrequency: "hourly",
      priority: 1,
    },
  ];
}
