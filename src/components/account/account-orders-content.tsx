"use client"

import { CardListSkeleton } from "@/components/feedback/skeletons"
import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Package, PackageX, Search, SearchX } from "lucide-react"

import { nameOf } from "@/lib/i18n/content"
import { useT } from "@/lib/i18n/provider"
import { useRequireAuth } from "@/lib/hooks/use-require-auth"
import { useMyOrders } from "@/lib/hooks/use-orders"
import { useProductsByIds } from "@/lib/hooks/use-products-by-ids"
import { ORDER_HISTORY_FILTERS, matchesOrderHistoryFilter, type OrderHistoryFilter } from "@/lib/order-status"
import { formatOrderDate } from "@/lib/date"
import { formatPrice } from "@/lib/currency"
import { OrderStatus } from "@/components/order/order-status"
import { EmptyState } from "@/components/feedback/empty-state"
import { getCategoryIcon } from "@/components/product/category-icons"
import { ImagePlaceholder } from "@/components/product/image-placeholder"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"

// The order history: a search by order number and the status chips, then
// one white card per order (like the cart's item cards): the first item's
// photo, the order number, date and what was in it, the total and the status
// pill. The whole card opens the order.
function AccountOrdersContent() {
  const t = useT()
  const { user, ready } = useRequireAuth("/login?redirect=/account/orders")
  const { data: orders, loading, error } = useMyOrders(user?.id)
  // Order lines keep the English name they were bought under; while the
  // product still exists, show its name in the visitor's language instead.
  const { products } = useProductsByIds(
    (orders ?? []).flatMap((o) => o.items.map((i) => i.product_id).filter((id): id is string => id !== null))
  )
  const productsById = new Map(products.map((p) => [p.id, p]))

  function lineName(item: { product_id: string | null; product_name: string }): string {
    const product = item.product_id ? productsById.get(item.product_id) : undefined
    return product ? nameOf(product, t.locale) : item.product_name
  }

  function itemsSummary(items: { product_id: string | null; product_name: string; quantity: number }[]): string {
    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)
    if (items.length === 1) {
      return t("account.orders.summaryOne", { name: lineName(items[0]), quantity: items[0].quantity })
    }
    return t("account.orders.summaryMore", {
      name: lineName(items[0]),
      more: items.length - 1,
      total: totalQty,
    })
  }
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderHistoryFilter>("all")

  if (!ready || !user || loading) return <CardListSkeleton />

  if (error || !orders) {
    return (
      <EmptyState
        icon={PackageX}
        title={t("account.orders.loadFailed")}
        description={t("account.orders.refresh")}
      />
    )
  }

  const filtered = orders
    .filter((o) => matchesOrderHistoryFilter(o.status, statusFilter))
    .filter((o) => !search.trim() || o.order_number.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  function clearFilters() {
    setSearch("")
    setStatusFilter("all")
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={PackageX}
        title={t("account.orders.emptyTitle")}
        description={t("account.orders.emptyText")}
        action={
          <Button asChild>
            <Link href="/shop">{t("account.orders.startShopping")}</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-full sm:max-w-xs">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-text" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("account.orders.searchPlaceholder")}
            className="bg-surface pl-9"
          />
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {ORDER_HISTORY_FILTERS.map((f) => (
            <Chip key={f} type="button" selected={statusFilter === f} aria-pressed={statusFilter === f} onClick={() => setStatusFilter(f)}>
              {t(`order.historyFilter.${f}`)}
            </Chip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={t("account.orders.noMatch")}
          description={t("account.orders.noMatchText")}
          action={
            <Button variant="outline" onClick={clearFilters}>
              {t("account.orders.clearFilters")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const first = order.items[0]
            const product = first?.product_id ? productsById.get(first.product_id) : undefined
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-soft transition-colors outline-none hover:border-brand/30 focus-visible:ring-2 focus-visible:ring-ring sm:gap-4 sm:p-4"
              >
                <div className="size-16 shrink-0 self-start overflow-hidden rounded-image bg-subtle sm:size-[72px]">
                  {product ? (
                    <ImagePlaceholder
                      seed={product.id}
                      icon={getCategoryIcon(product.categorySlug)}
                      label={lineName(first)}
                      decorative
                      imageUrl={product.image_url}
                      sizes="72px"
                      aspectClassName="size-full"
                      className="rounded-none"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Package aria-hidden className="size-6 text-muted-text" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <p className="font-semibold text-charcoal">
                      {t("account.orders.orderNumber", { number: order.order_number })}
                    </p>
                    <OrderStatus status={order.status} />
                  </div>
                  <p className="text-xs text-muted-text">{formatOrderDate(order.created_at, t.locale)}</p>
                  <p className="truncate text-sm text-muted-text">{itemsSummary(order.items)}</p>
                  <p className="pt-0.5 text-sm font-bold text-charcoal tabular-nums">{formatPrice(order.total, t)}</p>
                </div>
                <ChevronRight aria-hidden className="size-5 shrink-0 text-muted-text" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { AccountOrdersContent }
