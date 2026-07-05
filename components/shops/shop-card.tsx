"use client"

import { useSyncExternalStore } from "react"

import {
  CylinderIcon,
  ExchangeIcon,
  PhoneIcon,
} from "@/components/icons/app-icons"
import { Button } from "@/components/ui/button"
import type { Dictionary } from "@/lib/i18n"
import { isFavorite, toggleFavorite } from "@/lib/favorites"
import { getGoogleMapsDirectionsUrl } from "@/lib/maps"
import { isShopOpenNow } from "@/lib/operating-hours"
import { formatMalaysianPhoneDisplay } from "@/lib/phone"
import type { UiShop } from "@/types"

import { AvailabilityBadge } from "./availability-badge"

type ShopCardProps = {
  dictionary: Dictionary
  shop: UiShop
}

function subscribeFavorites(callback: () => void) {
  window.addEventListener("carigas:favorites-changed", callback)
  return () => window.removeEventListener("carigas:favorites-changed", callback)
}

export function ShopCard({ dictionary, shop }: ShopCardProps) {
  const isFav = useSyncExternalStore(
    subscribeFavorites,
    () => isFavorite(shop.id),
    () => false
  )

  function handleToggleFavorite() {
    toggleFavorite(shop.id)
  }

  const isOpen = shop.openHours ? isShopOpenNow(shop.openHours) : null

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
        <div className="flex shrink-0 items-center gap-2">
          {isOpen !== null ? (
            <span
              className={
                isOpen
                  ? "text-xs font-bold text-green-600"
                  : "text-xs font-bold text-muted-foreground"
              }
            >
              {isOpen ? dictionary.openNow : dictionary.closed}
            </span>
          ) : null}
          <span className="bg-secondary px-2.5 py-1 text-xs font-black text-secondary-foreground">
            {shop.distance}
          </span>
          <button
            type="button"
            onClick={handleToggleFavorite}
            className="text-muted-foreground transition hover:text-foreground"
            aria-label={dictionary.favorites}
            aria-pressed={isFav}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill={isFav ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <AvailabilityBadge
          available={shop.exchange}
          icon={<ExchangeIcon className="size-3.5" />}
        >
          {dictionary.exchange}
        </AvailabilityBadge>
        <AvailabilityBadge
          available={shop.newCylinder}
          icon={<CylinderIcon className="size-3.5" />}
        >
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
                {formatMalaysianPhoneDisplay(shop.phone) ?? dictionary.call}
              </a>
            </Button>
          ) : null}
          <Button asChild className="px-4">
            <a
              href={getGoogleMapsDirectionsUrl(shop)}
              target="_blank"
              rel="noreferrer"
            >
              {dictionary.directions}
            </a>
          </Button>
        </div>
      </div>
    </article>
  )
}
