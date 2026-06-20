import { normalizeMalaysianPhone } from "@/lib/phone"
import type { ShopCreateData } from "@/types"

export type ShopCsvRow = ShopCreateData & {
  approved: boolean
}

export type ParsedShopRow = {
  lineNumber: number
  data: ShopCsvRow
}

export type ParseShopRowError = {
  lineNumber: number
  message: string
}

export type ParseShopsResult = {
  rows: ParsedShopRow[]
  errors: ParseShopRowError[]
}

export const shopCsvHeaders = [
  "name",
  "address",
  "lat",
  "lng",
  "exchange",
  "sellNew",
  "price",
  "phone",
  "approved",
] as const

type ShopCsvHeader = (typeof shopCsvHeaders)[number]

function escapeCsvValue(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatPriceRm(price: number | null): string {
  if (price === null) {
    return ""
  }
  return (price / 100).toFixed(2)
}

type ExportableShop = {
  name: string
  address: string
  lat: number
  lng: number
  exchange: boolean
  sellNew: boolean
  price: number | null
  phone: string | null
  approved: boolean
}

export function serializeShopsToCsv(shops: ExportableShop[]): string {
  const lines: string[] = [shopCsvHeaders.join(",")]

  for (const shop of shops) {
    const row: Record<ShopCsvHeader, string> = {
      name: shop.name,
      address: shop.address,
      lat: String(shop.lat),
      lng: String(shop.lng),
      exchange: shop.exchange ? "true" : "false",
      sellNew: shop.sellNew ? "true" : "false",
      price: formatPriceRm(shop.price),
      phone: shop.phone ?? "",
      approved: shop.approved ? "true" : "false",
    }

    lines.push(
      shopCsvHeaders.map((header) => escapeCsvValue(row[header])).join(",")
    )
  }

  return `${lines.join("\r\n")}\r\n`
}

function tokenizeCsv(text: string): string[][] {
  const rows: string[][] = []
  let current: string[] = []
  let field = ""
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"'
          index += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    if (char === ",") {
      current.push(field)
      field = ""
      continue
    }

    if (char === "\r") {
      continue
    }

    if (char === "\n") {
      current.push(field)
      rows.push(current)
      current = []
      field = ""
      continue
    }

    field += char
  }

  if (field.length > 0 || current.length > 0) {
    current.push(field)
    rows.push(current)
  }

  return rows.filter((row) => !(row.length === 1 && row[0].trim() === ""))
}

function parseBoolean(value: string): boolean | null {
  const normalized = value.trim().toLowerCase()
  if (["true", "yes", "y", "1"].includes(normalized)) {
    return true
  }
  if (["false", "no", "n", "0", ""].includes(normalized)) {
    return false
  }
  return null
}

function parseRequiredNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) {
    return null
  }
  return parsed
}

function parsePriceRmToSen(value: string): number | null | "invalid" {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  const parsed = Number(trimmed.replace(/,/g, ""))
  if (!Number.isFinite(parsed) || parsed < 0) {
    return "invalid"
  }
  return Math.round(parsed * 100)
}

export function parseShopsFromCsv(text: string): ParseShopsResult {
  const rows = tokenizeCsv(text.replace(/^\uFEFF/, ""))
  const errors: ParseShopRowError[] = []
  const parsed: ParsedShopRow[] = []

  if (rows.length === 0) {
    return {
      rows: parsed,
      errors: [{ lineNumber: 0, message: "CSV is empty" }],
    }
  }

  const header = rows[0].map((value) => value.trim())
  const headerIndex = new Map<string, number>()
  for (let columnIndex = 0; columnIndex < header.length; columnIndex += 1) {
    headerIndex.set(header[columnIndex], columnIndex)
  }

  const requiredHeaders: ShopCsvHeader[] = ["name", "address", "lat", "lng"]
  for (const required of requiredHeaders) {
    if (!headerIndex.has(required)) {
      errors.push({
        lineNumber: 1,
        message: `Missing required column: ${required}`,
      })
    }
  }

  if (errors.length > 0) {
    return { rows: parsed, errors }
  }

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const lineNumber = rowIndex + 1
    const row = rows[rowIndex]
    const get = (key: ShopCsvHeader) => {
      const columnIndex = headerIndex.get(key)
      if (columnIndex === undefined || columnIndex >= row.length) {
        return ""
      }
      return row[columnIndex] ?? ""
    }

    const name = get("name").trim()
    const address = get("address").trim()
    if (!name) {
      errors.push({ lineNumber, message: "name is required" })
      continue
    }
    if (!address) {
      errors.push({ lineNumber, message: "address is required" })
      continue
    }

    const lat = parseRequiredNumber(get("lat"))
    const lng = parseRequiredNumber(get("lng"))
    if (lat === null) {
      errors.push({ lineNumber, message: "lat must be a number" })
      continue
    }
    if (lng === null) {
      errors.push({ lineNumber, message: "lng must be a number" })
      continue
    }

    const exchangeRaw = get("exchange")
    const sellNewRaw = get("sellNew")
    const approvedRaw = get("approved")
    const exchange = exchangeRaw === "" ? true : parseBoolean(exchangeRaw)
    const sellNew = sellNewRaw === "" ? false : parseBoolean(sellNewRaw)
    const approved = approvedRaw === "" ? false : parseBoolean(approvedRaw)
    if (exchange === null) {
      errors.push({ lineNumber, message: "exchange must be true or false" })
      continue
    }
    if (sellNew === null) {
      errors.push({ lineNumber, message: "sellNew must be true or false" })
      continue
    }
    if (approved === null) {
      errors.push({ lineNumber, message: "approved must be true or false" })
      continue
    }

    const priceResult = parsePriceRmToSen(get("price"))
    if (priceResult === "invalid") {
      errors.push({
        lineNumber,
        message: "price must be a non-negative number",
      })
      continue
    }

    const phoneRaw = get("phone").trim()
    let phone: string | null = null
    if (phoneRaw) {
      const normalized = normalizeMalaysianPhone(phoneRaw)
      if (!normalized) {
        errors.push({
          lineNumber,
          message: "phone must be a valid Malaysian number",
        })
        continue
      }
      phone = normalized
    }

    parsed.push({
      lineNumber,
      data: {
        name,
        address,
        lat,
        lng,
        exchange,
        sellNew,
        price: priceResult,
        phone,
        approved,
      },
    })
  }

  return { rows: parsed, errors }
}
