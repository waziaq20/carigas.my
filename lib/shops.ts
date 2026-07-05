import type { Coordinates, ShopRecord, UiShop } from "@/types"

const mapBounds = {
  minLat: 2.9,
  maxLat: 3.4,
  minLng: 101.2,
  maxLng: 101.75,
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function formatShopPrice(price: number | null) {
  if (price === null) {
    return null
  }

  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
  }).format(price / 100)
}

export function mapShopToUiShop(
  shop: ShopRecord,
  distanceLabel: string
): UiShop {
  const left =
    ((shop.lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) *
      70 +
    15
  const top =
    ((mapBounds.maxLat - shop.lat) / (mapBounds.maxLat - mapBounds.minLat)) *
      70 +
    15

  return {
    id: shop.id,
    name: shop.name,
    address: shop.address,
    distance: distanceLabel,
    price: formatShopPrice(shop.price),
    priceValue: shop.price,
    phone: shop.phone,
    exchange: shop.exchange,
    newCylinder: shop.sellNew,
    lat: shop.lat,
    lng: shop.lng,
    top: `${clamp(top, 12, 88).toFixed(1)}%`,
    left: `${clamp(left, 12, 88).toFixed(1)}%`,
    openHours: shop.openHours,
  }
}

export function getLowestShopPrice(shops: UiShop[]) {
  const prices = shops
    .map((shop) => shop.priceValue)
    .filter((price): price is number => price !== null)

  if (prices.length === 0) {
    return null
  }

  return formatShopPrice(Math.min(...prices))
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

export function getDistanceInKm(from: Coordinates, to: Coordinates) {
  const earthRadiusInKm = 6371
  const latDelta = toRadians(to.lat - from.lat)
  const lngDelta = toRadians(to.lng - from.lng)
  const fromLat = toRadians(from.lat)
  const toLat = toRadians(to.lat)

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(fromLat) *
      Math.cos(toLat) *
      Math.sin(lngDelta / 2) *
      Math.sin(lngDelta / 2)

  return earthRadiusInKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(distanceInKm: number) {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`
  }

  return `${distanceInKm.toFixed(1)} km`
}

export function sortShopsByDistance(
  shops: UiShop[],
  userLocation: Coordinates
) {
  return shops
    .map((shop) => {
      const distanceInKm = getDistanceInKm(userLocation, shop)

      return {
        ...shop,
        distance: formatDistance(distanceInKm),
      }
    })
    .sort(
      (firstShop, secondShop) =>
        getDistanceInKm(userLocation, firstShop) -
        getDistanceInKm(userLocation, secondShop)
    )
}
