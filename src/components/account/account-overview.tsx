"use client"

import Link from "next/link"
import { ArrowRight, ChevronRight, Heart, MapPin, Package, Settings } from "lucide-react"

import { formatPrice } from "@/lib/currency"
import { formatOrderDate } from "@/lib/date"
import { useT } from "@/lib/i18n/provider"
import type { MessageKey } from "@/lib/i18n/translator"
import { useMyOrders } from "@/lib/hooks/use-orders"
import type { AuthUser } from "@/lib/store/auth"
import { OrderStatus } from "@/components/order/order-status"
import { Skeleton } from "@/components/ui/skeleton"

const RECENT = 3

const SHORTCUTS: { href: string; label: MessageKey; icon: typeof Package }[] = [
  { href: "/account/orders", label: "account.nav.orders", icon: Package },
  { href: "/account/favorites", label: "account.nav.favorites", icon: Heart },
  { href: "/account/addresses", label: "account.nav.addresses", icon: MapPin },
  { href: "/account/settings", label: "account.nav.settings", icon: Settings },
]

// The top of /account: a greeting, the latest orders (their real status and
// total, each a link to the order) and one-tap shortcuts to the other parts
// of the account. The profile form follows below it on the same page.
function AccountOverview({ user }: { user: AuthUser }) {
  const t = useT()
  const { data: orders, loading } = useMyOrders(user.id)
  const recent = (orders ?? []).slice(0, RECENT)
  const firstName = user.fullName.trim().split(/\s+/)[0] || user.fullName

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-brand/15 bg-brand-soft px-5 py-5 sm:px-6">
        <p className="text-xl font-bold tracking-tight text-charcoal">{t("account.overview.greeting", { name: firstName })}</p>
        <p className="mt-1 text-sm text-charcoal/75">{t("account.overview.intro")}</p>
      </section>

      <section aria-labelledby="recent-orders-heading" className="rounded-card border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 id="recent-orders-heading" className="text-lg font-bold tracking-tight text-charcoal">
            {t("account.overview.recentOrders")}
          </h2>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 rounded-md text-sm font-semibold text-brand-ink underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 max-lg:min-h-11"
          >
            {t("account.overview.allOrders")}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        {loading ? (
          <div aria-busy className="space-y-3 p-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-start gap-3 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-text">{t("account.orders.emptyText")}</p>
            <Link
              href="/shop"
              className="text-sm font-semibold text-brand-ink underline-offset-4 hover:underline"
            >
              {t("account.orders.startShopping")}
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors outline-none hover:bg-subtle/60 focus-visible:bg-subtle"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-subtle text-brand">
                    <Package aria-hidden className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-charcoal">
                      {t("account.orders.orderNumber", { number: order.order_number })}
                    </span>
                    <span className="block text-xs text-muted-text">{formatOrderDate(order.created_at, t.locale)}</span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-charcoal">{formatPrice(order.total, t)}</span>
                    <OrderStatus status={order.status} />
                  </span>
                  <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-text max-sm:hidden" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* A list, not a <nav>: the account menu beside it is the navigation. */}
      <div>
        <ul aria-label={t("account.overview.shortcuts")} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SHORTCUTS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col items-start gap-3 rounded-card border border-border bg-card p-4 text-sm font-semibold text-charcoal shadow-soft transition-[border-color,box-shadow] outline-none hover:border-brand/40 hover:shadow-lift focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <item.icon aria-hidden className="size-5" strokeWidth={1.75} />
                </span>
                {t(item.label)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export { AccountOverview }
