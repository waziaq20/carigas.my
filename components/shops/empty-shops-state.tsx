import { Button } from "@/components/ui/button"
import type { Dictionary } from "@/lib/i18n"

type EmptyShopsStateProps = {
  dictionary: Dictionary
}

export function EmptyShopsState({ dictionary }: EmptyShopsStateProps) {
  return (
    <div className="grid h-full min-h-80 place-items-center bg-muted/40 p-6">
      <div className="max-w-sm border border-dashed border-border bg-card p-5 text-center text-card-foreground shadow-sm">
        <p className="text-base font-black tracking-[-0.04em] text-foreground">
          {dictionary.emptyTitle}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {dictionary.emptyDescription}
        </p>
        <Button className="mt-4 px-4">{dictionary.addShop}</Button>
      </div>
    </div>
  )
}
