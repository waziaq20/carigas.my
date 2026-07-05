import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ShopSubmissionForm } from "@/components/public/shop-submission-form"
import { Button } from "@/components/ui/button"
import { getDictionary, isLocale } from "@/lib/i18n"
import Link from "next/link"

const submitSeoContent = {
  ms: {
    title: "Hantar Kedai Gas | carigas.my",
    description: "Hantar kedai gas LPG untuk ditambahkan ke carigas.my.",
  },
  en: {
    title: "Submit a Gas Shop | carigas.my",
    description: "Submit an LPG gas shop to be added to carigas.my.",
  },
  zh: {
    title: "提交煤气店 | carigas.my",
    description: "提交 LPG 煤气店以添加到 carigas.my。",
  },
  ta: {
    title: "எரிவாயு கடை சமர்ப்பி | carigas.my",
    description: "carigas.my-இல் சேர்க்க LPG எரிவாயு கடையை சமர்ப்பிக்கவும்.",
  },
} as const

type SubmitPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: SubmitPageProps): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const content = submitSeoContent[locale]

  return {
    title: content.title,
    description: content.description,
    robots: { index: false, follow: true },
  }
}

export default async function SubmitPage({ params }: SubmitPageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const dictionary = getDictionary(locale)
  const content = submitSeoContent[locale]

  return (
    <main className="min-h-svh bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              {content.title}
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-[-0.05em]">
              {dictionary.submitShop}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {dictionary.submitShopDescription}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/${locale}`}>{dictionary.viewShop}</Link>
          </Button>
        </div>

        <ShopSubmissionForm dictionary={dictionary} locale={locale} />
      </div>
    </main>
  )
}
