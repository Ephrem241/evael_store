import type { Metadata } from "next"

import { getT } from "@/lib/i18n/server"
import { privateMetadata } from "@/lib/seo/metadata"
import { OrderDetailContent } from "@/components/order/order-detail-content"
import { PageHeader } from "@/components/layout/page-header"

// Not for search results: it belongs to one visitor (see privateMetadata).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return privateMetadata(t("account.orders.title"))
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getT()

  return (
    <div className="py-6 lg:py-8">
      <PageHeader barOnly title={t("order.details")} backHref="/account/orders" />
      <OrderDetailContent orderId={id} />
    </div>
  )
}
