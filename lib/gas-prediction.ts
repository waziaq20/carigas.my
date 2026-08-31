export type GasRecordLike = {
  startDate: Date | null
  endDate: Date | null
  weightKg: number
}

const BASELINE_DAYS = 45
const BASELINE_WEIGHT_KG = 12
const DAY_MS = 24 * 60 * 60 * 1000

export function averageCycleDays(records: GasRecordLike[]): number | null {
  const cycles = records
    .filter(
      (r) =>
        r.startDate !== null &&
        r.endDate !== null &&
        r.endDate.getTime() > r.startDate.getTime()
    )
    .map(
      (r) =>
        ((r.endDate as Date).getTime() - (r.startDate as Date).getTime()) /
        DAY_MS
    )

  if (cycles.length === 0) {
    return null
  }

  return cycles.reduce((sum, days) => sum + days, 0) / cycles.length
}

export function predictFinishDate(
  active: GasRecordLike,
  history: GasRecordLike[]
): Date | null {
  if (!active.startDate) {
    return null
  }

  const avg = averageCycleDays(history)
  const days = avg ?? (BASELINE_DAYS * active.weightKg) / BASELINE_WEIGHT_KG

  return new Date(active.startDate.getTime() + days * DAY_MS)
}

export function daysUntil(date: Date, from: Date = new Date()): number {
  return Math.ceil((date.getTime() - from.getTime()) / DAY_MS)
}
