"use client"

import { TableSkeleton } from "@/components/feedback/skeletons"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"
import { ShoppingCart } from "lucide-react"

import { useT } from "@/lib/i18n/provider"
import type { OrderStatus as Status } from "@/lib/types/orders"
import { useAllOrders } from "@/lib/hooks/use-orders"
import { useProfiles } from "@/lib/hooks/use-admin-data"
import { updateOrderStatus } from "@/lib/services/orders"
import { useOrderAlertsStore } from "@/lib/store/order-alerts"
import { getPaymentProvider } from "@/lib/services/payment"
import { statusMenuOptions } from "@/lib/order-status"
import { formatOrderDate } from "@/lib/date"
import { formatPrice } from "@/lib/currency"
import { OrderStatus } from "@/components/order/order-status"
import { EmptyState } from "@/components/feedback/empty-state"
import { CommitSelect } from "@/components/forms/commit-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

function AdminOrdersContent() {
  const t = useT()
  const { data: orders, loading: ordersLoading, reload } = useAllOrders()
  const { data: profiles, loading: profilesLoading } = useProfiles()
  const unseen = useOrderAlertsStore((s) => s.unseen)
  const markSeen = useOrderAlertsStore((s) => s.markSeen)
  const unseenIds = useMemo(() => new Set(unseen.map((order) => order.id)), [unseen])

  // A new order the watcher found that this list doesn't have yet: reload, so
  // it appears without a page refresh.
  useEffect(() => {
    if (orders && unseen.some((alert) => !orders.some((order) => order.id === alert.id))) reload()
  }, [orders, unseen, reload])

  if (ordersLoading || profilesLoading) return <TableSkeleton columns={7} />

  if (!orders || !profiles) {
    return <p className="text-sm text-error">{t("admin.loadFailed.orders")}</p>
  }

  if (orders.length === 0) {
    return <EmptyState icon={ShoppingCart} title={t("admin.orders.empty")} />
  }

  const sorted = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  async function handleStatusChange(orderId: string, next: Status) {
    const result = await updateOrderStatus(orderId, next)
    if (!result.success) toast.error(result.error)
    // Reload either way: on a refused change the dropdown must snap back to
    // the order's real status.
    reload()
  }

  async function handleMarkAllSeen() {
    const result = await markSeen()
    if (!result.success) toast.error(result.error)
  }

  return (
    <div className="space-y-4">
      {unseenIds.size > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleMarkAllSeen}>
            {t("admin.orderAlerts.markAllSeen")}
          </Button>
        </div>
      )}
      <Table label={t("admin.orders.title")}>
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.orders.columns.order")}</TableHead>
            <TableHead>{t("admin.orders.columns.customer")}</TableHead>
            <TableHead>{t("admin.orders.columns.date")}</TableHead>
            <TableHead>{t("admin.orders.columns.total")}</TableHead>
            <TableHead>{t("admin.orders.columns.payment")}</TableHead>
            <TableHead>{t("admin.orders.columns.status")}</TableHead>
            <TableHead>
              <span className="sr-only">{t("common.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((order) => {
            const customer = profiles.find((p) => p.id === order.user_id)
            const isTerminal = order.status === "delivered" || order.status === "cancelled"
            return (
              <TableRow key={order.id}>
                <TableCell className="whitespace-nowrap font-medium">
                  <div className="flex items-center gap-2">
                    {order.order_number}
                    {unseenIds.has(order.id) && <Badge className="bg-brand-strong text-white">{t("admin.orderAlerts.newBadge")}</Badge>}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">{customer?.fullName ?? t("admin.orders.deletedUser")}</TableCell>
                <TableCell className="whitespace-nowrap">{formatOrderDate(order.created_at, t.locale)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatPrice(order.total, t)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {(() => {
                    const provider = getPaymentProvider(order.payment_method)
                    return provider ? t(provider.label) : order.payment_method
                  })()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <OrderStatus status={order.status} />
                    <CommitSelect
                      value={order.status}
                      disabled={isTerminal}
                      onCommit={(next) => handleStatusChange(order.id, next as Status)}
                      aria-label={t("admin.orders.changeStatus", { number: order.order_number })}
                      className="h-7 rounded-lg border border-input bg-transparent px-1.5 text-xs text-charcoal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {statusMenuOptions(order.status).map((status) => (
                        <option key={status} value={status}>
                          {t(`order.status.${status}`)}
                        </option>
                      ))}
                    </CommitSelect>
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`/admin/orders/${order.id}`} className="text-sm text-brand-ink hover:underline">
                    {t("admin.orders.view")}
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export { AdminOrdersContent }
