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
      {/* Phones: the menu above is this screen, so the heading is only read out. */}
      <h1 className="font-display text-3xl font-bold text-charcoal max-lg:sr-only lg:text-4xl">
        {t("account.overview.title")}
      </h1>
      <AccountProfileContent />
    </div>
  )
}
