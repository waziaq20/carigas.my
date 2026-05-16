import { prisma } from "@/lib/prisma"

import { parseShopCreateInput } from "./validation"

export async function GET() {
  try {
    const shops = await prisma.shop.findMany({
      where: {
        approved: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return Response.json({ shops })
  } catch (error) {
    console.error("Failed to fetch shops", error)

    return Response.json(
      { error: "Failed to fetch shops" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    )
  }

  const result = parseShopCreateInput(body)

  if (!result.ok) {
    return Response.json(
      {
        error: "Invalid shop data",
        issues: result.errors,
      },
      { status: 400 },
    )
  }

  try {
    const shop = await prisma.shop.create({
      data: result.data,
    })

    return Response.json({ shop }, { status: 201 })
  } catch (error) {
    console.error("Failed to create shop", error)

    return Response.json(
      { error: "Failed to create shop" },
      { status: 500 },
    )
  }
}
