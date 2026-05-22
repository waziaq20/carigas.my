"use client"

import L from "leaflet"
import { useEffect, useMemo } from "react"
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet"

export type LatLng = {
  lat: number
  lng: number
}

type ShopLocationPickerMapProps = {
  position: LatLng | null
  onPick: (latlng: LatLng) => void
  recenterTo: LatLng | null
}

const malaysiaCenter: [number, number] = [4.2105, 101.9758]
const malaysiaZoom = 6
const pinnedZoom = 16

function createPinIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="carigas-shop-marker is-selected">
      <span class="carigas-shop-marker__pin" aria-hidden="true">
        <span class="carigas-shop-marker__flame"></span>
      </span>
    </div>`,
    iconSize: [60, 60],
    iconAnchor: [30, 36],
  })
}

function MapClickHandler({ onPick }: { onPick: (latlng: LatLng) => void }) {
  useMapEvents({
    click: (event) => {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
  })

  return null
}

function MapRecenter({ position }: { position: LatLng | null }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], pinnedZoom, {
        animate: true,
        duration: 0.6,
      })
    }
  }, [map, position])

  return null
}

export default function ShopLocationPickerMap({
  position,
  onPick,
  recenterTo,
}: ShopLocationPickerMapProps) {
  const initialCenter = useMemo<[number, number]>(
    () => (position ? [position.lat, position.lng] : malaysiaCenter),
    // Only used on first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const initialZoom = position ? pinnedZoom : malaysiaZoom

  return (
    <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      scrollWheelZoom
      className="carigas-map h-80 w-full bg-muted"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onPick={onPick} />
      <MapRecenter position={recenterTo} />
      {position ? (
        <Marker
          icon={createPinIcon()}
          position={[position.lat, position.lng]}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const next = event.target.getLatLng()
              onPick({ lat: next.lat, lng: next.lng })
            },
          }}
        />
      ) : null}
    </MapContainer>
  )
}
