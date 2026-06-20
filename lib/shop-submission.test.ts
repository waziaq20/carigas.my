import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"

mock.module("@/lib/prisma", () => ({
  prisma: {
    shop: {
      findMany: mock(() => Promise.resolve([])),
    },
  },
}))

const {
  isSubmissionRateLimited,
  recordSubmission,
  isValidApiKey,
  getClientIp,
  findShopsByName,
} = await import("@/lib/shop-submission")

const originalEnv = { ...process.env }

beforeEach(() => {
  process.env = { ...originalEnv }
})

afterEach(() => {
  process.env = { ...originalEnv }
})

describe("isValidApiKey", () => {
  test("returns false for null key", () => {
    expect(isValidApiKey(null)).toBe(false)
  })

  test("returns false for empty string", () => {
    expect(isValidApiKey("")).toBe(false)
  })

  test("returns false when env var not set", () => {
    delete process.env.SUBMISSION_API_KEY
    expect(isValidApiKey("any-key")).toBe(false)
  })

  test("returns false for wrong key", () => {
    process.env.SUBMISSION_API_KEY = "correct-secret-key"
    expect(isValidApiKey("wrong-key")).toBe(false)
  })

  test("returns true for correct key", () => {
    process.env.SUBMISSION_API_KEY = "correct-secret-key"
    expect(isValidApiKey("correct-secret-key")).toBe(true)
  })

  test("returns false for key with different length", () => {
    process.env.SUBMISSION_API_KEY = "correct-secret-key"
    expect(isValidApiKey("correct-secret-key-extra")).toBe(false)
  })
})

describe("isSubmissionRateLimited — browser mode", () => {
  test("not limited on first request", () => {
    expect(isSubmissionRateLimited("test-browser-ip-1", false)).toBe(false)
  })

  test("limited after one submission", () => {
    recordSubmission("test-browser-ip-2")
    expect(isSubmissionRateLimited("test-browser-ip-2", false)).toBe(true)
  })

  test("not limited for different IP after one submission", () => {
    recordSubmission("test-browser-ip-3")
    expect(isSubmissionRateLimited("test-browser-ip-4", false)).toBe(false)
  })
})

describe("isSubmissionRateLimited — agent mode", () => {
  test("not limited after fewer than 100 submissions", () => {
    for (let i = 0; i < 99; i++) {
      recordSubmission("test-agent-1")
    }
    expect(isSubmissionRateLimited("test-agent-1", true)).toBe(false)
  })

  test("limited after 100 submissions", () => {
    for (let i = 0; i < 100; i++) {
      recordSubmission("test-agent-2")
    }
    expect(isSubmissionRateLimited("test-agent-2", true)).toBe(true)
  })
})

describe("getClientIp", () => {
  test("extracts from x-forwarded-for header", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.5, 70.41.3.18" },
    })
    expect(getClientIp(request)).toBe("203.0.113.5")
  })

  test("extracts from x-real-ip header", () => {
    const request = new Request("https://example.com", {
      headers: { "x-real-ip": "198.51.100.3" },
    })
    expect(getClientIp(request)).toBe("198.51.100.3")
  })

  test("returns unknown when no IP headers", () => {
    const request = new Request("https://example.com")
    expect(getClientIp(request)).toBe("unknown")
  })

  test("prefers x-forwarded-for over x-real-ip", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": "203.0.113.5",
        "x-real-ip": "198.51.100.3",
      },
    })
    expect(getClientIp(request)).toBe("203.0.113.5")
  })
})

describe("findShopsByName", () => {
  test("returns empty array when no matches", async () => {
    const result = await findShopsByName({
      name: "Nonexistent Shop",
    })

    expect(result).toEqual([])
  })

  test("returns matches from prisma (no coords filter)", async () => {
    const { prisma } = await import("@/lib/prisma")
    const mockShops = [
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
    ;(prisma.shop.findMany as ReturnType<typeof mock>).mockResolvedValueOnce(
      mockShops
    )

    const result = await findShopsByName({ name: "Kedai Gas ABC" })

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("Kedai Gas ABC")
    expect(result[0].approved).toBe(true)
  })

  test("filters by proximity when coordinates provided", async () => {
    const { prisma } = await import("@/lib/prisma")
    const mockShops = [
      {
        id: "shop-near",
        name: "Kedai Gas ABC",
        address: "Nearby Street",
        lat: 3.1395,
        lng: 101.6875,
        approved: true,
        submittedBy: null,
      },
      {
        id: "shop-far",
        name: "Kedai Gas ABC",
        address: "Far Away Street",
        lat: 3.5,
        lng: 102.0,
        approved: false,
        submittedBy: "hermes-agent",
      },
    ]
    ;(prisma.shop.findMany as ReturnType<typeof mock>).mockResolvedValueOnce(
      mockShops
    )

    const result = await findShopsByName({
      name: "Kedai Gas ABC",
      coordinates: { lat: 3.139, lng: 101.6869 },
      radiusKm: 0.5,
    })

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("shop-near")
  })

  test("returns all matches when coords provided but all within radius", async () => {
    const { prisma } = await import("@/lib/prisma")
    const mockShops = [
      {
        id: "shop-1",
        name: "Kedai Gas ABC",
        address: "Street A",
        lat: 3.139,
        lng: 101.6869,
        approved: true,
        submittedBy: null,
      },
      {
        id: "shop-2",
        name: "Kedai Gas ABC",
        address: "Street B",
        lat: 3.1392,
        lng: 101.6871,
        approved: false,
        submittedBy: "hermes-agent",
      },
    ]
    ;(prisma.shop.findMany as ReturnType<typeof mock>).mockResolvedValueOnce(
      mockShops
    )

    const result = await findShopsByName({
      name: "Kedai Gas ABC",
      coordinates: { lat: 3.139, lng: 101.6869 },
      radiusKm: 0.5,
    })

    expect(result).toHaveLength(2)
  })
})
