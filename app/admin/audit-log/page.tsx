import Link from "next/link"

import { Button } from "@/components/ui/button"
import { requireAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

const entriesPerPage = 50

const actionLabels: Record<string, string> = {
  create: "Created",
  update: "Updated",
  approve: "Approved",
  unapprove: "Unapproved",
  delete: "Deleted",
  bulk_approve: "Bulk approved",
  bulk_unapprove: "Bulk unapproved",
  bulk_delete: "Bulk deleted",
  import: "Imported",
}

type AuditLogPageProps = {
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

function formatTimestamp(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  const hours = String(date.getUTCHours()).padStart(2, "0")
  const minutes = String(date.getUTCMinutes()).padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes} UTC`
}

export default async function AuditLogPage({
  searchParams,
}: AuditLogPageProps) {
  await requireAdminSession()

  const { page } = await searchParams
  const currentPage = getCurrentPage(page)
  const totalCount = await prisma.auditLog.count()
  const totalPages = Math.max(1, Math.ceil(totalCount / entriesPerPage))
  const boundedCurrentPage = Math.min(currentPage, totalPages)

  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    skip: (boundedCurrentPage - 1) * entriesPerPage,
    take: entriesPerPage,
    include: {
      shop: {
        select: { name: true },
      },
    },
  })

  const firstIndex =
    totalCount === 0 ? 0 : (boundedCurrentPage - 1) * entriesPerPage + 1
  const lastIndex = Math.min(boundedCurrentPage * entriesPerPage, totalCount)

  return (
    <main className="min-h-svh bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Shop management
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-[-0.05em]">
              Audit log
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing {firstIndex}-{lastIndex} of {totalCount} entries.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">Back to admin</Link>
          </Button>
        </div>

        <section className="overflow-hidden border border-border bg-card text-card-foreground shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 border-collapse text-left text-sm">
              <thead className="bg-muted/50 text-xs tracking-[0.16em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-bold">When</th>
                  <th className="px-4 py-3 font-bold">Actor</th>
                  <th className="px-4 py-3 font-bold">Action</th>
                  <th className="px-4 py-3 font-bold">Shop</th>
                  <th className="px-4 py-3 font-bold">Details</th>
                </tr>
              </thead>
              <tbody>
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <tr key={entry.id} className="border-t border-border">
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatTimestamp(entry.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-semibold">{entry.actor}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex border border-border bg-background px-2.5 py-1 text-xs font-bold">
                          {actionLabels[entry.action] ?? entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {entry.shop ? (
                          <Link
                            href={`/admin/shops/${entry.shopId}/edit`}
                            className="font-semibold text-primary underline-offset-4 hover:underline"
                          >
                            {entry.shop.name}
                          </Link>
                        ) : entry.shopId ? (
                          <span className="text-xs text-muted-foreground">
                            {entry.shopId}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {entry.details ?? "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No audit log entries yet.
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
                  <Link
                    href={
                      boundedCurrentPage === 2
                        ? "/admin/audit-log"
                        : `/admin/audit-log?page=${boundedCurrentPage - 1}`
                    }
                  >
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
                  <Link
                    href={`/admin/audit-log?page=${boundedCurrentPage + 1}`}
                  >
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
