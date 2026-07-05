import { requireAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { serializeShopsToCsv } from "@/lib/shop-csv"

function getExportFilename() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, "0")
  const day = String(now.getUTCDate()).padStart(2, "0")
  return `carigas-shops-${year}${month}${day}.csv`
}

export async function GET() {
  await requireAdminSession()

  const shops = await prisma.shop.findMany({
    where: { deletedAt: null },
    orderBy: [{ name: "asc" }],
  })

  const csv = serializeShopsToCsv(shops)

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${getExportFilename()}"`,
      "Cache-Control": "no-store",
    },
  })
}
