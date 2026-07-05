import { normalizeMalaysianPhone } from "@/lib/phone"
import type { ShopCreateData, ShopUpdateData } from "@/types"

type JsonObject = Record<string, unknown>

type ValidationResult<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      errors: string[]
    }

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readRequiredString(
  body: JsonObject,
  field: "name" | "address",
  errors: string[]
) {
  const value = body[field]

  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${field} is required`)
    return ""
  }

  return value.trim()
}

function readRequiredNumber(
  body: JsonObject,
  field: "lat" | "lng",
  errors: string[]
) {
  const value = body[field]

  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push(`${field} must be a valid number`)
    return 0
  }

  return value
}

function assignOptionalFields(
  body: JsonObject,
  data: ShopCreateData | ShopUpdateData,
  errors: string[]
) {
  if ("exchange" in body) {
    if (typeof body.exchange === "boolean") {
      data.exchange = body.exchange
    } else {
      errors.push("exchange must be a boolean")
    }
  }

  if ("sellNew" in body) {
    if (typeof body.sellNew === "boolean") {
      data.sellNew = body.sellNew
    } else {
      errors.push("sellNew must be a boolean")
    }
  }

  if ("price" in body) {
    if (body.price === null) {
      data.price = null
    } else if (
      typeof body.price === "number" &&
      Number.isInteger(body.price) &&
      body.price >= 0
    ) {
      data.price = body.price
    } else {
      errors.push("price must be a non-negative integer or null")
    }
  }

  if ("phone" in body) {
    if (body.phone === null) {
      data.phone = null
    } else if (typeof body.phone === "string") {
      const trimmed = body.phone.trim()

      if (trimmed === "") {
        data.phone = null
      } else {
        const normalized = normalizeMalaysianPhone(trimmed)

        if (!normalized) {
          errors.push("phone must be a valid Malaysian number")
        } else {
          data.phone = normalized
        }
      }
    } else {
      errors.push("phone must be a string or null")
    }
  }

  if ("submittedBy" in body) {
    if (body.submittedBy === null) {
      data.submittedBy = null
    } else if (typeof body.submittedBy === "string") {
      const trimmed = body.submittedBy.trim()

      data.submittedBy = trimmed === "" ? null : trimmed
    } else {
      errors.push("submittedBy must be a string or null")
    }
  }

  if ("openHours" in body) {
    if (body.openHours === null) {
      data.openHours = null
    } else if (typeof body.openHours === "string") {
      const trimmed = body.openHours.trim()

      data.openHours = trimmed === "" ? null : trimmed
    } else {
      errors.push("openHours must be a string or null")
    }
  }
}

export function parseShopCreateInput(
  body: unknown
): ValidationResult<ShopCreateData> {
  if (!isJsonObject(body)) {
    return {
      ok: false,
      errors: ["Request body must be a JSON object"],
    }
  }

  const errors: string[] = []
  const data: ShopCreateData = {
    name: readRequiredString(body, "name", errors),
    address: readRequiredString(body, "address", errors),
    lat: readRequiredNumber(body, "lat", errors),
    lng: readRequiredNumber(body, "lng", errors),
  }

  assignOptionalFields(body, data, errors)

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return { ok: true, data }
}

export function parseShopUpdateInput(
  body: unknown
): ValidationResult<ShopUpdateData> {
  if (!isJsonObject(body)) {
    return {
      ok: false,
      errors: ["Request body must be a JSON object"],
    }
  }

  const errors: string[] = []
  const data: ShopUpdateData = {}

  if ("name" in body) {
    if (typeof body.name === "string" && body.name.trim() !== "") {
      data.name = body.name.trim()
    } else {
      errors.push("name must be a non-empty string")
    }
  }

  if ("address" in body) {
    if (typeof body.address === "string" && body.address.trim() !== "") {
      data.address = body.address.trim()
    } else {
      errors.push("address must be a non-empty string")
    }
  }

  if ("lat" in body) {
    if (typeof body.lat === "number" && Number.isFinite(body.lat)) {
      data.lat = body.lat
    } else {
      errors.push("lat must be a valid number")
    }
  }

  if ("lng" in body) {
    if (typeof body.lng === "number" && Number.isFinite(body.lng)) {
      data.lng = body.lng
    } else {
      errors.push("lng must be a valid number")
    }
  }

  if ("approved" in body) {
    if (typeof body.approved === "boolean") {
      data.approved = body.approved
    } else {
      errors.push("approved must be a boolean")
    }
  }

  assignOptionalFields(body, data, errors)

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  if (Object.keys(data).length === 0) {
    return {
      ok: false,
      errors: ["At least one field is required"],
    }
  }

  return { ok: true, data }
}
