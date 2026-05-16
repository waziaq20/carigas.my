export type Coordinates = {
  lat: number
  lng: number
}

export type ShopRecord = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  exchange: boolean
  sellNew: boolean
  price: number | null
  phone: string | null
}

export type ShopCreateData = {
  name: string
  address: string
  lat: number
  lng: number
  exchange?: boolean
  sellNew?: boolean
  price?: number | null
  phone?: string | null
}

export type ShopUpdateData = Partial<ShopCreateData> & {
  approved?: boolean
}

export type UiShop = {
  id: string
  name: string
  address: string
  distance: string
  price: string | null
  priceValue: number | null
  phone: string | null
  exchange: boolean
  newCylinder: boolean
  lat: number
  lng: number
  top: string
  left: string
}
