import type { Metadata } from "next"

import { privateMetadata } from "@/lib/seo/metadata"
import { getT } from "@/lib/i18n/server"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminSettingsContent } from "@/components/admin/admin-settings-content"

// Not for search results: it belongs to one visitor (see privateMetadata).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return privateMetadata(t("admin.settings.title"))
}

export default async function Page() {
  const t = await getT()

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("admin.settings.title")} description={t("admin.settings.subtitle")} />
      <AdminSettingsContent />
    </div>
  )
}
