import { ListIcon, MapIcon } from "@/components/icons/app-icons"
import type { Dictionary } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export type ShopViewMode = "map" | "list"

type ShopViewToolbarProps = {
  dictionary: Dictionary
  view: ShopViewMode
  onViewChange: (view: ShopViewMode) => void
}

export function ShopViewToolbar({
  dictionary,
  view,
  onViewChange,
}: ShopViewToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {dictionary.searchLabel}
        </p>
        <h1 className="mt-1 text-xl font-black tracking-[-0.06em] text-foreground sm:text-2xl">
          {dictionary.pageTitle}
        </h1>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="grid grid-cols-2 bg-muted p-1 text-xs font-bold text-muted-foreground ring-1 ring-border">
          <button
            type="button"
            onClick={() => onViewChange("map")}
            className={cn(
              "flex h-9 min-w-20 items-center justify-center gap-1.5 px-3 transition",
              view === "map" && "bg-background text-foreground shadow-sm"
            )}
            aria-pressed={view === "map"}
          >
            <MapIcon className="size-4" />
            {dictionary.map}
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            className={cn(
              "flex h-9 min-w-20 items-center justify-center gap-1.5 px-3 transition",
              view === "list" && "bg-background text-foreground shadow-sm"
            )}
            aria-pressed={view === "list"}
          >
            <ListIcon className="size-4" />
            {dictionary.list}
          </button>
        </div>
      </div>
    </div>
  )
}
