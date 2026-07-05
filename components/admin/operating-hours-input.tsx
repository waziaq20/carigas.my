"use client"

import { useState } from "react"

type DayHours = {
  open: string
  close: string
  closed: boolean
}

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

const defaultDay: DayHours = {
  open: "08:00",
  close: "20:00",
  closed: true,
}

function parseInitialState(json: string | null | undefined): DayHours[] {
  const days: DayHours[] = Array.from({ length: 7 }, () => ({
    ...defaultDay,
  }))

  if (!json) {
    return days
  }

  try {
    const parsed = JSON.parse(json)

    if (typeof parsed !== "object" || parsed === null) {
      return days
    }

    for (let day = 1; day <= 7; day++) {
      const range = parsed[String(day)]

      if (typeof range === "string") {
        const parts = range.split("-")

        if (parts.length === 2 && parts[0] && parts[1]) {
          days[day - 1] = {
            open: parts[0],
            close: parts[1],
            closed: false,
          }
        }
      }
    }
  } catch {
    // invalid JSON, use defaults
  }

  return days
}

function serialize(days: DayHours[]): string {
  const map: Record<string, string> = {}

  for (let i = 0; i < 7; i++) {
    if (!days[i].closed) {
      map[String(i + 1)] = `${days[i].open}-${days[i].close}`
    }
  }

  return JSON.stringify(map)
}

const inputClassName =
  "h-8 w-24 border border-border bg-background px-2 text-xs font-normal outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"

export function OperatingHoursInput({
  defaultValue,
}: {
  defaultValue?: string | null
}) {
  const [days, setDays] = useState(() => parseInitialState(defaultValue))

  function toggleDay(index: number) {
    setDays((curr) =>
      curr.map((day, i) =>
        i === index ? { ...day, closed: !day.closed } : day
      )
    )
  }

  function updateDay(index: number, field: "open" | "close", value: string) {
    setDays((curr) =>
      curr.map((day, i) => (i === index ? { ...day, [field]: value } : day))
    )
  }

  const serialized = serialize(days)

  return (
    <div className="flex flex-col gap-2 text-sm font-semibold">
      <input type="hidden" name="openHours" value={serialized} />
      <div className="flex items-center justify-between">
        Operating hours
        <span className="text-xs font-normal text-muted-foreground">
          Unchecked days are closed
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {dayLabels.map((label, index) => {
          const day = days[index]

          return (
            <div
              key={label}
              className="flex items-center gap-3 border border-border bg-background p-2"
            >
              <label className="flex w-12 items-center gap-1.5 text-xs font-bold">
                <input
                  type="checkbox"
                  checked={!day.closed}
                  onChange={() => toggleDay(index)}
                  className="size-4 accent-primary"
                />
                {label}
              </label>
              <input
                type="time"
                className={inputClassName}
                value={day.open}
                disabled={day.closed}
                onChange={(event) =>
                  updateDay(index, "open", event.target.value)
                }
              />
              <span className="text-xs text-muted-foreground">to</span>
              <input
                type="time"
                className={inputClassName}
                value={day.close}
                disabled={day.closed}
                onChange={(event) =>
                  updateDay(index, "close", event.target.value)
                }
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
