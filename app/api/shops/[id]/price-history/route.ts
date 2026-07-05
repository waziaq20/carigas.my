import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params

  try {
    const shop = await prisma.shop.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    })

    if (!shop) {
      return Response.json({ error: "Shop not found" }, { status: 404 })
    }

    const history = await prisma.priceHistory.findMany({
      where: { shopId: id },
      orderBy: { createdAt: "asc" },
      take: 50,
      select: {
        price: true,
        createdAt: true,
      },
    })

    return Response.json({ history })
  } catch (error) {
    console.error("Failed to fetch price history", error)

    return Response.json(
      { error: "Failed to fetch price history" },
      { status: 500 }
    )
  }
}
