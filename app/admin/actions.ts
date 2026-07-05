"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import {
  adminHomePath,
  adminLoginPath,
  clearAdminSessionCookie,
  createAdminSessionCookie,
  isAdminAuthConfigured,
  requireAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth"
import {
  clearFailedLogins,
  isLoginRateLimited,
  recordFailedLogin,
} from "@/lib/admin-rate-limit"
import { recordAudit } from "@/lib/audit-log"
import { locales } from "@/lib/i18n"
import { normalizeMalaysianPhone } from "@/lib/phone"
import { prisma } from "@/lib/prisma"
import { snapshotPriceIfChanged } from "@/lib/price-history"
import { parseShopsFromCsv } from "@/lib/shop-csv"
import type { ShopCreateData } from "@/types"

const adminImportPath = "/admin/shops/import"

type AdminShopData = ShopCreateData & {
  approved: boolean
}

function getText(formData: FormData, name: string) {
  const value = formData.get(name)

  return typeof value === "string" ? value.trim() : ""
}

function getRequiredText(formData: FormData, name: string) {
  const value = getText(formData, name)

  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

function getRequiredNumber(formData: FormData, name: string) {
  const value = Number(getRequiredText(formData, name))

  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a valid number`)
  }

  return value
}

function getPriceInSen(formData: FormData) {
  const value = getText(formData, "price")

  if (!value) {
    return null
  }

  const price = Number(value.replace(/,/g, ""))

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("price must be a valid amount")
  }

  return Math.round(price * 100)
}

function getNormalizedPhone(formData: FormData) {
  const value = getText(formData, "phone")

  if (!value) {
    return null
  }

  const normalized = normalizeMalaysianPhone(value)

  if (!normalized) {
    throw new Error("phone must be a valid Malaysian number")
  }

  return normalized
}

function getShopData(formData: FormData): AdminShopData {
  return {
    address: getRequiredText(formData, "address"),
    approved: formData.get("approved") === "on",
    exchange: formData.get("exchange") === "on",
    lat: getRequiredNumber(formData, "lat"),
    lng: getRequiredNumber(formData, "lng"),
    name: getRequiredText(formData, "name"),
    openHours: getText(formData, "openHours") || null,
    phone: getNormalizedPhone(formData),
    price: getPriceInSen(formData),
    sellNew: formData.get("sellNew") === "on",
  }
}

function revalidatePublicShopPages() {
  for (const locale of locales) {
    revalidatePath(`/${locale}`)
  }

  revalidatePath(adminHomePath)
}

async function getLoginIdentifier() {
  const headerStore = await headers()
  const forwardedFor = headerStore.get("x-forwarded-for")
  const ipAddress = forwardedFor?.split(",")[0]?.trim()

  return ipAddress || headerStore.get("x-real-ip") || "unknown"
}

export async function loginAdmin(formData: FormData) {
  if (!isAdminAuthConfigured()) {
    redirect(`${adminLoginPath}?error=not-configured`)
  }

  const identifier = await getLoginIdentifier()

  if (isLoginRateLimited(identifier)) {
    redirect(`${adminLoginPath}?error=rate-limited`)
  }

  const username = getText(formData, "username")
  const password = getText(formData, "password")

  if (verifyAdminCredentials(username, password)) {
    clearFailedLogins(identifier)
    await createAdminSessionCookie()
    redirect(adminHomePath)
  }

  recordFailedLogin(identifier)
  redirect(`${adminLoginPath}?error=invalid`)
}

export async function logoutAdmin() {
  await clearAdminSessionCookie()
  redirect(adminLoginPath)
}

export async function createShop(formData: FormData) {
  const session = await requireAdminSession()

  const shop = await prisma.shop.create({
    data: getShopData(formData),
  })

  await recordAudit({
    actor: session.username,
    action: "create",
    shopId: shop.id,
  })

  revalidatePublicShopPages()
  redirect(adminHomePath)
}

export async function updateShop(id: string, formData: FormData) {
  const session = await requireAdminSession()

  const existing = await prisma.shop.findFirst({
    where: { id, deletedAt: null },
  })

  if (!existing) {
    redirect(adminHomePath)
  }

  const data = getShopData(formData)

  await snapshotPriceIfChanged(id, existing.price, data.price ?? null)

  await prisma.shop.update({
    where: { id },
    data,
  })

  await recordAudit({
    actor: session.username,
    action: "update",
    shopId: id,
  })

  revalidatePublicShopPages()
  redirect(adminHomePath)
}

export async function toggleShopApproval(
  id: string,
  approved: boolean,
  formData?: FormData
) {
  void formData

  const session = await requireAdminSession()

  const result = await prisma.shop.updateMany({
    where: { id, deletedAt: null },
    data: { approved },
  })

  if (result.count > 0) {
    await recordAudit({
      actor: session.username,
      action: approved ? "approve" : "unapprove",
      shopId: id,
    })
  }

  revalidatePublicShopPages()
}

export async function deleteShop(id: string, formData?: FormData) {
  void formData

  const session = await requireAdminSession()

  const result = await prisma.shop.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date() },
  })

  if (result.count > 0) {
    await recordAudit({
      actor: session.username,
      action: "delete",
      shopId: id,
    })
  }

  revalidatePublicShopPages()
}

export async function bulkSetShopApproval(ids: string[], approved: boolean) {
  const session = await requireAdminSession()

  if (ids.length === 0) {
    return
  }

  const result = await prisma.shop.updateMany({
    where: {
      id: { in: ids },
      deletedAt: null,
    },
    data: { approved },
  })

  if (result.count > 0) {
    await recordAudit({
      actor: session.username,
      action: approved ? "bulk_approve" : "bulk_unapprove",
      details: JSON.stringify({ ids, affected: result.count }),
    })
  }

  revalidatePublicShopPages()
}

export async function bulkDeleteShops(ids: string[]) {
  const session = await requireAdminSession()

  if (ids.length === 0) {
    return
  }

  const result = await prisma.shop.updateMany({
    where: {
      id: { in: ids },
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  })

  if (result.count > 0) {
    await recordAudit({
      actor: session.username,
      action: "bulk_delete",
      details: JSON.stringify({ ids, affected: result.count }),
    })
  }

  revalidatePublicShopPages()
}

export async function importShops(formData: FormData) {
  const session = await requireAdminSession()

  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) {
    redirect(`${adminImportPath}?error=missing-file`)
  }

  const text = await file.text()
  const { rows, errors } = parseShopsFromCsv(text)

  let created = 0

  if (rows.length > 0) {
    const result = await prisma.shop.createMany({
      data: rows.map((row) => row.data),
    })
    created = result.count
  }

  if (created > 0) {
    await recordAudit({
      actor: session.username,
      action: "import",
      details: JSON.stringify({ created, skipped: errors.length }),
    })

    revalidatePublicShopPages()
  }

  const params = new URLSearchParams()
  params.set("created", String(created))
  params.set("skipped", String(errors.length))

  if (errors.length > 0) {
    const summary = errors
      .slice(0, 5)
      .map((error) => `line ${error.lineNumber}: ${error.message}`)
      .join(" | ")
    params.set("errors", summary)
  }

  redirect(`${adminImportPath}?${params.toString()}`)
}
