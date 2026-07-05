export type OpenHoursMap = Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7, string>>

export function parseOpenHours(json: string | null): OpenHoursMap | null {
  if (!json) {
    return null
  }

  try {
    const parsed = JSON.parse(json)

    if (typeof parsed !== "object" || parsed === null) {
      return null
    }

    return parsed as OpenHoursMap
  } catch {
    return null
  }
}

function parseTimeRange(
  range: string
): { openMin: number; closeMin: number } | null {
  const parts = range.split("-")

  if (parts.length !== 2) {
    return null
  }

  const openParts = parts[0].split(":").map(Number)
  const closeParts = parts[1].split(":").map(Number)

  if (
    openParts.length !== 2 ||
    closeParts.length !== 2 ||
    openParts.some((n) => !Number.isFinite(n)) ||
    closeParts.some((n) => !Number.isFinite(n))
  ) {
    return null
  }

  const openMin = openParts[0] * 60 + openParts[1]
  const closeMin = closeParts[0] * 60 + closeParts[1]

  if (openMin >= closeMin) {
    return null
  }

  return { openMin, closeMin }
}

export function isShopOpenNow(openHours: string | null): boolean {
  const hours = parseOpenHours(openHours)

  if (!hours) {
    return true
  }

  const now = new Date()
  const malaysiaMinutes =
    ((now.getUTCHours() + 8) % 24) * 60 + now.getUTCMinutes()
  const day = (now.getUTCDay() || 7) as 1 | 2 | 3 | 4 | 5 | 6 | 7

  const todayRange = hours[day]

  if (!todayRange) {
    return false
  }

  const parsed = parseTimeRange(todayRange)

  if (!parsed) {
    return true
  }

  return malaysiaMinutes >= parsed.openMin && malaysiaMinutes < parsed.closeMin
}

export function formatOpenHours(openHours: string | null): string {
  const hours = parseOpenHours(openHours)

  if (!hours) {
    return ""
  }

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const parts: string[] = []

  for (let day = 1; day <= 7; day++) {
    const range = hours[day as 1 | 2 | 3 | 4 | 5 | 6 | 7]

    if (range) {
      parts.push(`${dayLabels[day - 1]} ${range}`)
    }
  }

  return parts.join(", ")
}
