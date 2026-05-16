"use client"

import L from "leaflet"
import { useEffect } from "react"
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"

import type { UiShop } from "@/lib/shops"

type Coordinates = {
  lat: number
  lng: number
}

type ShopMapProps = {
  myLocationLabel: string
  onSelectShop: (shop: UiShop) => void
  selectedShop: UiShop | null
  shops: UiShop[]
  userLocation: Coordinates | null
}

function getMapCenter(shops: UiShop[]): [number, number] {
  if (shops.length === 0) {
    return [3.0738, 101.5183]
  }

  const totals = shops.reduce(
    (current, shop) => ({
      lat: current.lat + shop.lat,
      lng: current.lng + shop.lng,
    }),
    { lat: 0, lng: 0 },
  )

  return [totals.lat / shops.length, totals.lng / shops.length]
}

function createShopIcon(selected: boolean) {
  return L.divIcon({
    className: "",
    html: `<span class="block size-9 rounded-full border-4 border-background ${
      selected ? "bg-primary" : "bg-foreground"
    } shadow-sm ring-2 ring-background"></span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

function MapCenterUpdater({ userLocation }: { userLocation: Coordinates | null }) {
  const map = useMap()

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 11, {
        animate: true,
      })
    }
  }, [map, userLocation])

  return null
}

export default function ShopMap({
  myLocationLabel,
  onSelectShop,
  selectedShop,
  shops,
  userLocation,
}: ShopMapProps) {
  return (
    <MapContainer
      center={getMapCenter(shops)}
      zoom={9}
      scrollWheelZoom={false}
      className="z-0 h-full min-h-[inherit] w-full bg-muted"
    >
      <MapCenterUpdater userLocation={userLocation} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation ? (
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={8}
          pathOptions={{
            color: "var(--primary)",
            fillColor: "var(--primary)",
            fillOpacity: 0.9,
          }}
        >
          <Popup>{myLocationLabel}</Popup>
        </CircleMarker>
      ) : null}

      {shops.map((shop) => (
        <Marker
          key={shop.id}
          eventHandlers={{
            click: () => onSelectShop(shop),
          }}
          icon={createShopIcon(selectedShop?.id === shop.id)}
          position={[shop.lat, shop.lng]}
        >
          <Popup>
            <div className="space-y-1">
              <p className="font-bold">{shop.name}</p>
              <p>{shop.address}</p>
              {shop.price ? <p>{shop.price}</p> : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
