import {
  getAdminSessionFromRequest,
  requireAdminRequest,
  requireSameOriginRequest,
} from "@/lib/admin-auth"
import { recordAudit } from "@/lib/audit-log"
import { prisma } from "@/lib/prisma"
import { snapshotPriceIfChanged } from "@/lib/price-history"

import { parseShopUpdateInput } from "../validation"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params

  try {
    const shop = await prisma.shop.findFirst({
      where: {
        id,
        approved: true,
        deletedAt: null,
      },
    })

    if (!shop) {
      return Response.json({ error: "Shop not found" }, { status: 404 })
    }

    return Response.json({ shop })
  } catch (error) {
    console.error("Failed to fetch shop", error)

    return Response.json({ error: "Failed to fetch shop" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const unauthorized = requireAdminRequest(request)

  if (unauthorized) {
    return unauthorized
  }

  const forbidden = requireSameOriginRequest(request)

  if (forbidden) {
    return forbidden
  }

  const { id } = await params
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    )
  }

  const result = parseShopUpdateInput(body)

  if (!result.ok) {
    return Response.json(
      {
        error: "Invalid shop data",
        issues: result.errors,
      },
      { status: 400 }
    )
  }

  try {
    const existingShop = await prisma.shop.findFirst({
      where: { id, deletedAt: null },
    })

    if (!existingShop) {
      return Response.json({ error: "Shop not found" }, { status: 404 })
    }

    await snapshotPriceIfChanged(
      id,
      existingShop.price,
      result.data.price ?? null
    )

    const shop = await prisma.shop.update({
      where: { id },
      data: result.data,
    })

    const session = getAdminSessionFromRequest(request)
    await recordAudit({
      actor: session?.username ?? "unknown",
      action: "update",
      shopId: id,
    })

    return Response.json({ shop })
  } catch (error) {
    console.error("Failed to update shop", error)

    return Response.json({ error: "Failed to update shop" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const unauthorized = requireAdminRequest(request)

  if (unauthorized) {
    return unauthorized
  }

  const forbidden = requireSameOriginRequest(request)

  if (forbidden) {
    return forbidden
  }

  const { id } = await params

  try {
    const existingShop = await prisma.shop.findFirst({
      where: { id, deletedAt: null },
    })

    if (!existingShop) {
      return Response.json({ error: "Shop not found" }, { status: 404 })
    }

    await prisma.shop.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    const session = getAdminSessionFromRequest(request)
    await recordAudit({
      actor: session?.username ?? "unknown",
      action: "delete",
      shopId: id,
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("Failed to delete shop", error)

    return Response.json({ error: "Failed to delete shop" }, { status: 500 })
  }
}
