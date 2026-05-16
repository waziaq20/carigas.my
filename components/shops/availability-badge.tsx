import type { ReactNode } from "react"

import { CheckIcon, XIcon } from "@/components/icons/app-icons"
import { cn } from "@/lib/utils"

type AvailabilityBadgeProps = {
  available: boolean
  children: ReactNode
  icon?: ReactNode
}

export function AvailabilityBadge({
  available,
  children,
  icon,
}: AvailabilityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black",
        available
          ? "bg-primary text-primary-foreground"
          : "bg-destructive/10 text-destructive"
      )}
    >
      {icon ??
        (available ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <XIcon className="size-3.5" />
        ))}
      {children}
    </span>
  )
}
