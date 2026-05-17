import Link from "next/link"

import {
  deleteShop,
  logoutAdmin,
  toggleShopApproval,
} from "@/app/admin/actions"
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

          <div className="overflow-x-auto">
            <table className="w-full min-w-240 border-collapse text-left text-sm">
              <thead className="bg-muted/50 text-xs tracking-[0.16em] text-muted-foreground uppercase">
                <tr>
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
                      <td className="max-w-96 px-4 py-4 align-top">
                        <p className="font-black tracking-[-0.03em]">
                          {shop.name}
                        </p>
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
                        {formatShopPrice(shop.price) ?? "-"}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className="inline-flex border border-border bg-background px-2.5 py-1 text-xs font-bold">
                          {shop.approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top text-xs text-muted-foreground">
                        {formatDate(shop.updatedAt)}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/shops/${shop.id}/edit`}>
                              Edit
                            </Link>
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
                      colSpan={6}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No shops yet. Add the first shop to publish listings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
