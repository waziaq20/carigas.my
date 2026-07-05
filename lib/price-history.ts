import "server-only"

import { prisma } from "@/lib/prisma"

export async function snapshotPriceIfChanged(
  shopId: string,
  oldPrice: number | null,
  newPrice: number | null
) {
  if (oldPrice === null || oldPrice === newPrice) {
    return
  }

  await prisma.priceHistory.create({
    data: {
      shopId,
      price: oldPrice,
    },
  })
}
