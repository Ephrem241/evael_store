import type { Metadata } from "next"

import { privateMetadata } from "@/lib/seo/metadata"
import { getT } from "@/lib/i18n/server"
import { PageHeader } from "@/components/layout/page-header"
import { AccountOrdersContent } from "@/components/account/account-orders-content"

// Not for search results: it belongs to one visitor (see privateMetadata).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return privateMetadata(t("account.orders.title"))
}

export default async function Page() {
  const t = await getT()

  return (
    <div className="space-y-6">
      <PageHeader
        variant="plain"
        title={t("account.orders.title")}
        description={t("account.orders.subtitle")}
        backHref="/account"
      />
      <AccountOrdersContent />
    </div>
  )
}
