"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth, signIn, signOut } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function signInAction(locale: string) {
  await signIn("google", { redirectTo: `/${locale}/my-gas` })
}

export async function signOutAction(locale: string) {
  await signOut({ redirectTo: `/${locale}` })
}

function parseRecordForm(formData: FormData) {
  const label =
    String(formData.get("label") ?? "")
      .trim()
      .slice(0, 50) || null
  const brand = String(formData.get("brand") ?? "").trim()
  const weightKg = Number(formData.get("weightKg"))
  const price = Number(formData.get("price"))
  const startDateRaw = String(formData.get("startDate") ?? "").trim()

  if (
    !brand ||
    !Number.isFinite(weightKg) ||
    weightKg < 0.5 ||
    weightKg > 100
  ) {
    return null
  }

  if (!Number.isFinite(price) || price < 0 || price > 10000) {
    return null
  }

  const startDate = startDateRaw ? new Date(startDateRaw) : null

  if (startDate && Number.isNaN(startDate.getTime())) {
    return null
  }

  return { label, brand, weightKg, price: Math.round(price * 100), startDate }
}

export async function createGasRecord(
  locale: string,
  formData: FormData
): Promise<void> {
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/${locale}/my-gas?error=1`)
  }

  const parsed = parseRecordForm(formData)

  if (!parsed) {
    redirect(`/${locale}/my-gas?error=1`)
  }

  await prisma.gasRecord.create({
    data: { userId: session.user.id, ...parsed },
  })

  revalidatePath(`/${locale}/my-gas`)
}

export async function markGasFinished(
  locale: string,
  formData: FormData
): Promise<void> {
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/${locale}/my-gas?error=1`)
  }

  const id = String(formData.get("id") ?? "")

  if (!id) {
    redirect(`/${locale}/my-gas?error=1`)
  }

  await prisma.gasRecord.updateMany({
    where: { id, userId: session.user.id, endDate: null },
    data: { endDate: new Date() },
  })

  revalidatePath(`/${locale}/my-gas`)
}
