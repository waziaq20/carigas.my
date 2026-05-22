import Link from "next/link"

import { importShops } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { requireAdminSession } from "@/lib/admin-auth"
import { shopCsvHeaders } from "@/lib/shop-csv"

type ImportShopsPageProps = {
  searchParams: Promise<{
    created?: string
    skipped?: string
    errors?: string
    error?: string
  }>
}

function parseCount(value: string | undefined) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null
}

export default async function ImportShopsPage({
  searchParams,
}: ImportShopsPageProps) {
  await requireAdminSession()

  const params = await searchParams
  const created = parseCount(params.created)
  const skipped = parseCount(params.skipped)
  const errors = params.errors ?? null
  const fileError =
    params.error === "missing-file" ? "Please choose a CSV file." : null

  return (
    <main className="min-h-svh bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Bulk shop management
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-[-0.05em]">
              Import / export shops
            </h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">Back to admin</Link>
          </Button>
        </div>

        <section className="border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6">
          <h2 className="text-lg font-black tracking-[-0.04em]">
            Export all shops
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Download every shop record as a CSV file, including pending and
            approved entries.
          </p>
          <div className="mt-4">
            <Button asChild>
              <a href="/api/admin/shops/export" download>
                Download CSV
              </a>
            </Button>
          </div>
        </section>

        <section className="border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6">
          <h2 className="text-lg font-black tracking-[-0.04em]">
            Import shops from CSV
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a CSV with the columns below. Phone numbers are normalized
            to international format. Each row becomes a new shop record.
          </p>

          <div className="mt-4 overflow-x-auto border border-border bg-background p-3">
            <code className="text-xs whitespace-pre">
              {shopCsvHeaders.join(",")}
            </code>
          </div>

          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">name</span>,{" "}
              <span className="font-semibold text-foreground">address</span>,{" "}
              <span className="font-semibold text-foreground">lat</span>,{" "}
              <span className="font-semibold text-foreground">lng</span> are
              required.
            </li>
            <li>
              <span className="font-semibold text-foreground">price</span> is
              the 14kg price in RM (decimals allowed). Leave blank for unknown.
            </li>
            <li>
              <span className="font-semibold text-foreground">phone</span>{" "}
              accepts any Malaysian format and is stored as +60XXXXXXXXX.
            </li>
            <li>
              <span className="font-semibold text-foreground">exchange</span>,{" "}
              <span className="font-semibold text-foreground">sellNew</span>,{" "}
              <span className="font-semibold text-foreground">approved</span>{" "}
              accept true / false.
            </li>
          </ul>

          <form
            action={importShops}
            encType="multipart/form-data"
            className="mt-5 flex flex-col gap-3 border-t border-border pt-5"
          >
            <label className="flex flex-col gap-2 text-sm font-semibold">
              CSV file
              <input
                type="file"
                name="file"
                accept=".csv,text/csv"
                required
                className="border border-border bg-background p-2 text-sm font-normal file:mr-3 file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-xs file:font-bold file:tracking-widest file:uppercase"
              />
            </label>

            {fileError ? (
              <p className="border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {fileError}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button>Upload and import</Button>
            </div>
          </form>

          {created !== null && skipped !== null ? (
            <div className="mt-5 border border-border bg-background p-4 text-sm">
              <p className="font-bold tracking-tight">Last import result</p>
              <p className="mt-1 text-muted-foreground">
                Created {created} shop{created === 1 ? "" : "s"}, skipped{" "}
                {skipped} row{skipped === 1 ? "" : "s"}.
              </p>
              {errors ? (
                <p className="mt-2 text-xs leading-5 text-destructive">
                  {errors}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}
