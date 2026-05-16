import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { HomePage } from "@/components/home-page"
import { getDictionary, isLocale, locales } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { mapShopToUiShop } from "@/lib/shops"
import type { UiShop } from "@/types"

const siteUrl = "https://carigas.my"

const seoContent = {
  ms: {
    title: "Cari Kedai Gas LPG Berhampiran Anda | carigas.my",
    description:
      "Cari kedai gas LPG berhampiran anda di Malaysia, semak servis tukar gas, beli silinder baru, harga dan nombor telefon.",
  },
  en: {
    title: "Find LPG Gas Shops Near You | carigas.my",
    description:
      "Find nearby LPG gas shops in Malaysia, compare exchange service, new cylinder availability, prices and phone numbers.",
  },
  zh: {
    title: "寻找附近 LPG 煤气店 | carigas.my",
    description:
      "在 Malaysia 查找附近 LPG 煤气店，查看换气服务、新气桶、价格和联系电话。",
  },
  ta: {
    title: "அருகிலுள்ள LPG எரிவாயு கடைகள் | carigas.my",
    description:
      "Malaysia-வில் அருகிலுள்ள LPG எரிவாயு கடைகள், மாற்று சேவை, புதிய சிலிண்டர், விலை மற்றும் தொலைபேசி எண்களை கண்டறியுங்கள்.",
  },
} satisfies Record<
  (typeof locales)[number],
  {
    title: string
    description: string
  }
>

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const alternates = Object.fromEntries(
    locales.map((targetLocale) => [targetLocale, `/${targetLocale}`])
  )

  return {
    title: seoContent[locale].title,
    description: seoContent[locale].description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...alternates,
        "x-default": `/${locales[0]}`,
      },
    },
    openGraph: {
      title: seoContent[locale].title,
      description: seoContent[locale].description,
      url: `${siteUrl}/${locale}`,
      siteName: "carigas.my",
      locale,
      type: "website",
    },
  }
}

function buildJsonLd(locale: string, shops: UiShop[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "carigas.my",
        url: siteUrl,
        inLanguage: locale,
        description: seoContent[locale as keyof typeof seoContent].description,
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "carigas.my",
        url: siteUrl,
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/${locale}#shops`,
        name: seoContent[locale as keyof typeof seoContent].title,
        numberOfItems: shops.length,
        itemListElement: shops.map((shop, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Store",
            "@id": `${siteUrl}/${locale}#shop-${shop.id}`,
            name: shop.name,
            address: shop.address,
            telephone: shop.phone ?? undefined,
            priceRange: shop.price ?? undefined,
            geo: {
              "@type": "GeoCoordinates",
              latitude: shop.lat,
              longitude: shop.lng,
            },
          },
        })),
      },
    ],
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const shops = await prisma.shop.findMany({
    where: {
      approved: true,
    },
    orderBy: {
      name: "asc",
    },
  })
  const dictionary = getDictionary(locale)
  const uiShops = shops.map((shop) =>
    mapShopToUiShop(shop, dictionary.distanceUnavailable)
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(locale, uiShops)),
        }}
      />
      <HomePage
        dictionary={dictionary}
        initialShops={uiShops}
        locale={locale}
      />
    </>
  )
}
