import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { GasIcon } from "@/components/icons/app-icons"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { auth } from "@/lib/auth"
import { daysUntil, predictFinishDate } from "@/lib/gas-prediction"
import { getDictionary, isLocale, type Locale } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"

import {
  createGasRecord,
  markGasFinished,
  signInAction,
  signOutAction,
} from "./actions"

const localeTags: Record<Locale, string> = {
  ms: "ms-MY",
  en: "en-MY",
  zh: "zh-CN",
  ta: "ta-IN",
}

function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTags[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

const inputClassName =
  "h-10 border border-border bg-background px-3 text-sm font-normal outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"

const seoContent = {
  ms: {
    title: "Gas Saya | carigas.my",
    description: "Rekod gas dan anggaran tarikh habis.",
  },
  en: {
    title: "My Gas | carigas.my",
    description: "Track gas usage and finish date estimate.",
  },
  zh: {
    title: "我的煤气 | carigas.my",
    description: "记录煤气用量并预估用完日期。",
  },
  ta: {
    title: "என் எரிவாயு | carigas.my",
    description: "எரிவாயு பயன்பாட்டை கண்காணித்து தீரும் தேதியை மதிப்பிடுங்கள்.",
  },
} as const

type MyGasPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string }>
}

export async function generateMetadata({
  params,
}: MyGasPageProps): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const content = seoContent[locale]

  return {
    title: content.title,
    description: content.description,
    robots: { index: false, follow: true },
  }
}

export default async function MyGasPage({
  params,
  searchParams,
}: MyGasPageProps) {
  const { locale } = await params
  const { error } = await searchParams

  if (!isLocale(locale)) {
    notFound()
  }

  const dictionary = getDictionary(locale)
  const t = dictionary.myGas
  const session = await auth()

  if (!session?.user) {
    return (
      <main className="min-h-svh bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 border border-border bg-card p-8 text-center text-card-foreground shadow-sm">
          <span className="grid size-12 place-items-center bg-primary text-primary-foreground">
            <GasIcon className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tighter">{t.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.signInDescription}
            </p>
          </div>
          <form action={signInAction.bind(null, locale)}>
            <Button type="submit" size="lg" className="w-full">
              {t.signInWithGoogle}
            </Button>
          </form>
        </div>
      </main>
    )
  }

  const records = await prisma.gasRecord.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const completed = records.filter((r) => r.startDate && r.endDate)
  const actives = records.filter((r) => r.startDate && !r.endDate)
  const hasHistory = completed.length > 0

  return (
    <main className="min-h-svh bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              {session.user.email}
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tighter">
              {t.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LanguageSwitcher
              basePath="/my-gas"
              dictionary={dictionary}
              locale={locale}
            />
            <Button variant="outline" asChild>
              <Link href={`/${locale}`}>{dictionary.viewShop}</Link>
            </Button>
            <form action={signOutAction.bind(null, locale)}>
              <Button variant="outline" type="submit">
                {t.signOut}
              </Button>
            </form>
          </div>
        </div>

        {error ? (
          <p className="border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {t.errorInvalid}
          </p>
        ) : null}

        <section className="border border-border bg-card p-5 text-card-foreground shadow-sm">
          <h2 className="text-sm font-bold tracking-[0.15em] uppercase">
            {t.predictionTitle}
          </h2>
          {actives.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t.noActive}</p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {actives.map((cylinder) => {
                const predicted = predictFinishDate(cylinder, completed)
                const remaining =
                  predicted === null ? null : daysUntil(predicted)
                const standby = remaining !== null && remaining <= 7

                return (
                  <div
                    key={cylinder.id}
                    className="flex flex-col gap-2 border border-border bg-background p-4"
                  >
                    <p className="text-sm font-bold">
                      {cylinder.label ?? cylinder.brand}
                    </p>
                    {predicted === null || remaining === null ? (
                      <p className="text-sm text-muted-foreground">
                        {t.estimatedDate} —
                      </p>
                    ) : (
                      <>
                        {standby ? (
                          <p className="border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
                            {t.standbyTitle}
                          </p>
                        ) : null}
                        <p className="text-lg font-black tracking-[-0.03em]">
                          {t.estimatedDate} {formatDate(predicted, locale)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {remaining >= 0
                            ? t.daysLeft.replace("{days}", String(remaining))
                            : t.daysOverdue.replace(
                                "{days}",
                                String(-remaining)
                              )}
                          {hasHistory ? null : ` · ${t.defaultEstimateNote}`}
                        </p>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <form
          action={createGasRecord.bind(null, locale)}
          className="border border-border bg-card p-5 text-card-foreground shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-4">
            <label className="flex flex-col gap-2 text-sm font-semibold">
              {t.brand}
              <input className={inputClassName} name="brand" required />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              {t.label}
              <input
                className={inputClassName}
                name="label"
                maxLength={50}
                placeholder={t.labelPlaceholder}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              {t.weight}
              <input
                className={inputClassName}
                name="weightKg"
                type="number"
                min="0.5"
                max="100"
                step="0.1"
                placeholder="16.5"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              {t.price}
              <input
                className={inputClassName}
                name="price"
                type="number"
                min="0"
                max="10000"
                step="0.01"
                placeholder="26.80"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              {t.startDate}
              <input
                className={inputClassName}
                name="startDate"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
              />
            </label>
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="submit">{t.add}</Button>
          </div>
        </form>

        <section className="border border-border bg-card p-5 text-card-foreground shadow-sm">
          <h2 className="text-sm font-bold tracking-[0.15em] uppercase">
            {t.historyTitle}
          </h2>
          {records.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t.noHistory}</p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {records.map((record) => (
                <li
                  key={record.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <span className="font-bold">
                    {record.label ? `${record.label} · ` : ""}
                    {record.brand}
                  </span>
                  <span className="text-muted-foreground">
                    {record.weightKg}kg · RM{(record.price / 100).toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">
                    {record.startDate
                      ? formatDate(record.startDate, locale)
                      : "—"}
                    {" → "}
                    {record.endDate
                      ? formatDate(record.endDate, locale)
                      : t.activeLabel}
                  </span>
                  {record.startDate && !record.endDate ? (
                    <form action={markGasFinished.bind(null, locale)}>
                      <input type="hidden" name="id" value={record.id} />
                      <Button variant="outline" size="sm" type="submit">
                        {t.markFinished}
                      </Button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
