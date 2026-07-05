import "server-only"

import { timingSafeEqual } from "node:crypto"

import { prisma } from "@/lib/prisma"
import { getDistanceInKm } from "@/lib/shops"
import type { Coordinates } from "@/types"

const submissionWindowMs = 60 * 60 * 1000
const maxBrowserSubmissions = 1
const maxAgentSubmissions = 100

type SubmissionAttempt = {
  count: number
  resetAt: number
}

const attempts = new Map<string, SubmissionAttempt>()

export function isSubmissionRateLimited(identifier: string, isAgent: boolean) {
  const attempt = attempts.get(identifier)
  const max = isAgent ? maxAgentSubmissions : maxBrowserSubmissions

  if (!attempt) {
    return false
  }

  if (attempt.resetAt <= Date.now()) {
    attempts.delete(identifier)
    return false
  }

  return attempt.count >= max
}

export function recordSubmission(identifier: string) {
  const now = Date.now()
  const attempt = attempts.get(identifier)

  if (!attempt || attempt.resetAt <= now) {
    attempts.set(identifier, {
      count: 1,
      resetAt: now + submissionWindowMs,
    })
    return
  }

  attempt.count += 1
}

export function isValidApiKey(apiKey: string | null): boolean {
  const configuredKey = process.env.SUBMISSION_API_KEY

  if (!configuredKey || !apiKey) {
    return false
  }

  if (configuredKey.length !== apiKey.length) {
    return false
  }

  return timingSafeEqual(Buffer.from(apiKey), Buffer.from(configuredKey))
}

type ShopMatch = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  approved: boolean
  submittedBy: string | null
}

export async function findShopsByName(params: {
  name: string
  coordinates?: Coordinates
  radiusKm?: number
}): Promise<ShopMatch[]> {
  const existing = await prisma.shop.findMany({
    where: {
      name: { equals: params.name, mode: "insensitive" },
      deletedAt: null,
    },
  })

  if (!params.coordinates || params.radiusKm === undefined) {
    return existing.map((shop) => ({
      id: shop.id,
      name: shop.name,
      address: shop.address,
      lat: shop.lat,
      lng: shop.lng,
      approved: shop.approved,
      submittedBy: shop.submittedBy,
    }))
  }

  return existing
    .filter((shop) => {
      const distance = getDistanceInKm(params.coordinates!, {
        lat: shop.lat,
        lng: shop.lng,
      })

      return distance <= params.radiusKm!
    })
    .map((shop) => ({
      id: shop.id,
      name: shop.name,
      address: shop.address,
      lat: shop.lat,
      lng: shop.lng,
      approved: shop.approved,
      submittedBy: shop.submittedBy,
    }))
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  return request.headers.get("x-real-ip") ?? "unknown"
}
