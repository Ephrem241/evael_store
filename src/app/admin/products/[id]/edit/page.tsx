import type { Metadata } from "next"

import { privateMetadata } from "@/lib/seo/metadata"
import { getT } from "@/lib/i18n/server"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminProductEditContent } from "@/components/admin/admin-product-edit-content"

// Not for search results: it belongs to one visitor (see privateMetadata).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return privateMetadata(t("admin.products.editTitle"))
}

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getT()

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("admin.products.editTitle")} />
      <AdminProductEditContent productId={id} />
    </div>
  )
}
