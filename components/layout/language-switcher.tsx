import Link from "next/link"

import { localeLabels, locales, type Dictionary, type Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type LanguageSwitcherProps = {
  dictionary: Dictionary
  locale: Locale
}

export function LanguageSwitcher({
  dictionary,
  locale,
}: LanguageSwitcherProps) {
  return (
    <nav
      className="flex items-center border border-border bg-muted text-xs font-bold text-muted-foreground"
      aria-label={dictionary.language}
    >
      {locales.map((targetLocale) => (
        <Link
          key={targetLocale}
          href={`/${targetLocale}`}
          hrefLang={targetLocale}
          className={cn(
            "px-2.5 py-2 transition hover:bg-background hover:text-foreground",
            locale === targetLocale && "bg-background text-foreground"
          )}
          aria-current={locale === targetLocale ? "page" : undefined}
        >
          {localeLabels[targetLocale]}
        </Link>
      ))}
    </nav>
  )
}
