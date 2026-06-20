import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"

const mockShopCreate = mock()

mock.module("@/lib/prisma", () => ({
  prisma: {
    shop: {
      create: mockShopCreate,
      findMany: mock(() => Promise.resolve([])),
    },
  },
}))

mock.module("@/lib/shop-submission", () => ({
  findShopsByName: mock(() => Promise.resolve([])),
  isSubmissionRateLimited: mock(() => false),
  isValidApiKey: mock(() => false),
  recordSubmission: mock(),
  getClientIp: mock(() => "127.0.0.1"),
}))

const { GET, POST } = await import("@/app/api/shops/submit/route")
const {
  isValidApiKey,
  findShopsByName,
  isSubmissionRateLimited,
  recordSubmission,
} = await import("@/lib/shop-submission")

const validBody = {
  name: "Kedai Gas Test",
  address: "Jalan Test 123, Kuala Lumpur",
  lat: 3.139,
  lng: 101.6869,
}

const createdShop = {
  id: "shop-1",
  name: "Kedai Gas Test",
  address: "Jalan Test 123, Kuala Lumpur",
  lat: 3.139,
  lng: 101.6869,
  exchange: true,
  sellNew: false,
  price: null,
  phone: null,
  approved: false,
  submittedBy: null,
}

beforeEach(() => {
  mockShopCreate.mockClear()
  ;(findShopsByName as ReturnType<typeof mock>).mockClear()
  ;(findShopsByName as ReturnType<typeof mock>).mockResolvedValue([])
  ;(isValidApiKey as ReturnType<typeof mock>).mockClear()
  ;(isValidApiKey as ReturnType<typeof mock>).mockReturnValue(false)
  ;(isSubmissionRateLimited as ReturnType<typeof mock>).mockClear()
  ;(isSubmissionRateLimited as ReturnType<typeof mock>).mockReturnValue(false)
  ;(recordSubmission as ReturnType<typeof mock>).mockClear()
})

afterEach(() => {
  mockShopCreate.mockReset()
})

describe("GET /api/shops/submit", () => {
  test("returns 401 without API key", async () => {
    ;(isValidApiKey as ReturnType<typeof mock>).mockReturnValue(false)

    const request = new Request(
      "https://example.com/api/shops/submit?name=Test"
    )
    const response = await GET(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe("Unauthorized")
  })

  test("returns 400 without name query param", async () => {
    ;(isValidApiKey as ReturnType<typeof mock>).mockReturnValue(true)

    const request = new Request("https://example.com/api/shops/submit", {
      headers: { "x-api-key": "test-key" },
    })
    const response = await GET(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain("name")
  })

  test("returns exists=false when no matches", async () => {
    ;(isValidApiKey as ReturnType<typeof mock>).mockReturnValue(true)
    ;(findShopsByName as ReturnType<typeof mock>).mockResolvedValue([])

    const request = new Request(
      "https://example.com/api/shops/submit?name=Nonexistent",
      { headers: { "x-api-key": "test-key" } }
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.exists).toBe(false)
    expect(body.matches).toEqual([])
  })

  test("returns exists=true when matches found", async () => {
    ;(isValidApiKey as ReturnType<typeof mock>).mockReturnValue(true)
    const mockMatches = [
      {
        id: "shop-1",
        name: "Kedai Gas ABC",
        address: "Jalan Test",
        lat: 3.139,
        lng: 101.6869,
        approved: true,
        submittedBy: null,
      },
    ]
    ;(findShopsByName as ReturnType<typeof mock>).mockResolvedValue(mockMatches)

    const request = new Request(
      "https://example.com/api/shops/submit?name=Kedai+Gas+ABC",
      { headers: { "x-api-key": "test-key" } }
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.exists).toBe(true)
    expect(body.matches).toHaveLength(1)
    expect(body.matches[0].name).toBe("Kedai Gas ABC")
  })

  test("passes coordinates to findShopsByName when lat/lng provided", async () => {
    ;(isValidApiKey as ReturnType<typeof mock>).mockReturnValue(true)
    ;(findShopsByName as ReturnType<typeof mock>).mockResolvedValue([])

    const request = new Request(
      "https://example.com/api/shops/submit?name=Test&lat=3.139&lng=101.6869",
      { headers: { "x-api-key": "test-key" } }
    )
    await GET(request)

    expect(findShopsByName).toHaveBeenCalledWith({
      name: "Test",
      coordinates: { lat: 3.139, lng: 101.6869 },
      radiusKm: 0.5,
    })
  })

  test("passes undefined coords when lat/lng not provided", async () => {
    ;(isValidApiKey as ReturnType<typeof mock>).mockReturnValue(true)
    ;(findShopsByName as ReturnType<typeof mock>).mockResolvedValue([])

    const request = new Request(
      "https://example.com/api/shops/submit?name=Test",
      { headers: { "x-api-key": "test-key" } }
    )
    await GET(request)

    expect(findShopsByName).toHaveBeenCalledWith({
      name: "Test",
      coordinates: undefined,
      radiusKm: undefined,
    })
  })
})

describe("POST /api/shops/submit — success cases", () => {
  test("returns 201 with valid data (browser mode)", async () => {
    ;(isValidApiKey as ReturnType<typeof mock>).mockReturnValue(false)
    mockShopCreate.mockResolvedValue(createdShop)

    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.shop.name).toBe("Kedai Gas Test")
  })

  test("creates shop with approved=false", async () => {
    mockShopCreate.mockResolvedValue(createdShop)

    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    })
    await POST(request)

    expect(mockShopCreate).toHaveBeenCalled()
    const createCall = mockShopCreate.mock.calls[0]
    expect(createCall[0].data).toHaveProperty("approved", false)
  })

  test("defaults submittedBy to hermes-agent when API key present", async () => {
    ;(isValidApiKey as ReturnType<typeof mock>).mockReturnValue(true)
    mockShopCreate.mockResolvedValue({
      ...createdShop,
      submittedBy: "hermes-agent",
    })

    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "test-key",
      },
      body: JSON.stringify(validBody),
    })
    await POST(request)

    const createCall = mockShopCreate.mock.calls[0]
    expect(createCall[0].data.submittedBy).toBe("hermes-agent")
  })

  test("uses submittedBy from body when provided", async () => {
    ;(isValidApiKey as ReturnType<typeof mock>).mockReturnValue(true)
    mockShopCreate.mockResolvedValue({
      ...createdShop,
      submittedBy: "user@example.com",
    })

    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "test-key",
      },
      body: JSON.stringify({
        ...validBody,
        submittedBy: "user@example.com",
      }),
    })
    await POST(request)

    const createCall = mockShopCreate.mock.calls[0]
    expect(createCall[0].data.submittedBy).toBe("user@example.com")
  })

  test("records submission after successful create", async () => {
    mockShopCreate.mockResolvedValue(createdShop)

    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    })
    await POST(request)

    expect(recordSubmission).toHaveBeenCalled()
  })

  test("normalizes phone to E.164", async () => {
    mockShopCreate.mockResolvedValue(createdShop)

    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validBody,
        phone: "0123456789",
      }),
    })
    await POST(request)

    const createCall = mockShopCreate.mock.calls[0]
    expect(createCall[0].data.phone).toBe("+60123456789")
  })
})

describe("POST /api/shops/submit — error cases", () => {
  test("returns 400 with invalid JSON body", async () => {
    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain("JSON")
  })

  test("returns 400 with missing name", async () => {
    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: "Test address",
        lat: 3.139,
        lng: 101.6869,
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.issues).toContain("name is required")
  })

  test("returns 400 with missing address", async () => {
    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Shop",
        lat: 3.139,
        lng: 101.6869,
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  test("returns 400 with missing lat/lng", async () => {
    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Shop",
        address: "Test address",
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  test("returns 400 with invalid phone", async () => {
    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validBody,
        phone: "+6512345678",
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.issues).toContain("phone must be a valid Malaysian number")
  })

  test("returns 409 when duplicate exists", async () => {
    const mockDuplicates = [
      {
        id: "existing-shop",
        name: "Kedai Gas Test",
        address: "Same Street",
        lat: 3.139,
        lng: 101.6869,
        approved: true,
        submittedBy: null,
      },
    ]
    ;(findShopsByName as ReturnType<typeof mock>).mockResolvedValue(
      mockDuplicates
    )

    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    })
    const response = await POST(request)

    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body.error).toContain("already exists")
    expect(body.matches).toHaveLength(1)
  })

  test("does not call prisma.create when duplicate exists", async () => {
    const mockDuplicates = [
      {
        id: "existing-shop",
        name: "Kedai Gas Test",
        address: "Same Street",
        lat: 3.139,
        lng: 101.6869,
        approved: true,
        submittedBy: null,
      },
    ]
    ;(findShopsByName as ReturnType<typeof mock>).mockResolvedValue(
      mockDuplicates
    )

    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    })
    await POST(request)

    expect(mockShopCreate).not.toHaveBeenCalled()
  })

  test("returns 429 when rate limited", async () => {
    ;(isSubmissionRateLimited as ReturnType<typeof mock>).mockReturnValue(true)

    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    })
    const response = await POST(request)

    expect(response.status).toBe(429)
    const body = await response.json()
    expect(body.error).toContain("Rate limit")
  })

  test("does not call prisma.create when rate limited", async () => {
    ;(isSubmissionRateLimited as ReturnType<typeof mock>).mockReturnValue(true)

    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    })
    await POST(request)

    expect(mockShopCreate).not.toHaveBeenCalled()
  })

  test("returns 500 when prisma.create throws", async () => {
    mockShopCreate.mockRejectedValue(new Error("DB connection failed"))

    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    })
    const response = await POST(request)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toContain("Failed to create shop")
  })
})

describe("POST /api/shops/submit — rate limiting", () => {
  test("uses agent identifier when API key is valid", async () => {
    ;(isValidApiKey as ReturnType<typeof mock>).mockReturnValue(true)
    mockShopCreate.mockResolvedValue(createdShop)

    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "test-key",
      },
      body: JSON.stringify(validBody),
    })
    await POST(request)

    expect(isSubmissionRateLimited).toHaveBeenCalledWith("agent", true)
  })

  test("uses IP identifier when no API key", async () => {
    ;(isValidApiKey as ReturnType<typeof mock>).mockReturnValue(false)
    mockShopCreate.mockResolvedValue(createdShop)

    const request = new Request("https://example.com/api/shops/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    })
    await POST(request)

    expect(isSubmissionRateLimited).toHaveBeenCalledWith("127.0.0.1", false)
  })
})
