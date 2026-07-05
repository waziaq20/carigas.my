import Link from "next/link"

import { logoutAdmin } from "@/app/admin/actions"
import { ShopsTable } from "@/components/admin/shops-table"
import type { ShopTableRow } from "@/components/admin/shops-table"
import { GasIcon } from "@/components/icons/app-icons"
import { Button } from "@/components/ui/button"
import { requireAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { formatShopPrice } from "@/lib/shops"

function formatDate(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  const hours = String(date.getUTCHours()).padStart(2, "0")
  const minutes = String(date.getUTCMinutes()).padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes} UTC`
}

const shopsPerPage = 20

type AdminPageProps = {
  searchParams: Promise<{
    page?: string
  }>
}

function getCurrentPage(page: string | undefined) {
  const pageNumber = Number(page)

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return 1
  }

  return pageNumber
}

function getAdminPageHref(page: number) {
  return page === 1 ? "/admin" : `/admin?page=${page}`
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await requireAdminSession()
  const { page } = await searchParams
  const currentPage = getCurrentPage(page)
  const [totalCount, approvedCount, pricedCount] = await Promise.all([
    prisma.shop.count(),
    prisma.shop.count({
      where: {
        approved: true,
      },
    }),
    prisma.shop.count({
      where: {
        price: {
          not: null,
        },
      },
    }),
  ])
  const pendingCount = totalCount - approvedCount
  const totalPages = Math.max(1, Math.ceil(totalCount / shopsPerPage))
  const boundedCurrentPage = Math.min(currentPage, totalPages)
  const shops = await prisma.shop.findMany({
    orderBy: [
      {
        approved: "asc",
      },
      {
        updatedAt: "desc",
      },
    ],
    skip: (boundedCurrentPage - 1) * shopsPerPage,
    take: shopsPerPage,
  })
  const firstShopIndex =
    totalCount === 0 ? 0 : (boundedCurrentPage - 1) * shopsPerPage + 1
  const lastShopIndex = Math.min(boundedCurrentPage * shopsPerPage, totalCount)
  const shopRows: ShopTableRow[] = shops.map((shop) => ({
    id: shop.id,
    name: shop.name,
    address: shop.address,
    phone: shop.phone,
    exchange: shop.exchange,
    sellNew: shop.sellNew,
    lat: shop.lat,
    lng: shop.lng,
    priceLabel: formatShopPrice(shop.price) ?? "-",
    approved: shop.approved,
    updatedAtLabel: formatDate(shop.updatedAt),
  }))

  return (
    <main className="min-h-svh bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="flex flex-col gap-4 border border-border bg-card p-4 text-card-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center bg-primary text-primary-foreground">
              <GasIcon className="size-5" />
            </span>
            <div>
              <p className="text-lg font-black tracking-tighter">carigas.my</p>
              <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                Shop administration
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
              Signed in as {session.username}
            </span>
            <Button variant="outline" asChild>
              <Link href="/admin/shops/import">Import / export</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/shops/new">Add shop</Link>
            </Button>
            <form action={logoutAdmin}>
              <Button variant="outline">Sign out</Button>
            </form>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="border border-border bg-card p-4 shadow-sm">
            <p className="text-[0.65rem] font-bold tracking-[0.18em] text-muted-foreground uppercase">
              Total shops
            </p>
            <p className="mt-2 text-3xl font-black tracking-[-0.06em]">
              {totalCount}
            </p>
          </div>
          <div className="border border-border bg-card p-4 shadow-sm">
            <p className="text-[0.65rem] font-bold tracking-[0.18em] text-muted-foreground uppercase">
              Approved
            </p>
            <p className="mt-2 text-3xl font-black tracking-[-0.06em]">
              {approvedCount}
            </p>
          </div>
          <div className="border border-border bg-card p-4 shadow-sm">
            <p className="text-[0.65rem] font-bold tracking-[0.18em] text-muted-foreground uppercase">
              Pending / missing price
            </p>
            <p className="mt-2 text-3xl font-black tracking-[-0.06em]">
              {pendingCount} / {totalCount - pricedCount}
            </p>
          </div>
        </section>

        <section className="overflow-hidden border border-border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-black tracking-[-0.05em]">
                Manage shops
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {firstShopIndex}-{lastShopIndex} of {totalCount} shops.
                Only approved shops appear on the public map and list.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">View public site</Link>
            </Button>
          </div>

          <ShopsTable shops={shopRows} />

          <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Page {boundedCurrentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={boundedCurrentPage <= 1}
                asChild={boundedCurrentPage > 1}
              >
                {boundedCurrentPage > 1 ? (
                  <Link href={getAdminPageHref(boundedCurrentPage - 1)}>
                    Previous
                  </Link>
                ) : (
                  "Previous"
                )}
              </Button>
              <Button
                variant="outline"
                disabled={boundedCurrentPage >= totalPages}
                asChild={boundedCurrentPage < totalPages}
              >
                {boundedCurrentPage < totalPages ? (
                  <Link href={getAdminPageHref(boundedCurrentPage + 1)}>
                    Next
                  </Link>
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
