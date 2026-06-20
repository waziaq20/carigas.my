import { parseShopCreateInput } from "@/app/api/shops/validation"
import { prisma } from "@/lib/prisma"
import {
  findShopsByName,
  getClientIp,
  isSubmissionRateLimited,
  isValidApiKey,
  recordSubmission,
} from "@/lib/shop-submission"
import type { Coordinates } from "@/types"

const dedupRadiusKm = 0.5

type ShopSummary = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  approved: boolean
  submittedBy: string | null
}

function toShopSummary(shop: {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  approved: boolean
  submittedBy: string | null
}): ShopSummary {
  return {
    id: shop.id,
    name: shop.name,
    address: shop.address,
    lat: shop.lat,
    lng: shop.lng,
    approved: shop.approved,
    submittedBy: shop.submittedBy,
  }
}

export async function GET(request: Request) {
  const apiKey = request.headers.get("x-api-key")

  if (!isValidApiKey(apiKey)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const name = url.searchParams.get("name")
  const latParam = url.searchParams.get("lat")
  const lngParam = url.searchParams.get("lng")
  const lat = latParam !== null ? Number(latParam) : NaN
  const lng = lngParam !== null ? Number(lngParam) : NaN
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)

  if (!name) {
    return Response.json(
      { error: "name query parameter is required" },
      { status: 400 }
    )
  }

  const coordinates: Coordinates | undefined = hasCoords
    ? { lat, lng }
    : undefined

  try {
    const matches = await findShopsByName({
      name,
      coordinates,
      radiusKm: coordinates ? dedupRadiusKm : undefined,
    })

    return Response.json({
      exists: matches.length > 0,
      matches,
    })
  } catch (error) {
    console.error("Failed to check shop", error)

    return Response.json({ error: "Failed to check shop" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key")
  const isAgent = isValidApiKey(apiKey)
  const identifier = isAgent ? "agent" : getClientIp(request)

  if (isSubmissionRateLimited(identifier, isAgent)) {
    return Response.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    )
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
      { error: "Invalid shop data", issues: result.errors },
      { status: 400 }
    )
  }

  const coordinates: Coordinates = {
    lat: result.data.lat,
    lng: result.data.lng,
  }

  try {
    const duplicates = await findShopsByName({
      name: result.data.name,
      coordinates,
      radiusKm: dedupRadiusKm,
    })

    if (duplicates.length > 0) {
      return Response.json(
        {
          error: "A shop with this name already exists within 500m",
          matches: duplicates.map(toShopSummary),
        },
        { status: 409 }
      )
    }

    const submittedBy =
      result.data.submittedBy ?? (isAgent ? "hermes-agent" : null)

    const shop = await prisma.shop.create({
      data: {
        ...result.data,
        approved: false,
        submittedBy,
      },
    })

    recordSubmission(identifier)

    return Response.json({ shop: toShopSummary(shop) }, { status: 201 })
  } catch (error) {
    console.error("Failed to create shop", error)

    return Response.json({ error: "Failed to create shop" }, { status: 500 })
  }
}
