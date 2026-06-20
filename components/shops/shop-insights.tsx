import type { Dictionary } from "@/lib/i18n"
import type { UiShop } from "@/types"

type ShopInsightsProps = {
  dictionary: Dictionary
  lowestPrice: string | null
  shops: UiShop[]
}

type InsightRowProps = {
  label: string
  value: string
}

function InsightRow({ label, value }: InsightRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border border-border bg-muted/40 px-3 py-2.5">
      <span className="text-xs font-bold text-muted-foreground lowercase">
        {label}
      </span>
      <span className="text-sm font-black text-foreground">{value}</span>
    </div>
  )
}

export function ShopInsights({
  dictionary,
  lowestPrice,
  shops,
}: ShopInsightsProps) {
  const pricedShopCount = shops.filter(
    (shop) => shop.priceValue !== null
  ).length
  const exchangeShopCount = shops.filter((shop) => shop.exchange).length
  const newCylinderShopCount = shops.filter((shop) => shop.newCylinder).length
  const contactableShopCount = shops.filter((shop) => shop.phone).length

  return (
    <section className="border border-border bg-card p-4 text-card-foreground shadow-sm">
      <p className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
        {dictionary.insightsLabel}
      </p>
      <h2 className="mt-2 font-black tracking-[-0.04em] text-foreground">
        {dictionary.insightsTitle}
      </h2>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {dictionary.insightsDescription}
      </p>

      <div className="mt-4 grid gap-2">
        <InsightRow
          label={dictionary.metricShops}
          value={String(shops.length)}
        />
        <InsightRow
          label={dictionary.insightsWithPrice}
          value={String(pricedShopCount)}
        />
        <InsightRow
          label={dictionary.insightsLowestPrice}
          value={lowestPrice ?? dictionary.unknownPrice}
        />
        <InsightRow
          label={dictionary.exchange}
          value={String(exchangeShopCount)}
        />
        <InsightRow
          label={dictionary.newCylinder}
          value={String(newCylinderShopCount)}
        />
        <InsightRow
          label={dictionary.insightsContactable}
          value={String(contactableShopCount)}
        />
      </div>
    </section>
  )
}
