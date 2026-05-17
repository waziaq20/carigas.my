import { notFound } from "next/navigation"

import { updateShop } from "@/app/admin/actions"
import { ShopForm } from "@/components/admin/shop-form"
import { requireAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

type EditShopPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditShopPage({ params }: EditShopPageProps) {
  await requireAdminSession()

  const { id } = await params
  const shop = await prisma.shop.findUnique({
    where: {
      id,
    },
  })

  if (!shop) {
    notFound()
  }

  return (
    <main className="min-h-svh bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <ShopForm
          action={updateShop.bind(null, shop.id)}
          cta="Save shop"
          shop={shop}
          title="Edit shop"
        />
      </div>
    </main>
  )
}
