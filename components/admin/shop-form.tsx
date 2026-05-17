import Link from "next/link"

import { Button } from "@/components/ui/button"

type EditableShop = {
  address: string
  approved: boolean
  exchange: boolean
  lat: number
  lng: number
  name: string
  phone: string | null
  price: number | null
  sellNew: boolean
}

type ShopFormProps = {
  action: (formData: FormData) => Promise<void>
  cta: string
  shop?: EditableShop
  title: string
}

const inputClassName =
  "h-10 border border-border bg-background px-3 text-sm font-normal outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"

const textareaClassName =
  "min-h-24 border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"

function formatPriceInput(price: number | null | undefined) {
  return price === null || price === undefined ? "" : (price / 100).toFixed(2)
}

export function ShopForm({ action, cta, shop, title }: ShopFormProps) {
  return (
    <form
      action={action}
      className="border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground uppercase">
            Admin shop record
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.05em]">
            {title}
          </h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin">Back to admin</Link>
        </Button>
      </div>

      <div className="grid gap-4 pt-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold sm:col-span-2">
          Shop name
          <input
            className={inputClassName}
            name="name"
            defaultValue={shop?.name}
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold sm:col-span-2">
          Address
          <textarea
            className={textareaClassName}
            name="address"
            defaultValue={shop?.address}
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold">
          Latitude
          <input
            className={inputClassName}
            name="lat"
            type="number"
            step="any"
            defaultValue={shop?.lat}
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold">
          Longitude
          <input
            className={inputClassName}
            name="lng"
            type="number"
            step="any"
            defaultValue={shop?.lng}
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold">
          14kg price (RM)
          <input
            className={inputClassName}
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={formatPriceInput(shop?.price)}
            placeholder="26.60"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold">
          Phone
          <input
            className={inputClassName}
            name="phone"
            type="tel"
            defaultValue={shop?.phone ?? ""}
            placeholder="+60123456789"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
        <label className="flex items-center gap-3 border border-border bg-background p-3 text-sm font-semibold">
          <input
            name="exchange"
            type="checkbox"
            defaultChecked={shop?.exchange ?? true}
          />
          Exchange available
        </label>
        <label className="flex items-center gap-3 border border-border bg-background p-3 text-sm font-semibold">
          <input name="sellNew" type="checkbox" defaultChecked={shop?.sellNew} />
          New cylinder available
        </label>
        <label className="flex items-center gap-3 border border-border bg-background p-3 text-sm font-semibold">
          <input name="approved" type="checkbox" defaultChecked={shop?.approved} />
          Approved for public listing
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" asChild>
          <Link href="/admin">Cancel</Link>
        </Button>
        <Button>{cta}</Button>
      </div>
    </form>
  )
}
