import type { Dictionary } from "@/lib/i18n"
import type { UiShop } from "@/types"

import { EmptyShopsState } from "./empty-shops-state"
import { ShopCard } from "./shop-card"

type ShopListViewProps = {
  dictionary: Dictionary
  shops: UiShop[]
}

export function ShopListView({ dictionary, shops }: ShopListViewProps) {
  return (
    <div className="h-full overflow-y-auto bg-muted/40 p-3 sm:p-4">
      <div className="mb-3 flex flex-col gap-2 border border-border bg-card p-4 text-card-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-foreground">
            {dictionary.listTitle}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {dictionary.sortDescription}
          </p>
        </div>
        <span className="w-fit bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          {dictionary.closestFirst}
        </span>
      </div>

      <div className="grid gap-3">
        {shops.length > 0 ? (
          shops.map((shop) => (
            <ShopCard key={shop.id} dictionary={dictionary} shop={shop} />
          ))
        ) : (
          <EmptyShopsState dictionary={dictionary} />
        )}
      </div>
    </div>
  )
}
