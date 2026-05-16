"use client"

import L from "leaflet"
import { useEffect } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"

import type { Coordinates, UiShop } from "@/types"

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
    { lat: 0, lng: 0 }
  )

  return [totals.lat / shops.length, totals.lng / shops.length]
}

function createCapabilityIcon(active: boolean, path: string) {
  return `<span class="carigas-shop-marker__capability ${
    active ? "is-active" : ""
  }" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="${path}" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg></span>`
}

function createShopIcon(shop: UiShop, selected: boolean) {
  const selectedClass = selected ? " is-selected" : ""
  const priceBadge = shop.price
    ? `<span class="carigas-shop-marker__price">${shop.price}</span>`
    : ""

  return L.divIcon({
    className: "",
    html: `<div class="carigas-shop-marker${selectedClass}">
      ${priceBadge}
      <span class="carigas-shop-marker__pin" aria-hidden="true">
        <span class="carigas-shop-marker__flame"></span>
      </span>
      <span class="carigas-shop-marker__capabilities">
        ${createCapabilityIcon(
          shop.exchange,
          "M7 7h9.5a3.5 3.5 0 0 1 0 7H6m0 0 3-3m-3 3 3 3M17 17H7.5a3.5 3.5 0 0 1 0-7H18m0 0-3-3m3 3-3 3"
        )}
        ${createCapabilityIcon(
          shop.newCylinder,
          "M9 5h6M10 5V3h4v2M7 10c0-2.2 1.8-4 4-4h2c2.2 0 4 1.8 4 4v7a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4v-7ZM9.5 13h5"
        )}
      </span>
    </div>`,
    iconSize: [76, 70],
    iconAnchor: [38, 42],
    popupAnchor: [0, -42],
  })
}

function createUserLocationIcon() {
  return L.divIcon({
    className: "",
    html: `<span class="carigas-user-marker" aria-hidden="true"><span></span></span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
  })
}

function MapCenterUpdater({
  userLocation,
}: {
  userLocation: Coordinates | null
}) {
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
      scrollWheelZoom
      touchZoom
      doubleClickZoom
      keyboard
      className="carigas-map z-0 h-full min-h-[inherit] w-full bg-muted"
    >
      <MapCenterUpdater userLocation={userLocation} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation ? (
        <Marker
          icon={createUserLocationIcon()}
          position={[userLocation.lat, userLocation.lng]}
          title={myLocationLabel}
        >
          <Popup>{myLocationLabel}</Popup>
        </Marker>
      ) : null}

      {shops.map((shop) => (
        <Marker
          key={shop.id}
          eventHandlers={{
            click: () => onSelectShop(shop),
          }}
          icon={createShopIcon(shop, selectedShop?.id === shop.id)}
          position={[shop.lat, shop.lng]}
          title={shop.name}
        />
      ))}
    </MapContainer>
  )
}
