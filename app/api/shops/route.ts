import {
  getAdminSessionFromRequest,
  requireAdminRequest,
  requireSameOriginRequest,
} from "@/lib/admin-auth"
import { recordAudit } from "@/lib/audit-log"
import { defaultLocale, getDictionary, isLocale } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { mapShopToUiShop, sortShopsByDistance } from "@/lib/shops"
import type { Coordinates } from "@/types"

import { parseShopCreateInput } from "./validation"

function parseLocation(searchParams: URLSearchParams): Coordinates | null {
  const lat = Number(searchParams.get("lat"))
  const lng = Number(searchParams.get("lng"))

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  return { lat, lng }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const localeParam = url.searchParams.get("locale")
  const locale =
    localeParam && isLocale(localeParam) ? localeParam : defaultLocale
  const dictionary = getDictionary(locale)
  const userLocation = parseLocation(url.searchParams)

  try {
    const shops = await prisma.shop.findMany({
      where: {
        approved: true,
        deletedAt: null,
      },
      orderBy: {
        name: "asc",
      },
    })
    const uiShops = shops.map((shop) =>
      mapShopToUiShop(shop, dictionary.distanceUnavailable)
    )
    const sortedShops = userLocation
      ? sortShopsByDistance(uiShops, userLocation)
      : uiShops

    return Response.json({ shops: sortedShops })
  } catch (error) {
    console.error("Failed to fetch shops", error)

    return Response.json({ error: "Failed to fetch shops" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const unauthorized = requireAdminRequest(request)

  if (unauthorized) {
    return unauthorized
  }

  const forbidden = requireSameOriginRequest(request)

  if (forbidden) {
    return forbidden
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    )
  }

  const result = parseShopCreateInput(body)

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
    const shop = await prisma.shop.create({
      data: result.data,
    })

    const session = getAdminSessionFromRequest(request)
    await recordAudit({
      actor: session?.username ?? "unknown",
      action: "create",
      shopId: shop.id,
    })

    return Response.json({ shop }, { status: 201 })
  } catch (error) {
    console.error("Failed to create shop", error)

    return Response.json({ error: "Failed to create shop" }, { status: 500 })
  }
}
