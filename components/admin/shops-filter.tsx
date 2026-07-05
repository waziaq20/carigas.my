"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"

type ShopsFilterProps = {
  search: string
  status: string
  hasPrice: string
  hasPhone: string
}

const statusOptions = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
] as const

const priceOptions = [
  { value: "all", label: "All prices" },
  { value: "yes", label: "Priced" },
  { value: "no", label: "No price" },
] as const

const phoneOptions = [
  { value: "all", label: "All phones" },
  { value: "yes", label: "Has phone" },
  { value: "no", label: "No phone" },
] as const

export function ShopsFilter({
  search: initialSearch,
  status,
  hasPrice,
  hasPhone,
}: ShopsFilterProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)

  function navigate(next: Partial<ShopsFilterProps>) {
    const params = new URLSearchParams()
    const s = next.search ?? initialSearch
    const st = next.status ?? status
    const hp = next.hasPrice ?? hasPrice
    const ph = next.hasPhone ?? hasPhone

    if (s) params.set("search", s)
    if (st && st !== "all") params.set("status", st)
    if (hp && hp !== "all") params.set("hasPrice", hp)
    if (ph && ph !== "all") params.set("hasPhone", ph)

    const qs = params.toString()
    router.push(qs ? `/admin?${qs}` : "/admin")
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    navigate({ search })
  }

  function toggleFilter(
    key: "status" | "hasPrice" | "hasPhone",
    value: string
  ) {
    const current =
      key === "status" ? status : key === "hasPrice" ? hasPrice : hasPhone
    navigate({
      [key]: current === value ? "all" : value,
    } as Partial<ShopsFilterProps>)
  }

  const chipClass = (active: boolean) =>
    `px-2.5 py-1 text-xs font-bold tracking-widest uppercase border transition-colors ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-background text-muted-foreground hover:bg-muted"
    }`

  return (
    <div className="flex flex-col gap-3 border-b border-border p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="h-8 flex-1 border border-border bg-background px-3 text-sm font-normal outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or address..."
        />
        <Button size="sm" type="submit">
          Search
        </Button>
        {initialSearch ? (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => {
              setSearch("")
              navigate({ search: "" })
            }}
          >
            Clear
          </Button>
        ) : null}
      </form>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[0.65rem] font-bold tracking-[0.18em] text-muted-foreground uppercase">
            Status
          </span>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={chipClass(status === opt.value)}
              onClick={() => toggleFilter("status", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[0.65rem] font-bold tracking-[0.18em] text-muted-foreground uppercase">
            Price
          </span>
          {priceOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={chipClass(hasPrice === opt.value)}
              onClick={() => toggleFilter("hasPrice", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[0.65rem] font-bold tracking-[0.18em] text-muted-foreground uppercase">
            Phone
          </span>
          {phoneOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={chipClass(hasPhone === opt.value)}
              onClick={() => toggleFilter("hasPhone", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
