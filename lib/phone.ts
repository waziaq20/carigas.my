// Malaysian phone helpers.
//
// Storage format: E.164, e.g. "+60123456789".
// Display format (mobile): "+60 12-345 6789".
// Display format (landline): "+60 3-1234 5678".

const malaysiaCountryCode = "60"
const malaysiaCountryCodePrefix = `+${malaysiaCountryCode}`

function stripPhoneFormatting(input: string): string {
  return input.replace(/[^\d+]/g, "")
}

function getNationalDigits(raw: string): string | null {
  const trimmed = stripPhoneFormatting(raw)
  if (!trimmed) {
    return null
  }

  if (trimmed.startsWith(malaysiaCountryCodePrefix)) {
    return trimmed.slice(malaysiaCountryCodePrefix.length)
  }

  // Reject other international prefixes.
  if (trimmed.startsWith("+")) {
    return null
  }

  if (trimmed.startsWith(malaysiaCountryCode) && trimmed.length >= 10) {
    return trimmed.slice(malaysiaCountryCode.length)
  }

  if (trimmed.startsWith("0")) {
    return trimmed.slice(1)
  }

  return trimmed
}

function isValidMalaysianNational(national: string): boolean {
  // Mobile starts with 1, landline starts with 3-9.
  // National length is 8-10 digits.
  if (!/^[1-9]\d{7,9}$/.test(national)) {
    return false
  }

  return true
}

/**
 * Normalize an input string to Malaysian E.164 format ("+60XXXXXXXXX").
 * Returns null when the input cannot be parsed as a valid Malaysian number.
 */
export function normalizeMalaysianPhone(input: string): string | null {
  if (!input || typeof input !== "string") {
    return null
  }

  const national = getNationalDigits(input)
  if (national === null || national === "") {
    return null
  }

  if (!isValidMalaysianNational(national)) {
    return null
  }

  return `${malaysiaCountryCodePrefix}${national}`
}

/**
 * Format an E.164 (or otherwise normalized) Malaysian phone number for display.
 * Falls back to the original input when it cannot be parsed.
 */
export function formatMalaysianPhoneDisplay(
  phone: string | null | undefined
): string | null {
  if (!phone) {
    return null
  }

  const normalized = normalizeMalaysianPhone(phone)
  if (!normalized) {
    return phone
  }

  const national = normalized.slice(malaysiaCountryCodePrefix.length)
  const first = national.charAt(0)

  // Mobile: leading "1", grouped as 1X-XXX XXXX or 1XX-XXXX XXXX.
  if (first === "1") {
    if (national.length === 9) {
      return `${malaysiaCountryCodePrefix} ${national.slice(0, 2)}-${national.slice(2, 5)} ${national.slice(5)}`
    }
    if (national.length === 10) {
      return `${malaysiaCountryCodePrefix} ${national.slice(0, 3)}-${national.slice(3, 7)} ${national.slice(7)}`
    }
  }

  // Landline: 1-digit area code (3-9), grouped as X-XXXX XXXX.
  if (national.length === 9) {
    return `${malaysiaCountryCodePrefix} ${national.slice(0, 1)}-${national.slice(1, 5)} ${national.slice(5)}`
  }
  if (national.length === 8) {
    return `${malaysiaCountryCodePrefix} ${national.slice(0, 1)}-${national.slice(1, 4)} ${national.slice(4)}`
  }

  return normalized
}

/**
 * Get the national portion of a phone number (without the +60 prefix), useful
 * for pre-filling an input that already shows a static "+60" badge.
 */
export function getMalaysianNationalNumber(
  phone: string | null | undefined
): string {
  if (!phone) {
    return ""
  }

  const normalized = normalizeMalaysianPhone(phone)
  if (!normalized) {
    return ""
  }

  return normalized.slice(malaysiaCountryCodePrefix.length)
}
