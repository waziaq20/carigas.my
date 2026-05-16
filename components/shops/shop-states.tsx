import { AlertIcon } from "@/components/icons/app-icons"
import { Button } from "@/components/ui/button"
import type { Dictionary } from "@/lib/i18n"

type ShopStatesProps = {
  dictionary: Dictionary
}

export function ShopStates({ dictionary }: ShopStatesProps) {
  return (
    <section className="border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-black tracking-[-0.04em] text-foreground">
          {dictionary.stateExamples}
        </h2>
        <span className="bg-secondary px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.12em] text-secondary-foreground uppercase">
          {dictionary.sampleData}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="border border-border bg-muted/40 p-3">
          <p className="mb-3 text-xs font-bold text-muted-foreground">
            {dictionary.loadingState}
          </p>
          <div className="space-y-2">
            <div className="h-3 w-4/5 animate-pulse bg-muted" />
            <div className="h-3 w-3/5 animate-pulse bg-muted" />
            <div className="h-8 w-full animate-pulse bg-muted" />
          </div>
        </div>

        <div className="border border-dashed border-border bg-card p-3">
          <p className="text-sm font-black text-foreground">
            {dictionary.emptyTitle}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {dictionary.emptyDescription}
          </p>
          <Button className="mt-3 px-3">{dictionary.addShop}</Button>
        </div>

        <div className="border border-destructive/20 bg-destructive/10 p-3 text-destructive shadow-sm">
          <div className="flex gap-2">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-sm font-black">{dictionary.locationError}</p>
              <p className="mt-1 text-xs leading-5 opacity-80">
                {dictionary.locationErrorDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
