"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { localeLabels, locales, type Dictionary, type Locale } from "@/lib/i18n"
import {
  getLowestShopPrice,
  sortShopsByDistance,
  type Coordinates,
  type UiShop,
} from "@/lib/shops"
import { cn } from "@/lib/utils"

type ViewMode = "map" | "list"

const ShopMap = dynamic(() => import("@/components/shop-map"), {
  ssr: false,
  loading: () => <MapLoadingState />,
})

export function HomePage({
  dictionary,
  initialShops,
  locale,
}: {
  dictionary: Dictionary
  initialShops: UiShop[]
  locale: Locale
}) {
  const [view, setView] = useState<ViewMode>("map")
  const [shops, setShops] = useState(initialShops)
  const [selectedShop, setSelectedShop] = useState<UiShop | null>(
    initialShops[0] ?? null,
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
            : (sortedShops[0] ?? null),
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
      },
    )
  }

  return (
    <main className="min-h-svh overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
        <Header
          dictionary={dictionary}
          isLocating={isLocating}
          locale={locale}
          onLocate={handleLocate}
        />

        <section className="grid flex-1 gap-4 pt-4 lg:grid-cols-[minmax(0,1fr)_21rem] lg:pt-5">
          <div className="flex min-h-0 flex-col overflow-hidden border border-border bg-card text-card-foreground shadow-sm">
            <Toolbar
              dictionary={dictionary}
              view={view}
              onViewChange={setView}
            />

            <div className="relative min-h-[calc(100svh-11.5rem)] flex-1 overflow-hidden sm:min-h-168 lg:min-h-0">
              {view === "map" ? (
                <MapView
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
                <ListView dictionary={dictionary} shops={shops} />
              )}
            </div>
          </div>

          <aside className="hidden min-h-0 flex-col gap-4 lg:flex">
            <SearchSummary
              dictionary={dictionary}
              lowestPrice={lowestPrice}
              shopCount={shops.length}
            />
            <StateExamples dictionary={dictionary} />
          </aside>
        </section>

        <div className="grid gap-4 pt-4 lg:hidden">
          <SearchSummary
            dictionary={dictionary}
            lowestPrice={lowestPrice}
            shopCount={shops.length}
          />
          <StateExamples dictionary={dictionary} />
        </div>
      </div>
    </main>
  )
}

function Header({
  dictionary,
  isLocating,
  locale,
  onLocate,
}: {
  dictionary: Dictionary
  isLocating: boolean
  locale: Locale
  onLocate: () => void
}) {
  return (
    <header className="flex flex-col gap-3 border border-border bg-card px-4 py-3 text-card-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <a
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
      </a>

      <div className="flex flex-wrap items-center gap-2">
        <LanguageSwitcher dictionary={dictionary} locale={locale} />
        <Button
          variant="outline"
          className="hidden px-3 sm:inline-flex"
          disabled={isLocating}
          onClick={onLocate}
        >
          {isLocating ? dictionary.loadingState : dictionary.myLocation}
        </Button>
        <Button className="px-4 sm:px-5">{dictionary.addShop}</Button>
      </div>
    </header>
  )
}

function LanguageSwitcher({
  dictionary,
  locale,
}: {
  dictionary: Dictionary
  locale: Locale
}) {
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

function Toolbar({
  dictionary,
  view,
  onViewChange,
}: {
  dictionary: Dictionary
  view: ViewMode
  onViewChange: (view: ViewMode) => void
}) {
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
          >
            <ListIcon className="size-4" />
            {dictionary.list}
          </button>
        </div>
      </div>
    </div>
  )
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

function MapView({
  dictionary,
  isLocating,
  locationError,
  onLocate,
  shops,
  selectedShop,
  userLocation,
  onSelectShop,
}: {
  dictionary: Dictionary
  isLocating: boolean
  locationError: string | null
  onLocate: () => void
  shops: UiShop[]
  selectedShop: UiShop | null
  userLocation: Coordinates | null
  onSelectShop: (shop: UiShop) => void
}) {
  if (shops.length === 0 || !selectedShop) {
    return <EmptyState dictionary={dictionary} />
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
          {dictionary.nearbyArea}
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

function ListView({
  dictionary,
  shops,
}: {
  dictionary: Dictionary
  shops: UiShop[]
}) {
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
          <EmptyState dictionary={dictionary} />
        )}
      </div>
    </div>
  )
}

function ShopPopup({
  dictionary,
  shop,
}: {
  dictionary: Dictionary
  shop: UiShop
}) {
  return (
    <article className="border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black tracking-[-0.04em] text-foreground">
            {shop.name}
          </h2>
          <p className="mt-1 max-w-68 text-xs leading-5 text-muted-foreground">
            {shop.address}
          </p>
        </div>
        <span className="bg-secondary px-2.5 py-1 text-xs font-black text-secondary-foreground">
          {shop.distance}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <AvailabilityBadge available={shop.exchange}>
          {dictionary.exchange}
        </AvailabilityBadge>
        <AvailabilityBadge available={shop.newCylinder}>
          {dictionary.newCylinder}
        </AvailabilityBadge>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
        <div>
          <p className="text-[0.65rem] font-bold tracking-[0.16em] text-muted-foreground uppercase">
            {dictionary.price14kg}
          </p>
          <p className="mt-1 text-lg font-black text-foreground">
            {shop.price ?? dictionary.unknownPrice}
          </p>
        </div>
        <div className="flex gap-2">
          {shop.phone ? (
            <Button
              asChild
              variant="outline"
              size="icon"
              className="border-border bg-background"
            >
              <a
                href={`tel:${shop.phone}`}
                aria-label={`${dictionary.callShop} ${shop.name}`}
              >
                <PhoneIcon className="size-4" />
              </a>
            </Button>
          ) : null}
          <Button asChild className="px-4">
            <a href="#directions">{dictionary.directions}</a>
          </Button>
        </div>
      </div>
    </article>
  )
}

function ShopCard({
  dictionary,
  shop,
}: {
  dictionary: Dictionary
  shop: UiShop
}) {
  return (
    <article className="border border-border bg-card p-4 text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-black tracking-[-0.04em] text-foreground">
            {shop.name}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {shop.address}
          </p>
        </div>
        <span className="shrink-0 bg-secondary px-2.5 py-1 text-xs font-black text-secondary-foreground">
          {shop.distance}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <AvailabilityBadge available={shop.exchange}>
          {dictionary.exchange}
        </AvailabilityBadge>
        <AvailabilityBadge available={shop.newCylinder}>
          {dictionary.newCylinder}
        </AvailabilityBadge>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-bold tracking-[0.16em] text-muted-foreground uppercase">
            {dictionary.price}
          </p>
          <p className="text-base font-black text-foreground">
            {shop.price ?? dictionary.unknownPrice}
          </p>
        </div>
        <div className="flex gap-2">
          {shop.phone ? (
            <Button
              asChild
              variant="outline"
              className="border-border bg-background"
            >
              <a href={`tel:${shop.phone}`}>
                <PhoneIcon className="size-4" />
                {dictionary.call}
              </a>
            </Button>
          ) : null}
          <Button asChild className="px-4">
            <a href="#directions">{dictionary.directions}</a>
          </Button>
        </div>
      </div>
    </article>
  )
}

function SearchSummary({
  dictionary,
  lowestPrice,
  shopCount,
}: {
  dictionary: Dictionary
  lowestPrice: string | null
  shopCount: number
}) {
  return (
    <section className="border border-border bg-card p-5 text-card-foreground shadow-sm">
      <p className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
        {dictionary.summaryLabel}
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.06em] text-foreground">
        {dictionary.summaryTitle}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {dictionary.summaryDescription}
      </p>
      <div className="mt-5 grid grid-cols-4 gap-2 text-center">
        <Metric className="col-span-4" value={String(shopCount)} label={dictionary.metricShops} />
        <Metric className="col-span-2" value="Selangor" label={dictionary.metricNearest} />
        <Metric
          className="col-span-2"
          value={lowestPrice ?? dictionary.unknownPrice}
          label={dictionary.metricFrom}
        />
      </div>
    </section>
  )
}

function EmptyState({ dictionary }: { dictionary: Dictionary }) {
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

function StateExamples({ dictionary }: { dictionary: Dictionary }) {
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

function AvailabilityBadge({
  available,
  children,
}: {
  available: boolean
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black",
        available
          ? "bg-primary text-primary-foreground"
          : "bg-destructive/10 text-destructive"
      )}
    >
      {available ? (
        <CheckIcon className="size-3.5" />
      ) : (
        <XIcon className="size-3.5" />
      )}
      {children}
    </span>
  )
}

function Metric({ className, value, label }: { className?: string; value: string; label: string }) {
  return (
    <div className={cn("bg-muted p-3", className)}>
      <p className="text-lg font-black tracking-tighter text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[0.65rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </p>
    </div>
  )
}

function GasIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9 5h6M10 5V3h4v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 10c0-2.2 1.8-4 4-4h2c2.2 0 4 1.8 4 4v7a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4v-7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M9.5 13h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 3v15M15 6v15" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 6h13M8 12h13M8 18h13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 6h.01M3 12h.01M3 18h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LocateIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 3v3M12 18v3M3 12h3M18 12h3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="m20 6-11 11-5-5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v4M12 17h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
