"use client"

import dynamic from "next/dynamic"
import { useState } from "react"

import type { LatLng } from "@/components/admin/shop-location-picker-map"
import { Button } from "@/components/ui/button"

type ShopLocationPickerProps = {
  defaultLat?: number
  defaultLng?: number
}

const inputClassName =
  "h-10 border border-border bg-background px-3 text-sm font-normal outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"

const ShopLocationPickerMap = dynamic(
  () => import("@/components/admin/shop-location-picker-map"),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-80 w-full place-items-center bg-muted">
        <div className="h-3 w-36 animate-pulse bg-muted-foreground/30" />
      </div>
    ),
  }
)

function formatCoord(value: number) {
  return Number.isFinite(value) ? value.toFixed(6) : ""
}

export function ShopLocationPicker({
  defaultLat,
  defaultLng,
}: ShopLocationPickerProps) {
  const initial =
    typeof defaultLat === "number" &&
    typeof defaultLng === "number" &&
    Number.isFinite(defaultLat) &&
    Number.isFinite(defaultLng)
      ? { lat: defaultLat, lng: defaultLng }
      : null

  const [position, setPosition] = useState<LatLng | null>(initial)
  const [recenterTo, setRecenterTo] = useState<LatLng | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const handlePick = (next: LatLng) => {
    setPosition(next)
    setLocationError(null)
  }

  const handleLocate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not available in this browser.")
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (result) => {
        const next = {
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        }
        setPosition(next)
        setRecenterTo(next)
        setIsLocating(false)
      },
      (error) => {
        setLocationError(error.message || "Unable to fetch your location.")
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleManualChange = (key: "lat" | "lng", raw: string) => {
    const parsed = Number(raw)

    if (!raw) {
      setPosition((current) =>
        current ? { ...current, [key]: Number.NaN } : current
      )
      return
    }

    if (!Number.isFinite(parsed)) {
      return
    }

    setPosition((current) => {
      const base = current ?? { lat: 0, lng: 0 }
      return { ...base, [key]: parsed }
    })
  }

  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Pin location on the map</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click anywhere on the map to drop a pin, or drag the marker to
            fine-tune. The lat/lng fields below update automatically.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLocate}
          disabled={isLocating}
        >
          {isLocating ? "Locating..." : "Use my location"}
        </Button>
      </div>

      <div className="overflow-hidden border border-border">
        <ShopLocationPickerMap
          position={position}
          onPick={handlePick}
          recenterTo={recenterTo}
        />
      </div>

      {locationError ? (
        <p className="border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {locationError}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Latitude
          <input
            className={inputClassName}
            name="lat"
            type="number"
            step="any"
            required
            value={position ? formatCoord(position.lat) : ""}
            onChange={(event) => handleManualChange("lat", event.target.value)}
            placeholder="3.073800"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Longitude
          <input
            className={inputClassName}
            name="lng"
            type="number"
            step="any"
            required
            value={position ? formatCoord(position.lng) : ""}
            onChange={(event) => handleManualChange("lng", event.target.value)}
            placeholder="101.518300"
          />
        </label>
      </div>
    </div>
  )
}
