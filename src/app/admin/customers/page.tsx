import type { Metadata } from "next"

import { privateMetadata } from "@/lib/seo/metadata"
import { getT } from "@/lib/i18n/server"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminCustomersContent } from "@/components/admin/admin-customers-content"

// Not for search results: it belongs to one visitor (see privateMetadata).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return privateMetadata(t("admin.customers.title"))
}

export default async function Page() {
  const t = await getT()

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("admin.customers.title")} description={t("admin.customers.subtitle")} />
      <AdminCustomersContent />
    </div>
  )
}
