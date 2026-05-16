import { notFound } from "next/navigation"

import { HomePage } from "@/components/home-page"
import { getDictionary, isLocale, locales } from "@/lib/i18n"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
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

  return <HomePage dictionary={getDictionary(locale)} locale={locale} />
}
