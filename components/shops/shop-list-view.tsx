"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"

import {
  CylinderIcon,
  ExchangeIcon,
  PhoneIcon,
  SearchIcon,
  XIcon,
} from "@/components/icons/app-icons"
import type { Dictionary } from "@/lib/i18n"
import { getFavorites } from "@/lib/favorites"
import { cn } from "@/lib/utils"
import type { UiShop } from "@/types"

import { EmptyShopsState } from "./empty-shops-state"
import { NoResultsState } from "./no-results-state"
import { ShopCard } from "./shop-card"

type ShopListViewProps = {
  dictionary: Dictionary
  locale: string
  shops: UiShop[]
}

type FilterKey = "exchange" | "newCylinder" | "hasPhone"

type FilterConfig = {
  key: FilterKey
  label: string
  icon: React.ReactNode
}

export function ShopListView({ dictionary, locale, shops }: ShopListViewProps) {
  const [searchText, setSearchText] = useState("")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set())
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({
    exchange: false,
    newCylinder: false,
    hasPhone: false,
  })

  const deferredSearchText = useDeferredValue(searchText)

  useEffect(() => {
    if (!showFavoritesOnly) {
      return
    }

    function refreshFavorites() {
      setFavoriteIds(new Set(getFavorites()))
    }

    refreshFavorites()
    window.addEventListener("carigas:favorites-changed", refreshFavorites)

    return () => {
      window.removeEventListener("carigas:favorites-changed", refreshFavorites)
    }
  }, [showFavoritesOnly])

  const hasActiveFilters =
    deferredSearchText.trim() !== "" ||
    filters.exchange ||
    filters.newCylinder ||
    filters.hasPhone ||
    showFavoritesOnly

  const filteredShops = useMemo(() => {
    const query = deferredSearchText.trim().toLowerCase()

    return shops.filter((shop) => {
      if (query) {
        const matchesName = shop.name.toLowerCase().includes(query)
        const matchesAddress = shop.address.toLowerCase().includes(query)

        if (!matchesName && !matchesAddress) {
          return false
        }
      }

      if (filters.exchange && !shop.exchange) {
        return false
      }

      if (filters.newCylinder && !shop.newCylinder) {
        return false
      }

      if (filters.hasPhone && !shop.phone) {
        return false
      }

      if (showFavoritesOnly && !favoriteIds.has(shop.id)) {
        return false
      }

      return true
    })
  }, [shops, deferredSearchText, filters, showFavoritesOnly, favoriteIds])

  function toggleFilter(key: FilterKey) {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  function clearAllFilters() {
    setSearchText("")
    setShowFavoritesOnly(false)
    setFilters({
      exchange: false,
      newCylinder: false,
      hasPhone: false,
    })
  }

  const filterConfigs: FilterConfig[] = [
    {
      key: "exchange",
      label: dictionary.exchange,
      icon: <ExchangeIcon className="size-3.5" />,
    },
    {
      key: "newCylinder",
      label: dictionary.newCylinder,
      icon: <CylinderIcon className="size-3.5" />,
    },
    {
      key: "hasPhone",
      label: dictionary.filterHasPhone,
      icon: <PhoneIcon className="size-3.5" />,
    },
  ]

  const resultsLabel = dictionary.resultsCount.replace(
    "{count}",
    String(filteredShops.length)
  )

  return (
    <div className="flex h-full flex-col overflow-hidden bg-muted/40">
      <div className="border-b border-border bg-card p-3 shadow-sm sm:p-4">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={dictionary.searchPlaceholder}
            aria-label={dictionary.searchPlaceholder}
            className="h-10 w-full border border-border bg-background pr-10 pl-10 text-sm font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring/50 focus:outline-none"
          />
          {searchText ? (
            <button
              type="button"
              onClick={() => setSearchText("")}
              className="absolute top-1/2 right-3 grid size-5 -translate-y-1/2 place-items-center text-muted-foreground transition hover:text-foreground"
              aria-label={dictionary.clearSearch}
            >
              <XIcon className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {filterConfigs.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleFilter(key)}
              aria-pressed={filters[key]}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 border px-3 text-xs font-black transition",
                filters[key]
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {icon}
              {label}
            </button>
          ))}
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto inline-flex h-8 items-center gap-1 px-2 text-xs font-bold text-muted-foreground underline-offset-2 transition hover:text-foreground hover:underline"
            >
              <XIcon className="size-3.5" />
              {dictionary.clearFilters}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setShowFavoritesOnly((prev) => !prev)}
            aria-pressed={showFavoritesOnly}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 border px-3 text-xs font-black transition",
              showFavoritesOnly
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-3.5"
              fill={showFavoritesOnly ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {dictionary.showFavoritesOnly}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-3 pt-3 sm:px-4">
        <div>
          <p className="text-sm font-black text-foreground">
            {dictionary.listTitle}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasActiveFilters ? resultsLabel : dictionary.sortDescription}
          </p>
        </div>
        <span className="shrink-0 bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          {dictionary.closestFirst}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="grid gap-3">
          {shops.length === 0 ? (
            <EmptyShopsState dictionary={dictionary} locale={locale} />
          ) : filteredShops.length === 0 ? (
            <NoResultsState
              dictionary={dictionary}
              locale={locale}
              onClear={clearAllFilters}
            />
          ) : (
            filteredShops.map((shop) => (
              <ShopCard key={shop.id} dictionary={dictionary} shop={shop} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
