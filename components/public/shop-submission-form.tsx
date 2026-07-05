"use client"

import { useState } from "react"
import Link from "next/link"

import { PhoneInput } from "@/components/admin/phone-input"
import { ShopLocationPicker } from "@/components/admin/shop-location-picker"
import { Button } from "@/components/ui/button"
import type { Dictionary } from "@/lib/i18n"

type SubmissionStatus = "idle" | "submitting" | "success" | "error"

type ShopSubmissionFormProps = {
  dictionary: Dictionary
  locale: string
}

const inputClassName =
  "h-10 border border-border bg-background px-3 text-sm font-normal outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"

const textareaClassName =
  "min-h-24 border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"

export function ShopSubmissionForm({
  dictionary,
  locale,
}: ShopSubmissionFormProps) {
  const [status, setStatus] = useState<SubmissionStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("submitting")
    setErrorMessage(null)

    const formData = new FormData(event.currentTarget)
    const priceRaw = String(formData.get("price") ?? "").trim()

    const body: Record<string, unknown> = {
      name: String(formData.get("name") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      lat: Number(formData.get("lat")),
      lng: Number(formData.get("lng")),
      exchange: formData.get("exchange") === "on",
      sellNew: formData.get("sellNew") === "on",
    }

    const phone = String(formData.get("phone") ?? "").trim()

    if (phone) {
      body.phone = phone
    }

    if (priceRaw) {
      const price = Number(priceRaw.replace(/,/g, ""))

      if (Number.isFinite(price) && price >= 0) {
        body.price = Math.round(price * 100)
      }
    }

    try {
      const response = await fetch("/api/shops/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.status === 201) {
        setStatus("success")
        return
      }

      const data = await response.json().catch(() => ({}))

      if (response.status === 409) {
        setErrorMessage(dictionary.submitDuplicate)
      } else if (response.status === 429) {
        setErrorMessage(dictionary.submitRateLimited)
      } else {
        setErrorMessage(
          data?.error ?? data?.issues?.join(", ") ?? dictionary.submitError
        )
      }

      setStatus("error")
    } catch {
      setErrorMessage(dictionary.submitError)
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="border border-border bg-card p-6 text-center text-card-foreground shadow-sm">
        <p className="text-lg font-black tracking-[-0.04em] text-foreground">
          {dictionary.submitSuccess}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setStatus("idle")
              setErrorMessage(null)
            }}
          >
            {dictionary.submitAnother}
          </Button>
          <Button asChild>
            <Link href={`/${locale}`}>{dictionary.viewShop}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold sm:col-span-2">
          {dictionary.shopName}
          <input
            className={inputClassName}
            name="name"
            required
            disabled={status === "submitting"}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold sm:col-span-2">
          {dictionary.shopAddress}
          <textarea
            className={textareaClassName}
            name="address"
            required
            disabled={status === "submitting"}
          />
        </label>

        <div className="sm:col-span-2">
          <ShopLocationPicker />
        </div>

        <label className="flex flex-col gap-2 text-sm font-semibold">
          {dictionary.price14kg}
          <input
            className={inputClassName}
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="26.60"
            disabled={status === "submitting"}
          />
        </label>

        <PhoneInput />
      </div>

      <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
        <label className="flex items-center gap-3 border border-border bg-background p-3 text-sm font-semibold">
          <input name="exchange" type="checkbox" defaultChecked />
          {dictionary.exchange}
        </label>
        <label className="flex items-center gap-3 border border-border bg-background p-3 text-sm font-semibold">
          <input name="sellNew" type="checkbox" />
          {dictionary.newCylinder}
        </label>
      </div>

      {errorMessage ? (
        <p className="mt-4 border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? dictionary.submitting : dictionary.submit}
        </Button>
      </div>
    </form>
  )
}
