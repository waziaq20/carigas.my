import {
  CylinderIcon,
  ExchangeIcon,
  PhoneIcon,
} from "@/components/icons/app-icons"
import { Button } from "@/components/ui/button"
import type { Dictionary } from "@/lib/i18n"
import { getGoogleMapsDirectionsUrl } from "@/lib/maps"
import { formatMalaysianPhoneDisplay } from "@/lib/phone"
import type { UiShop } from "@/types"

import { AvailabilityBadge } from "./availability-badge"

type ShopPopupProps = {
  dictionary: Dictionary
  shop: UiShop
}

export function ShopPopup({ dictionary, shop }: ShopPopupProps) {
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
                aria-label={`${dictionary.callShop} ${formatMalaysianPhoneDisplay(shop.phone) ?? shop.name}`}
              >
                <PhoneIcon className="size-4" />
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
