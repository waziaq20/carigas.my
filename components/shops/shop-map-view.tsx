import dynamic from "next/dynamic"

import { AlertIcon, LocateIcon } from "@/components/icons/app-icons"
import { Button } from "@/components/ui/button"
import type { Dictionary } from "@/lib/i18n"
import type { Coordinates, UiShop } from "@/types"

import { EmptyShopsState } from "./empty-shops-state"
import { ShopPopup } from "./shop-popup"

const ShopMap = dynamic(() => import("@/components/shop-map"), {
  ssr: false,
  loading: () => <MapLoadingState />,
})

type ShopMapViewProps = {
  dictionary: Dictionary
  isLocating: boolean
  locationError: string | null
  onLocate: () => void
  shops: UiShop[]
  selectedShop: UiShop | null
  userLocation: Coordinates | null
  onSelectShop: (shop: UiShop) => void
}

function MapLoadingState() {
  return (
    <div className="grid h-full min-h-[inherit] place-items-center bg-muted">
      <div className="space-y-3 text-center">
        <div className="mx-auto size-10 animate-pulse rounded-full bg-muted-foreground/30" />
        <div className="h-3 w-36 animate-pulse bg-muted-foreground/30" />
      </div>
    </div>
  )
}

export function ShopMapView({
  dictionary,
  isLocating,
  locationError,
  onLocate,
  shops,
  selectedShop,
  userLocation,
  onSelectShop,
}: ShopMapViewProps) {
  if (shops.length === 0 || !selectedShop) {
    return <EmptyShopsState dictionary={dictionary} />
  }

  return (
    <div className="relative h-full min-h-[inherit] overflow-hidden bg-muted">
      <ShopMap
        myLocationLabel={dictionary.myLocation}
        onSelectShop={onSelectShop}
        selectedShop={selectedShop}
        shops={shops}
        userLocation={userLocation}
      />

      <div className="absolute top-4 left-4 z-20 border border-border bg-card p-3 text-card-foreground shadow-sm">
        <p className="text-[0.65rem] font-bold tracking-[0.18em] text-muted-foreground uppercase">
          {dictionary.currentResults}
        </p>
        <p className="mt-1 text-sm font-black text-foreground">
          {shops.length} {dictionary.metricShops}
        </p>
      </div>

      <Button
        variant="outline"
        className="absolute top-4 right-4 z-20 px-3 shadow-sm"
        disabled={isLocating}
        onClick={onLocate}
      >
        <LocateIcon className="size-4" />
        {isLocating ? dictionary.loadingState : dictionary.myLocation}
      </Button>

      {locationError ? (
        <div className="absolute top-20 right-4 z-20 max-w-64 border border-destructive/20 bg-destructive/10 p-3 text-destructive shadow-sm">
          <div className="flex gap-2">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            <p className="text-xs leading-5">{locationError}</p>
          </div>
        </div>
      ) : null}

      <div className="absolute inset-x-3 bottom-3 z-40 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-92">
        <ShopPopup dictionary={dictionary} shop={selectedShop} />
      </div>
    </div>
  )
}
