import type { Metadata } from "next"

import { privateMetadata } from "@/lib/seo/metadata"
import { getT } from "@/lib/i18n/server"
import { CartContents } from "@/components/cart/cart-contents"
import { ClearCartButton } from "@/components/cart/clear-cart-button"
import { PageHeader } from "@/components/layout/page-header"

// Not for search results: it belongs to one visitor (see privateMetadata).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return privateMetadata(t("cart.title"))
}

export default async function CartPage() {
  const t = await getT()

  return (
    <div className="space-y-6 py-6 lg:space-y-8 lg:py-8">
      <PageHeader
        variant="plain"
        title={t("cart.title")}
        description={t("cart.subtitle")}
        mobileActions={<ClearCartButton />}
      />
      <CartContents />
    </div>
  )
}
