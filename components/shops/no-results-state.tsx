import Link from "next/link"

import { SearchIcon } from "@/components/icons/app-icons"
import { Button } from "@/components/ui/button"
import type { Dictionary } from "@/lib/i18n"

type NoResultsStateProps = {
  dictionary: Dictionary
  locale: string
  onClear: () => void
}

export function NoResultsState({
  dictionary,
  locale,
  onClear,
}: NoResultsStateProps) {
  return (
    <div className="grid min-h-72 place-items-center p-6">
      <div className="max-w-sm border border-dashed border-border bg-card p-6 text-center text-card-foreground shadow-sm">
        <span className="mx-auto grid size-12 place-items-center bg-muted text-muted-foreground">
          <SearchIcon className="size-5" />
        </span>
        <p className="mt-4 text-base font-black tracking-[-0.04em] text-foreground">
          {dictionary.noResultsTitle}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {dictionary.noResultsDescription}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            className="border-border bg-background"
            onClick={onClear}
          >
            {dictionary.clearFilters}
          </Button>
          <Button className="px-4" asChild>
            <Link href={`/${locale}/submit`}>{dictionary.addShop}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
