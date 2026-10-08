import type { Metadata } from "next"

import { privateMetadata } from "@/lib/seo/metadata"
import { getT } from "@/lib/i18n/server"
import { PageHeader } from "@/components/layout/page-header"
import { AccountSettingsContent } from "@/components/account/account-settings-content"

// Not for search results: it belongs to one visitor (see privateMetadata).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return privateMetadata(t("account.settings.title"))
}

export default async function Page() {
  const t = await getT()

  return (
    <div className="space-y-6">
      <PageHeader
        variant="plain"
        title={t("account.settings.title")}
        description={t("account.settings.subtitle")}
        backHref="/account"
      />
      <AccountSettingsContent />
    </div>
  )
}
