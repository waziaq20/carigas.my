"use client"

import { useState, useTransition } from "react"
import Link from "next/link"

import {
  bulkDeleteShops,
  bulkSetShopApproval,
  deleteShop,
  toggleShopApproval,
} from "@/app/admin/actions"
import { Button } from "@/components/ui/button"

export type ShopTableRow = {
  id: string
  name: string
  address: string
  phone: string | null
  exchange: boolean
  sellNew: boolean
  lat: number
  lng: number
  priceLabel: string
  approved: boolean
  updatedAtLabel: string
}

type ShopsTableProps = {
  shops: ShopTableRow[]
}

export function ShopsTable({ shops }: ShopsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [isPending, startTransition] = useTransition()

  const selectedCount = selectedIds.size
  const allOnPageSelected =
    shops.length > 0 && shops.every((shop) => selectedIds.has(shop.id))

  function toggleShop(id: string) {
    setSelectedIds((curr) => {
      const next = new Set(curr)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleAll() {
    setSelectedIds((curr) => {
      if (shops.length > 0 && shops.every((shop) => curr.has(shop.id))) {
        const next = new Set(curr)
        for (const shop of shops) {
          next.delete(shop.id)
        }
        return next
      }
      const next = new Set(curr)
      for (const shop of shops) {
        next.add(shop.id)
      }
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  function handleBulkApprove(approved: boolean) {
    const ids = [...selectedIds]
    if (ids.length === 0) {
      return
    }
    startTransition(async () => {
      await bulkSetShopApproval(ids, approved)
      setSelectedIds(new Set())
    })
  }

  function handleBulkDelete() {
    const ids = [...selectedIds]
    if (ids.length === 0) {
      return
    }
    if (
      !window.confirm(
        `Delete ${ids.length} shop${ids.length === 1 ? "" : "s"}? This cannot be undone.`
      )
    ) {
      return
    }
    startTransition(async () => {
      await bulkDeleteShops(ids)
      setSelectedIds(new Set())
    })
  }

  return (
    <>
      {selectedCount > 0 ? (
        <div className="flex flex-col gap-2 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-bold tracking-tight">
            {selectedCount} shop{selectedCount === 1 ? "" : "s"} selected
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkApprove(true)}
              disabled={isPending}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkApprove(false)}
              disabled={isPending}
            >
              Unapprove
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isPending}
            >
              Delete
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              disabled={isPending}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-240 border-collapse text-left text-sm">
          <thead className="bg-muted/50 text-xs tracking-[0.16em] text-muted-foreground uppercase">
            <tr>
              <th className="w-12 px-4 py-3 font-bold">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={allOnPageSelected}
                  onChange={toggleAll}
                  aria-label="Select all shops on this page"
                />
              </th>
              <th className="px-4 py-3 font-bold">Shop</th>
              <th className="px-4 py-3 font-bold">Services</th>
              <th className="px-4 py-3 font-bold">Price</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Updated</th>
              <th className="px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shops.length > 0 ? (
              shops.map((shop) => (
                <tr key={shop.id} className="border-t border-border">
                  <td className="px-4 py-4 align-top">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={selectedIds.has(shop.id)}
                      onChange={() => toggleShop(shop.id)}
                      aria-label={`Select ${shop.name}`}
                    />
                  </td>
                  <td className="max-w-96 px-4 py-4 align-top">
                    <p className="font-black tracking-[-0.03em]">{shop.name}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {shop.address}
                    </p>
                    {shop.phone ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {shop.phone}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 align-top text-xs text-muted-foreground">
                    <p>Exchange: {shop.exchange ? "Yes" : "No"}</p>
                    <p>New cylinder: {shop.sellNew ? "Yes" : "No"}</p>
                    <p>
                      {shop.lat.toFixed(5)}, {shop.lng.toFixed(5)}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top font-semibold">
                    {shop.priceLabel}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span className="inline-flex border border-border bg-background px-2.5 py-1 text-xs font-bold">
                      {shop.approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top text-xs text-muted-foreground">
                    {shop.updatedAtLabel}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/shops/${shop.id}/edit`}>Edit</Link>
                      </Button>
                      <form
                        action={toggleShopApproval.bind(
                          null,
                          shop.id,
                          !shop.approved
                        )}
                      >
                        <Button size="sm" variant="outline">
                          {shop.approved ? "Unapprove" : "Approve"}
                        </Button>
                      </form>
                      <form action={deleteShop.bind(null, shop.id)}>
                        <Button size="sm" variant="destructive">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No shops yet. Add the first shop to publish listings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
