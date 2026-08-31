import { describe, expect, test } from "bun:test"

import {
  averageCycleDays,
  daysUntil,
  predictFinishDate,
} from "@/lib/gas-prediction"

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

describe("averageCycleDays", () => {
  test("returns null with no completed cycles", () => {
    expect(
      averageCycleDays([{ startDate: daysAgo(5), endDate: null, weightKg: 12 }])
    ).toBeNull()
    expect(averageCycleDays([])).toBeNull()
  })

  test("ignores invalid cycles (end before start)", () => {
    expect(
      averageCycleDays([
        { startDate: daysAgo(3), endDate: daysAgo(10), weightKg: 12 },
      ])
    ).toBeNull()
  })

  test("averages valid cycles", () => {
    const avg = averageCycleDays([
      { startDate: daysAgo(50), endDate: daysAgo(20), weightKg: 12 }, // 30 days
      { startDate: daysAgo(20), endDate: daysAgo(2), weightKg: 12 }, // 18 days
    ])
    expect(avg).toBeCloseTo(24)
  })
})

describe("predictFinishDate", () => {
  test("returns null without startDate", () => {
    expect(
      predictFinishDate({ startDate: null, endDate: null, weightKg: 12 }, [])
    ).toBeNull()
  })

  test("uses history average when available", () => {
    const startDate = daysAgo(10)
    const predicted = predictFinishDate(
      { startDate, endDate: null, weightKg: 12 },
      [
        { startDate: daysAgo(50), endDate: daysAgo(20), weightKg: 12 }, // 30 days
      ]
    )
    expect(predicted).not.toBeNull()
    const diffDays = Math.round(
      ((predicted as Date).getTime() - startDate.getTime()) /
        (24 * 60 * 60 * 1000)
    )
    expect(diffDays).toBe(30)
  })

  test("falls back to weight-scaled baseline without history", () => {
    const startDate = daysAgo(0)
    const predicted = predictFinishDate(
      { startDate, endDate: null, weightKg: 6 },
      []
    )
    const diffDays = Math.round(
      ((predicted as Date).getTime() - startDate.getTime()) /
        (24 * 60 * 60 * 1000)
    )
    expect(diffDays).toBe(23)
  })
})

describe("daysUntil", () => {
  test("positive for future, negative for past", () => {
    expect(daysUntil(daysAgo(-5))).toBe(5)
    expect(daysUntil(daysAgo(5))).toBe(-5)
  })
})
