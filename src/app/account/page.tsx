import type { Metadata } from "next"

import { privateMetadata } from "@/lib/seo/metadata"
import { getT } from "@/lib/i18n/server"
import { AccountProfileContent } from "@/components/account/account-profile-content"

// Not for search results: it belongs to one visitor (see privateMetadata).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return privateMetadata(t("account.overview.title"))
}

export default async function Page() {
  const t = await getT()

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
        {t("account.overview.title")}
      </h1>
      <AccountProfileContent />
    </div>
  )
}
