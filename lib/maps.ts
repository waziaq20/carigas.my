import type { Coordinates } from "@/types"

export function getGoogleMapsDirectionsUrl({ lat, lng }: Coordinates) {
  const searchParams = new URLSearchParams({
    api: "1",
    destination: `${lat},${lng}`,
    travelmode: "driving",
  })

  return `https://www.google.com/maps/dir/?${searchParams.toString()}`
}
