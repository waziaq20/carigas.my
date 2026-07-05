import "server-only"

import { prisma } from "@/lib/prisma"
import { getDistanceInKm } from "@/lib/shops"
import type { Coordinates } from "@/types"

export type DuplicateShop = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  approved: boolean
  updatedAt: Date
}

export type DuplicateGroup = {
  shops: DuplicateShop[]
  maxDistanceKm: number
}

export async function findDuplicateShops(
  radiusKm = 0.2
): Promise<DuplicateGroup[]> {
  const shops = await prisma.shop.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      address: true,
      lat: true,
      lng: true,
      approved: true,
      updatedAt: true,
    },
    orderBy: { name: "asc" },
  })

  const assigned = new Set<string>()
  const groups: DuplicateGroup[] = []

  for (let i = 0; i < shops.length; i++) {
    if (assigned.has(shops[i].id)) {
      continue
    }

    const group: DuplicateShop[] = [shops[i]]
    let maxDist = 0

    for (let j = i + 1; j < shops.length; j++) {
      if (assigned.has(shops[j].id)) {
        continue
      }

      const isNear = group.some((shop) => {
        const dist = getDistanceInKm(
          { lat: shop.lat, lng: shop.lng } satisfies Coordinates,
          { lat: shops[j].lat, lng: shops[j].lng } satisfies Coordinates
        )

        if (dist <= radiusKm) {
          maxDist = Math.max(maxDist, dist)
          return true
        }

        return false
      })

      if (isNear) {
        group.push(shops[j])
        assigned.add(shops[j].id)
      }
    }

    assigned.add(shops[i].id)

    if (group.length > 1) {
      groups.push({ shops: group, maxDistanceKm: maxDist })
    }
  }

  return groups
}
