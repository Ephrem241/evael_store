import type { Metadata } from "next"

import { privateMetadata } from "@/lib/seo/metadata"
import { getT } from "@/lib/i18n/server"
import { PageHeader } from "@/components/layout/page-header"
import { AccountFavoritesContent } from "@/components/account/account-favorites-content"

// Not for search results: it belongs to one visitor (see privateMetadata).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return privateMetadata(t("account.favorites.title"))
}

export default async function Page() {
  const t = await getT()

  return (
    <div className="space-y-6">
      <PageHeader
        variant="plain"
        title={t("account.favorites.title")}
        description={t("account.favorites.subtitle")}
        backHref="/account"
      />
      <AccountFavoritesContent />
    </div>
  )
}
