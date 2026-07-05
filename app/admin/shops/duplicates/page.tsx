import Link from "next/link"

import { Button } from "@/components/ui/button"
import { requireAdminSession } from "@/lib/admin-auth"
import { findDuplicateShops } from "@/lib/shop-dedup"

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`
}

export default async function DuplicatesPage() {
  await requireAdminSession()

  const groups = await findDuplicateShops()

  return (
    <main className="min-h-svh bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Shop management
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-[-0.05em]">
              Possible duplicates
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Shops located within 200m of each other. Review and merge or
              remove duplicates.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">Back to admin</Link>
          </Button>
        </div>

        {groups.length > 0 ? (
          <div className="flex flex-col gap-4">
            {groups.map((group, index) => (
              <section
                key={index}
                className="border border-border bg-card p-4 text-card-foreground shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <p className="text-sm font-bold tracking-tight">
                    Group {index + 1} — {group.shops.length} shops
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max distance: {formatDistance(group.maxDistanceKm)}
                  </p>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {group.shops.map((shop) => (
                    <div
                      key={shop.id}
                      className="flex items-center justify-between gap-4 border border-border bg-background p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold tracking-tight">
                          {shop.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {shop.address}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {shop.lat.toFixed(5)}, {shop.lng.toFixed(5)} —{" "}
                          {shop.approved ? "Approved" : "Pending"}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/shops/${shop.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="border border-border bg-card p-12 text-center text-muted-foreground shadow-sm">
            No duplicate shops detected. All shops are sufficiently far apart.
          </div>
        )}
      </div>
    </main>
  )
}
