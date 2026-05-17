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
import { locales } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import type { ShopCreateData } from "@/types"

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

function getShopData(formData: FormData): AdminShopData {
  return {
    address: getRequiredText(formData, "address"),
    approved: formData.get("approved") === "on",
    exchange: formData.get("exchange") === "on",
    lat: getRequiredNumber(formData, "lat"),
    lng: getRequiredNumber(formData, "lng"),
    name: getRequiredText(formData, "name"),
    phone: getText(formData, "phone") || null,
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
  await requireAdminSession()

  await prisma.shop.create({
    data: getShopData(formData),
  })

  revalidatePublicShopPages()
  redirect(adminHomePath)
}

export async function updateShop(id: string, formData: FormData) {
  await requireAdminSession()

  await prisma.shop.update({
    where: {
      id,
    },
    data: getShopData(formData),
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

  await requireAdminSession()

  await prisma.shop.update({
    where: {
      id,
    },
    data: {
      approved,
    },
  })

  revalidatePublicShopPages()
}

export async function deleteShop(id: string, formData?: FormData) {
  void formData

  await requireAdminSession()

  await prisma.shop.delete({
    where: {
      id,
    },
  })

  revalidatePublicShopPages()
}
