"use client"

import { useState } from "react"

import {
  formatMalaysianPhoneDisplay,
  getMalaysianNationalNumber,
  normalizeMalaysianPhone,
} from "@/lib/phone"

type PhoneInputProps = {
  defaultValue?: string | null
  name?: string
}

const inputClassName =
  "h-10 flex-1 rounded-none border border-l-0 border-border bg-background px-3 text-sm font-normal outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"

const prefixClassName =
  "grid h-10 place-items-center border border-r-0 border-border bg-muted px-3 text-sm font-bold text-foreground"

function stripToDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10)
}

export function PhoneInput({ defaultValue, name = "phone" }: PhoneInputProps) {
  const [national, setNational] = useState(() =>
    getMalaysianNationalNumber(defaultValue ?? "")
  )
  const [touched, setTouched] = useState(false)

  const e164 = national ? normalizeMalaysianPhone(`+60${national}`) : null
  const display = e164 ? formatMalaysianPhoneDisplay(e164) : null
  const showError = touched && national.length > 0 && !e164

  return (
    <div className="flex flex-col gap-2 text-sm font-semibold">
      Phone
      <div className="flex">
        <span className={prefixClassName} aria-hidden="true">
          +60
        </span>
        <input
          className={inputClassName}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={national}
          onChange={(event) => setNational(stripToDigits(event.target.value))}
          onBlur={() => setTouched(true)}
          placeholder="123456789"
          aria-invalid={showError ? "true" : undefined}
          aria-describedby={showError ? `${name}-error` : `${name}-hint`}
        />
      </div>
      <input type="hidden" name={name} value={e164 ?? ""} />
      {showError ? (
        <p
          id={`${name}-error`}
          className="text-xs font-normal text-destructive"
        >
          Enter a valid Malaysian number, e.g. 123456789 (mobile) or 312345678
          (landline).
        </p>
      ) : (
        <p
          id={`${name}-hint`}
          className="text-xs font-normal text-muted-foreground"
        >
          {display
            ? `Saved as ${display}`
            : "Type the number without the leading 0 (e.g. 123456789)."}
        </p>
      )}
    </div>
  )
}
