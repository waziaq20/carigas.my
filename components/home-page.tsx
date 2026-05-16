"use client"

import Link from "next/link"
import { useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { localeLabels, locales, type Dictionary, type Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type ViewMode = "map" | "list"

type Shop = {
  id: number
  name: string
  address: string
  distance: string
  price: string | null
  phone: string
  exchange: boolean
  newCylinder: boolean
  top: string
  left: string
}

const shops: Shop[] = [
  {
    id: 1,
    name: "Kedai Gas Seri Maju",
    address: "12, Jalan Melati 3, Taman Seri Maju, Shah Alam",
    distance: "1.2 km",
    price: "RM32.00",
    phone: "+60355122388",
    exchange: true,
    newCylinder: true,
    top: "39%",
    left: "52%",
  },
  {
    id: 2,
    name: "Dapur Kita Trading",
    address: "Lot 8, Jalan Anggerik, Seksyen 15, Shah Alam",
    distance: "2.0 km",
    price: null,
    phone: "+60355418010",
    exchange: true,
    newCylinder: false,
    top: "58%",
    left: "34%",
  },
  {
    id: 3,
    name: "Rakan Gas Express",
    address: "G-05, Pusat Komersial Hijau, Subang Jaya",
    distance: "3.4 km",
    price: "RM34.50",
    phone: "+60356309011",
    exchange: false,
    newCylinder: true,
    top: "28%",
    left: "68%",
  },
  {
    id: 4,
    name: "Warung Bekalan Azman",
    address: "45, Jalan Kenanga, Kampung Melayu Subang",
    distance: "4.8 km",
    price: "RM33.00",
    phone: "+60378431122",
    exchange: true,
    newCylinder: true,
    top: "70%",
    left: "72%",
  },
]

const activeShop = shops[0]

export function HomePage({
  dictionary,
  locale,
}: {
  dictionary: Dictionary
  locale: Locale
}) {
  const [view, setView] = useState<ViewMode>("map")
  const [selectedShop, setSelectedShop] = useState<Shop>(activeShop)

  return (
    <main className="min-h-svh overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
        <Header dictionary={dictionary} locale={locale} />

        <section className="grid flex-1 gap-4 pt-4 lg:grid-cols-[minmax(0,1fr)_21rem] lg:pt-5">
          <div className="flex min-h-0 flex-col overflow-hidden border border-border bg-card text-card-foreground shadow-sm">
            <Toolbar
              dictionary={dictionary}
              view={view}
              onViewChange={setView}
            />

            <div className="relative min-h-[calc(100svh-11.5rem)] flex-1 overflow-hidden sm:min-h-[42rem] lg:min-h-0">
              {view === "map" ? (
                <MapView
                  dictionary={dictionary}
                  selectedShop={selectedShop}
                  onSelectShop={setSelectedShop}
                />
              ) : (
                <ListView dictionary={dictionary} />
              )}
            </div>
          </div>

          <aside className="hidden min-h-0 flex-col gap-4 lg:flex">
            <SearchSummary dictionary={dictionary} />
            <StateExamples dictionary={dictionary} />
          </aside>
        </section>

        <div className="grid gap-4 pt-4 lg:hidden">
          <SearchSummary dictionary={dictionary} />
          <StateExamples dictionary={dictionary} />
        </div>
      </div>
    </main>
  )
}

function Header({
  dictionary,
  locale,
}: {
  dictionary: Dictionary
  locale: Locale
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
          <span className="block text-lg font-black tracking-[-0.05em] text-foreground sm:text-xl">
            carigas.my
          </span>
          <span className="hidden text-[0.65rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase sm:block">
            {dictionary.appTagline}
          </span>
        </span>
      </a>

      <div className="flex flex-wrap items-center gap-2">
        <LanguageSwitcher dictionary={dictionary} locale={locale} />
        <Button variant="outline" className="hidden px-3 sm:inline-flex">
          {dictionary.myLocation}
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

function MapView({
  dictionary,
  selectedShop,
  onSelectShop,
}: {
  dictionary: Dictionary
  selectedShop: Shop
  onSelectShop: (shop: Shop) => void
}) {
  return (
    <div className="relative h-full min-h-[inherit] overflow-hidden bg-muted">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,currentColor_1px,transparent_1px),linear-gradient(0deg,currentColor_1px,transparent_1px)] bg-[size:72px_72px] text-border opacity-60" />
      <div className="absolute top-[20%] -left-12 h-20 w-[120%] rotate-[-13deg] bg-background/60 blur-[1px]" />
      <div className="absolute top-[12%] left-[8%] h-16 w-[92%] rotate-[18deg] bg-secondary/70 blur-[2px]" />
      <div className="absolute top-[62%] left-[18%] h-24 w-[82%] rotate-[-20deg] bg-accent/70 blur-[3px]" />

      <div className="absolute top-4 left-4 z-20 border border-border bg-card p-3 text-card-foreground shadow-sm">
        <p className="text-[0.65rem] font-bold tracking-[0.18em] text-muted-foreground uppercase">
          {dictionary.nearbyArea}
        </p>
        <p className="mt-1 text-sm font-black text-foreground">
          {dictionary.shopsFound}
        </p>
      </div>

      <Button
        variant="outline"
        className="absolute top-4 right-4 z-20 px-3 shadow-sm"
      >
        <LocateIcon className="size-4" />
        {dictionary.myLocation}
      </Button>

      {shops.map((shop) => (
        <button
          key={shop.id}
          type="button"
          onClick={() => onSelectShop(shop)}
          className={cn(
            "absolute z-10 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center border-4 border-background bg-foreground text-background shadow-sm transition hover:scale-110",
            selectedShop.id === shop.id &&
              "z-30 scale-110 bg-primary text-primary-foreground"
          )}
          style={{ top: shop.top, left: shop.left }}
          aria-label={`${dictionary.viewShop} ${shop.name}`}
        >
          <PinIcon className="size-5" />
        </button>
      ))}

      <div className="absolute inset-x-3 bottom-3 z-40 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[23rem]">
        <ShopPopup dictionary={dictionary} shop={selectedShop} />
      </div>
    </div>
  )
}

function ListView({ dictionary }: { dictionary: Dictionary }) {
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
        {shops.map((shop) => (
          <ShopCard key={shop.id} dictionary={dictionary} shop={shop} />
        ))}
      </div>
    </div>
  )
}

function ShopPopup({
  dictionary,
  shop,
}: {
  dictionary: Dictionary
  shop: Shop
}) {
  return (
    <article className="border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black tracking-[-0.04em] text-foreground">
            {shop.name}
          </h2>
          <p className="mt-1 max-w-[17rem] text-xs leading-5 text-muted-foreground">
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
  shop: Shop
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
          <Button asChild className="px-4">
            <a href="#directions">{dictionary.directions}</a>
          </Button>
        </div>
      </div>
    </article>
  )
}

function SearchSummary({ dictionary }: { dictionary: Dictionary }) {
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
      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <Metric value="4" label={dictionary.metricShops} />
        <Metric value="1.2km" label={dictionary.metricNearest} />
        <Metric value="RM32" label={dictionary.metricFrom} />
      </div>
    </section>
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

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-muted p-3">
      <p className="text-lg font-black tracking-[-0.05em] text-foreground">
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

function PinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 22s7-6.1 7-12A7 7 0 0 0 5 10c0 5.9 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="2"
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
