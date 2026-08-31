import Link from "next/link"

import { GasIcon } from "@/components/icons/app-icons"
import { Button } from "@/components/ui/button"
import type { Dictionary, Locale } from "@/lib/i18n"

import { LanguageSwitcher } from "./language-switcher"

type SiteHeaderProps = {
  dictionary: Dictionary
  isLocating: boolean
  locale: Locale
  onLocate: () => void
}

export function SiteHeader({
  dictionary,
  isLocating,
  locale,
  onLocate,
}: SiteHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border border-border bg-card px-4 py-3 text-card-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <Link
        href={`/${locale}`}
        className="group flex items-center gap-3"
        aria-label="carigas.my home"
      >
        <span className="grid size-10 place-items-center bg-primary text-primary-foreground transition-transform group-hover:-rotate-3 sm:size-11">
          <GasIcon className="size-5" />
        </span>
        <span className="leading-none">
          <span className="block text-lg font-black tracking-tighter text-foreground sm:text-xl">
            carigas.my
          </span>
          <span className="hidden text-[0.65rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase sm:block">
            {dictionary.appTagline}
          </span>
        </span>
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <LanguageSwitcher dictionary={dictionary} locale={locale} />
        <Button
          variant="outline"
          className="hidden px-3 sm:inline-flex"
          asChild
        >
          <Link href={`/${locale}/my-gas`}>{dictionary.myGas.title}</Link>
        </Button>
        <Button
          variant="outline"
          className="hidden px-3 sm:inline-flex"
          disabled={isLocating}
          onClick={onLocate}
        >
          {isLocating ? dictionary.loadingState : dictionary.myLocation}
        </Button>
        <Button className="px-4 sm:px-5" asChild>
          <Link href={`/${locale}/submit`}>{dictionary.addShop}</Link>
        </Button>
      </div>
    </header>
  )
}
