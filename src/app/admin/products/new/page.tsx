import type { Metadata } from "next"

import { privateMetadata } from "@/lib/seo/metadata"
import { getT } from "@/lib/i18n/server"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminProductForm } from "@/components/admin/admin-product-form"

// Not for search results: it belongs to one visitor (see privateMetadata).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return privateMetadata(t("admin.products.newTitle"))
}

export default async function Page() {
  const t = await getT()

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("admin.products.newTitle")} />
      <AdminProductForm />
    </div>
  )
}
