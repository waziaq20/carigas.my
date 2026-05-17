import { createShop } from "@/app/admin/actions"
import { ShopForm } from "@/components/admin/shop-form"
import { requireAdminSession } from "@/lib/admin-auth"

export default async function NewShopPage() {
  await requireAdminSession()

  return (
    <main className="min-h-svh bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <ShopForm action={createShop} title="Add a shop" cta="Create shop" />
      </div>
    </main>
  )
}
