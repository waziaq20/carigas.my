"use client"

import { useState } from "react"

import { SiteHeader } from "@/components/layout/site-header"
import { ShopListView } from "@/components/shops/shop-list-view"
import { ShopMapView } from "@/components/shops/shop-map-view"
import { ShopStates } from "@/components/shops/shop-states"
import { ShopSummary } from "@/components/shops/shop-summary"
import {
  ShopViewToolbar,
  type ShopViewMode,
} from "@/components/shops/shop-view-toolbar"
import type { Dictionary, Locale } from "@/lib/i18n"
import { getLowestShopPrice, sortShopsByDistance } from "@/lib/shops"
import type { Coordinates, UiShop } from "@/types"

type HomePageProps = {
  dictionary: Dictionary
  initialShops: UiShop[]
  locale: Locale
}

export function HomePage({ dictionary, initialShops, locale }: HomePageProps) {
  const [view, setView] = useState<ShopViewMode>("map")
  const [shops, setShops] = useState(initialShops)
  const [selectedShop, setSelectedShop] = useState<UiShop | null>(
    initialShops[0] ?? null
  )
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const lowestPrice = getLowestShopPrice(shops)

  function handleLocate() {
    if (!navigator.geolocation) {
      setLocationError(dictionary.locationErrorDescription)
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        const sortedShops = sortShopsByDistance(shops, location)

        setUserLocation(location)
        setShops(sortedShops)
        setSelectedShop((currentShop) =>
          currentShop
            ? (sortedShops.find((shop) => shop.id === currentShop.id) ??
              sortedShops[0] ??
              null)
            : (sortedShops[0] ?? null)
        )
        setIsLocating(false)
      },
      () => {
        setLocationError(dictionary.locationErrorDescription)
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 10000,
      }
    )
  }

  return (
    <main className="min-h-svh overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
        <SiteHeader
          dictionary={dictionary}
          isLocating={isLocating}
          locale={locale}
          onLocate={handleLocate}
        />

        <section className="grid flex-1 gap-4 pt-4 lg:grid-cols-[minmax(0,1fr)_21rem] lg:pt-5">
          <div className="flex min-h-0 flex-col overflow-hidden border border-border bg-card text-card-foreground shadow-sm">
            <ShopViewToolbar
              dictionary={dictionary}
              view={view}
              onViewChange={setView}
            />

            <div className="relative min-h-[calc(100svh-11.5rem)] flex-1 overflow-hidden sm:min-h-168 lg:min-h-0">
              {view === "map" ? (
                <ShopMapView
                  dictionary={dictionary}
                  isLocating={isLocating}
                  locationError={locationError}
                  onLocate={handleLocate}
                  selectedShop={selectedShop}
                  shops={shops}
                  userLocation={userLocation}
                  onSelectShop={setSelectedShop}
                />
              ) : (
                <ShopListView dictionary={dictionary} shops={shops} />
              )}
            </div>
          </div>

          <aside className="hidden min-h-0 flex-col gap-4 lg:flex">
            <ShopSummary
              dictionary={dictionary}
              lowestPrice={lowestPrice}
              shopCount={shops.length}
            />
            <ShopStates dictionary={dictionary} />
          </aside>
        </section>

        <div className="grid gap-4 pt-4 lg:hidden">
          <ShopSummary
            dictionary={dictionary}
            lowestPrice={lowestPrice}
            shopCount={shops.length}
          />
          <ShopStates dictionary={dictionary} />
        </div>
      </div>
    </main>
  )
}
