import { expect, test, describe } from "bun:test"

import { parseShopCreateInput } from "@/app/api/shops/validation"

const validInput = {
  name: "Kedai Gas Test",
  address: "Jalan Test 123, Kuala Lumpur",
  lat: 3.139,
  lng: 101.6869,
}

describe("parseShopCreateInput — required fields", () => {
  test("accepts valid input with only required fields", () => {
    const result = parseShopCreateInput(validInput)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.name).toBe("Kedai Gas Test")
      expect(result.data.address).toBe("Jalan Test 123, Kuala Lumpur")
      expect(result.data.lat).toBe(3.139)
      expect(result.data.lng).toBe(101.6869)
    }
  })

  test("rejects missing name", () => {
    const result = parseShopCreateInput({
      ...validInput,
      name: undefined,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain("name is required")
    }
  })

  test("rejects empty name", () => {
    const result = parseShopCreateInput({
      ...validInput,
      name: "  ",
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain("name is required")
    }
  })

  test("rejects missing address", () => {
    const result = parseShopCreateInput({
      ...validInput,
      address: undefined,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain("address is required")
    }
  })

  test("rejects missing lat", () => {
    const result = parseShopCreateInput({
      ...validInput,
      lat: undefined,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain("lat must be a valid number")
    }
  })

  test("rejects missing lng", () => {
    const result = parseShopCreateInput({
      ...validInput,
      lng: undefined,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain("lng must be a valid number")
    }
  })

  test("rejects non-finite lat (NaN)", () => {
    const result = parseShopCreateInput({
      ...validInput,
      lat: NaN,
    })

    expect(result.ok).toBe(false)
  })

  test("rejects non-finite lng (Infinity)", () => {
    const result = parseShopCreateInput({
      ...validInput,
      lng: Infinity,
    })

    expect(result.ok).toBe(false)
  })
})

describe("parseShopCreateInput — optional fields", () => {
  test("accepts exchange boolean", () => {
    const result = parseShopCreateInput({
      ...validInput,
      exchange: false,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.exchange).toBe(false)
    }
  })

  test("rejects non-boolean exchange", () => {
    const result = parseShopCreateInput({
      ...validInput,
      exchange: "yes",
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain("exchange must be a boolean")
    }
  })

  test("accepts sellNew boolean", () => {
    const result = parseShopCreateInput({
      ...validInput,
      sellNew: true,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.sellNew).toBe(true)
    }
  })

  test("accepts valid price as integer sen", () => {
    const result = parseShopCreateInput({
      ...validInput,
      price: 2660,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.price).toBe(2660)
    }
  })

  test("accepts null price", () => {
    const result = parseShopCreateInput({
      ...validInput,
      price: null,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.price).toBeNull()
    }
  })

  test("rejects negative price", () => {
    const result = parseShopCreateInput({
      ...validInput,
      price: -100,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain(
        "price must be a non-negative integer or null"
      )
    }
  })

  test("rejects non-integer price", () => {
    const result = parseShopCreateInput({
      ...validInput,
      price: 26.6,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain(
        "price must be a non-negative integer or null"
      )
    }
  })

  test("accepts valid Malaysian phone", () => {
    const result = parseShopCreateInput({
      ...validInput,
      phone: "0123456789",
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.phone).toBe("+60123456789")
    }
  })

  test("accepts null phone", () => {
    const result = parseShopCreateInput({
      ...validInput,
      phone: null,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.phone).toBeNull()
    }
  })

  test("accepts empty phone as null", () => {
    const result = parseShopCreateInput({
      ...validInput,
      phone: "  ",
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.phone).toBeNull()
    }
  })

  test("rejects invalid phone", () => {
    const result = parseShopCreateInput({
      ...validInput,
      phone: "+6512345678",
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain("phone must be a valid Malaysian number")
    }
  })
})

describe("parseShopCreateInput — submittedBy field", () => {
  test("accepts valid submittedBy string", () => {
    const result = parseShopCreateInput({
      ...validInput,
      submittedBy: "hermes-agent",
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.submittedBy).toBe("hermes-agent")
    }
  })

  test("accepts null submittedBy", () => {
    const result = parseShopCreateInput({
      ...validInput,
      submittedBy: null,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.submittedBy).toBeNull()
    }
  })

  test("trims whitespace in submittedBy", () => {
    const result = parseShopCreateInput({
      ...validInput,
      submittedBy: "  hermes-agent  ",
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.submittedBy).toBe("hermes-agent")
    }
  })

  test("treats empty submittedBy as null", () => {
    const result = parseShopCreateInput({
      ...validInput,
      submittedBy: "   ",
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.submittedBy).toBeNull()
    }
  })

  test("rejects non-string submittedBy", () => {
    const result = parseShopCreateInput({
      ...validInput,
      submittedBy: 123,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain("submittedBy must be a string or null")
    }
  })

  test("accepts email-style submittedBy", () => {
    const result = parseShopCreateInput({
      ...validInput,
      submittedBy: "user@example.com",
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.submittedBy).toBe("user@example.com")
    }
  })
})

describe("parseShopCreateInput — invalid body types", () => {
  test("rejects null body", () => {
    const result = parseShopCreateInput(null)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain("Request body must be a JSON object")
    }
  })

  test("rejects array body", () => {
    const result = parseShopCreateInput([validInput])

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain("Request body must be a JSON object")
    }
  })

  test("rejects string body", () => {
    const result = parseShopCreateInput("not an object")

    expect(result.ok).toBe(false)
  })
})
