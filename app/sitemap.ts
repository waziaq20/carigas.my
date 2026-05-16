import type { MetadataRoute } from "next"

import { locales } from "@/lib/i18n"

const siteUrl = "https://carigas.my"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...locales.map((locale) => ({
      url: `${siteUrl}/${locale}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: locale === "ms" ? 1 : 0.9,
    })),
  ]
}
