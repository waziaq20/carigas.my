import { expect, test, describe } from "bun:test"

import {
  formatMalaysianPhoneDisplay,
  getMalaysianNationalNumber,
  normalizeMalaysianPhone,
} from "@/lib/phone"

describe("normalizeMalaysianPhone", () => {
  test("normalizes mobile with +60 prefix", () => {
    expect(normalizeMalaysianPhone("+60123456789")).toBe("+60123456789")
  })

  test("normalizes mobile with leading 0", () => {
    expect(normalizeMalaysianPhone("0123456789")).toBe("+60123456789")
  })

  test("normalizes mobile with 60 prefix without +", () => {
    expect(normalizeMalaysianPhone("60123456789")).toBe("+60123456789")
  })

  test("normalizes mobile with spaces and dashes", () => {
    expect(normalizeMalaysianPhone("+60 12-345 6789")).toBe("+60123456789")
  })

  test("normalizes landline number", () => {
    expect(normalizeMalaysianPhone("0312345678")).toBe("+60312345678")
  })

  test("normalizes landline with +60 prefix", () => {
    expect(normalizeMalaysianPhone("+60312345678")).toBe("+60312345678")
  })

  test("returns null for empty string", () => {
    expect(normalizeMalaysianPhone("")).toBeNull()
  })

  test("returns null for non-Malaysian number", () => {
    expect(normalizeMalaysianPhone("+6512345678")).toBeNull()
  })

  test("returns null for alphabetic input", () => {
    expect(normalizeMalaysianPhone("abc")).toBeNull()
  })

  test("returns null for too-short number", () => {
    expect(normalizeMalaysianPhone("+6012")).toBeNull()
  })

  test("returns null for number starting with 0", () => {
    expect(normalizeMalaysianPhone("+60012345678")).toBeNull()
  })
})

describe("formatMalaysianPhoneDisplay", () => {
  test("formats 9-digit mobile for display", () => {
    expect(formatMalaysianPhoneDisplay("+60123456789")).toBe("+60 12-345 6789")
  })

  test("formats 10-digit mobile for display", () => {
    expect(formatMalaysianPhoneDisplay("+601112345678")).toBe(
      "+60 111-2345 678"
    )
  })

  test("formats landline for display", () => {
    expect(formatMalaysianPhoneDisplay("+60312345678")).toBe("+60 3-1234 5678")
  })

  test("returns null for null input", () => {
    expect(formatMalaysianPhoneDisplay(null)).toBeNull()
  })

  test("returns null for undefined input", () => {
    expect(formatMalaysianPhoneDisplay(undefined)).toBeNull()
  })

  test("falls back to input for invalid number", () => {
    expect(formatMalaysianPhoneDisplay("invalid")).toBe("invalid")
  })
})

describe("getMalaysianNationalNumber", () => {
  test("extracts national digits from normalized mobile", () => {
    expect(getMalaysianNationalNumber("+60123456789")).toBe("123456789")
  })

  test("extracts national digits from landline", () => {
    expect(getMalaysianNationalNumber("+60312345678")).toBe("312345678")
  })

  test("returns empty string for null", () => {
    expect(getMalaysianNationalNumber(null)).toBe("")
  })

  test("returns empty string for invalid number", () => {
    expect(getMalaysianNationalNumber("invalid")).toBe("")
  })
})
