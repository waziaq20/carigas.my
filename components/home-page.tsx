"use client"

import { useEffect, useRef, useState } from "react"

import { SiteHeader } from "@/components/layout/site-header"
import { ShopInsights } from "@/components/shops/shop-insights"
import { ShopListView } from "@/components/shops/shop-list-view"
import { ShopMapView } from "@/components/shops/shop-map-view"
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

type ShopsResponse = {
  shops: UiShop[]
}

async function fetchNearbyShops(locale: Locale, location: Coordinates) {
  const searchParams = new URLSearchParams({
    lat: String(location.lat),
    lng: String(location.lng),
    locale,
  })
  const response = await fetch(`/api/shops?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to fetch nearby shops")
  }

  const data = (await response.json()) as ShopsResponse

  return data.shops
}

function getLocationFromPosition(position: GeolocationPosition): Coordinates {
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  }
}

export function HomePage({ dictionary, initialShops, locale }: HomePageProps) {
  const [view, setView] = useState<ShopViewMode>("map")
  const [shops, setShops] = useState(initialShops)
  const [selectedShop, setSelectedShop] = useState<UiShop | null>(
    initialShops[0] ?? null
  )
  const hasRequestedInitialLocation = useRef(false)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const lowestPrice = getLowestShopPrice(shops)
  const nearestDistance = userLocation
    ? (shops[0]?.distance ?? dictionary.distanceUnavailable)
    : dictionary.distanceUnavailable

  useEffect(() => {
    if (hasRequestedInitialLocation.current) {
      return
    }

    hasRequestedInitialLocation.current = true

    if (!navigator.geolocation) {
      return
    }

    let cancelled = false

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = getLocationFromPosition(position)

        try {
          const sortedShops = await fetchNearbyShops(locale, location)

          if (cancelled) {
            return
          }

          setUserLocation(location)
          setShops(sortedShops)
          setSelectedShop(sortedShops[0] ?? null)
        } catch {
          const sortedShops = sortShopsByDistance(initialShops, location)

          if (cancelled) {
            return
          }

          setUserLocation(location)
          setShops(sortedShops)
          setSelectedShop(sortedShops[0] ?? null)
        } finally {
          if (!cancelled) {
            setIsLocating(false)
          }
        }
      },
      () => {
        if (!cancelled) {
          setIsLocating(false)
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 10000,
      }
    )

    return () => {
      cancelled = true
    }
  }, [initialShops, locale])

  function handleLocate() {
    if (!navigator.geolocation) {
      setLocationError(dictionary.locationErrorDescription)
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = getLocationFromPosition(position)
        let sortedShops: UiShop[]

        try {
          sortedShops = await fetchNearbyShops(locale, location)
        } catch {
          sortedShops = sortShopsByDistance(shops, location)
        }

        setUserLocation(location)
        setShops(sortedShops)
        setSelectedShop(sortedShops[0] ?? null)
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
              nearestDistance={nearestDistance}
              shopCount={shops.length}
            />
            <ShopInsights
              dictionary={dictionary}
              lowestPrice={lowestPrice}
              shops={shops}
            />
          </aside>
        </section>

        <div className="grid gap-4 pt-4 lg:hidden">
          <ShopSummary
            dictionary={dictionary}
            lowestPrice={lowestPrice}
            nearestDistance={nearestDistance}
            shopCount={shops.length}
          />
          <ShopInsights
            dictionary={dictionary}
            lowestPrice={lowestPrice}
            shops={shops}
          />
        </div>
      </div>
    </main>
  )
}
