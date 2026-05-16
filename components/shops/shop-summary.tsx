import type { Dictionary } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type ShopSummaryProps = {
  dictionary: Dictionary
  lowestPrice: string | null
  shopCount: number
}

type MetricProps = {
  className?: string
  value: string
  label: string
}

function Metric({ className, value, label }: MetricProps) {
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

export function ShopSummary({
  dictionary,
  lowestPrice,
  shopCount,
}: ShopSummaryProps) {
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
        <Metric
          className="col-span-4"
          value={String(shopCount)}
          label={dictionary.metricShops}
        />
        <Metric
          className="col-span-2"
          value="Selangor"
          label={dictionary.metricNearest}
        />
        <Metric
          className="col-span-2"
          value={lowestPrice ?? dictionary.unknownPrice}
          label={dictionary.metricFrom}
        />
      </div>
    </section>
  )
}
