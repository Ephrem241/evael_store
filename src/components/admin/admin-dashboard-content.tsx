"use client"

import Link from "next/link"
import { useState, type ReactNode } from "react"
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  ChartColumn,
  ChevronDown,
  ClipboardList,
  ImageIcon,
  Package,
  ShoppingCart,
  Trophy,
  TriangleAlert,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"

import { DashboardSkeleton } from "@/components/feedback/skeletons"
import { nameOf } from "@/lib/i18n/content"
import { useT } from "@/lib/i18n/provider"
import { useAllOrders } from "@/lib/hooks/use-orders"
import { useAdminProducts } from "@/lib/hooks/use-admin-data"
import {
  computeDashboardOverview,
  DASHBOARD_RANGES,
  itemCount,
  type DashboardMetric,
  type DashboardOverview,
  type DashboardRange,
} from "@/lib/admin/dashboard-stats"
import { formatNumber, formatPrice } from "@/lib/currency"
import { formatOrderDate } from "@/lib/date"
import { ORDER_STATUSES } from "@/lib/order-status"
import { getPaymentProvider } from "@/lib/services/payment"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { SalesChart, Sparkline, type SalesMetric } from "@/components/admin/dashboard-charts"
import { OrderStatus } from "@/components/order/order-status"
import { RemoteProductImage } from "@/components/product/remote-product-image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 })

const panel = "rounded-card border border-border bg-card shadow-soft"
const linkClass =
  "inline-flex items-center gap-1 rounded-sm text-sm font-medium text-brand-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"

function PanelHeader({ icon: Icon, title, action, hint }: { icon: LucideIcon; title: string; action?: ReactNode; hint?: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
          <Icon aria-hidden strokeWidth={2} className="size-5 shrink-0 text-brand" />
          {title}
        </h2>
        {hint && <p className="mt-0.5 text-xs text-muted-text">{hint}</p>}
      </div>
      {action}
    </div>
  )
}

function ViewAll({ href }: { href: string }) {
  const t = useT()
  return (
    <Link href={href} className={linkClass}>
      {t("admin.dashboard.viewAll")}
      <ArrowRight aria-hidden className="size-4" />
    </Link>
  )
}

// The change against the period before: an arrow and the percentage, with the
// full sentence for screen readers. Nothing to compare with says so instead.
function Change({ metric, range }: { metric: DashboardMetric; range: DashboardRange }) {
  const t = useT()
  if (metric.change === null) return <p className="text-xs text-muted-text">{t("admin.dashboard.noChange")}</p>

  const up = metric.change >= 0
  const amount = percent.format(Math.abs(metric.change) / 100)
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <p className={cn("flex items-center gap-1 text-sm font-semibold", up ? "text-success" : "text-error")}>
      <Icon aria-hidden className="size-4" />
      <span aria-hidden>{amount}</span>
      <span className="sr-only">{t(up ? "admin.dashboard.changeUp" : "admin.dashboard.changeDown", { change: amount, days: range })}</span>
    </p>
  )
}

function KpiCard({
  icon: Icon,
  iconClass,
  label,
  value,
  footer,
  trend,
}: {
  icon: LucideIcon
  iconClass: string
  label: string
  value: string
  footer: ReactNode
  trend?: number[]
}) {
  return (
    <div className={cn(panel, "flex items-start gap-3 p-4 sm:p-5")}>
      <span aria-hidden className={cn("flex size-11 shrink-0 items-center justify-center rounded-full sm:size-12", iconClass)}>
        <Icon strokeWidth={2} className="size-5 sm:size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-text">{label}</p>
        <p className="mt-0.5 text-xl font-bold break-words text-charcoal tabular-nums sm:text-2xl">{value}</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          {footer}
          {trend && <Sparkline values={trend} className="h-8 w-20 shrink-0 text-brand" />}
        </div>
      </div>
    </div>
  )
}

function RangeMenu({ range, onChange }: { range: DashboardRange; onChange: (range: DashboardRange) => void }) {
  const t = useT()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-11 gap-2 bg-card">
          <CalendarDays aria-hidden className="size-4 text-muted-text" />
          <span className="sr-only">{t("admin.dashboard.rangeLabel")}: </span>
          {t("admin.dashboard.lastDays", { days: range })}
          <ChevronDown aria-hidden className="size-4 text-muted-text" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{t("admin.dashboard.rangeLabel")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={String(range)}
          onValueChange={(value) => {
            const next = DASHBOARD_RANGES.find((r) => String(r) === value)
            if (next) onChange(next)
          }}
        >
          {DASHBOARD_RANGES.map((days) => (
            <DropdownMenuRadioItem key={days} value={String(days)}>
              {t("admin.dashboard.lastDays", { days })}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MetricSwitch({ metric, onChange }: { metric: SalesMetric; onChange: (metric: SalesMetric) => void }) {
  const t = useT()
  return (
    <div role="radiogroup" aria-label={t("admin.dashboard.chartMetric")} className="flex rounded-lg border border-border bg-subtle p-0.5">
      {(["revenue", "orders"] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={metric === m}
          onClick={() => onChange(m)}
          className={cn(
            "h-9 rounded-md px-3 text-sm font-medium text-muted-text outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring max-md:h-10",
            metric === m && "bg-card text-charcoal shadow-soft"
          )}
        >
          {t(m === "revenue" ? "admin.dashboard.revenue" : "admin.dashboard.orders")}
        </button>
      ))}
    </div>
  )
}

function AdminDashboardContent() {
  const t = useT()
  const [range, setRange] = useState<DashboardRange>(30)
  // The time the page was opened: "today" stays put while the admin looks around.
  const [now] = useState(() => new Date())
  const { data: orders, loading: ordersLoading } = useAllOrders()
  const { data: products, loading: productsLoading } = useAdminProducts()

  const header = (
    <AdminPageHeader
      title={t("admin.dashboard.title")}
      description={t("admin.dashboard.subtitle")}
      actions={<RangeMenu range={range} onChange={setRange} />}
    />
  )

  if (ordersLoading || productsLoading) {
    return (
      <div className="space-y-6">
        {header}
        <DashboardSkeleton />
      </div>
    )
  }
  if (!orders || !products) {
    return (
      <div className="space-y-6">
        {header}
        <p className="text-sm text-error">{t("admin.loadFailed.dashboard")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {header}
      <DashboardBody stats={computeDashboardOverview(orders, products, range, now)} />
    </div>
  )
}

// Everything under the header, from the computed numbers.
function DashboardBody({ stats }: { stats: DashboardOverview }) {
  const t = useT()
  const [metric, setMetric] = useState<SalesMetric>("revenue")
  const range = stats.range
  const money = (amount: number) => formatPrice(amount, t)
  const hasSales = stats.days.some((d) => d.orders > 0)
  const lowCount = stats.lowStockProducts.length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <KpiCard
          icon={Banknote}
          iconClass="bg-success-tint text-success"
          label={t("admin.dashboard.totalRevenue")}
          value={money(stats.revenue.value)}
          footer={<Change metric={stats.revenue} range={range} />}
          trend={stats.days.map((d) => d.revenue)}
        />
        <KpiCard
          icon={ShoppingCart}
          iconClass="bg-brand-soft text-brand-ink"
          label={t("admin.dashboard.orders")}
          value={formatNumber(stats.orders.value)}
          footer={<Change metric={stats.orders} range={range} />}
          trend={stats.days.map((d) => d.orders)}
        />
        <KpiCard
          icon={ChartColumn}
          iconClass="bg-subtle text-gold-ink"
          label={t("admin.dashboard.averageOrder")}
          value={money(stats.averageOrder.value)}
          footer={<Change metric={stats.averageOrder} range={range} />}
        />
        <KpiCard
          icon={Package}
          iconClass="bg-warning-tint text-warning-text"
          label={t("admin.dashboard.productsInStock")}
          value={formatNumber(stats.productsInStock)}
          footer={
            lowCount > 0 ? (
              <p className="flex items-center gap-1 text-sm font-semibold text-error">
                <TriangleAlert aria-hidden className="size-4" />
                {t.plural("admin.dashboard.lowStockCount", lowCount)}
              </p>
            ) : (
              <p className="text-xs text-muted-text">{t("admin.dashboard.allInStock")}</p>
            )
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-6">
        <section className={cn(panel, "space-y-5 p-4 sm:p-5")}>
          <PanelHeader
            icon={ChartColumn}
            title={t("admin.dashboard.salesPerformance")}
            action={<MetricSwitch metric={metric} onChange={setMetric} />}
          />
          {hasSales ? (
            <SalesChart days={stats.days} metric={metric} formatMoney={money} />
          ) : (
            <p className="flex h-56 items-center justify-center rounded-lg bg-subtle text-sm text-muted-text sm:h-64">
              {t("admin.dashboard.noSales")}
            </p>
          )}
        </section>

        <section className={cn(panel, "space-y-3 p-4 sm:p-5")}>
          <PanelHeader
            icon={ClipboardList}
            title={t("admin.dashboard.orderStatus")}
            hint={t("admin.dashboard.orderStatusHint", { days: range })}
            action={<ViewAll href="/admin/orders" />}
          />
          <ul className="divide-y divide-border">
            {ORDER_STATUSES.map((status) => (
              <li key={status} className="flex items-center justify-between gap-3 py-2.5">
                <OrderStatus status={status} tone="admin" className="text-sm" />
                <span className="text-lg font-bold text-charcoal tabular-nums">{formatNumber(stats.statusCounts[status])}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-6">
        <section className={cn(panel, "min-w-0 space-y-4 p-4 sm:p-5")}>
          <PanelHeader icon={ShoppingCart} title={t("admin.dashboard.recentOrders")} action={<ViewAll href="/admin/orders" />} />
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-text">{t("admin.dashboard.noOrders")}</p>
          ) : (
            <>
              {/* Phones: one card per order. */}
              <ul className="divide-y divide-border md:hidden">
                {stats.recentOrders.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="flex items-start justify-between gap-3 rounded-md py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="min-w-0">
                        <span className="block font-semibold text-charcoal">#{o.order_number}</span>
                        <span className="block truncate text-sm text-charcoal">{o.delivery_address.full_name}</span>
                        <span className="block text-xs text-muted-text">
                          {formatOrderDate(o.created_at, t.locale)} · {t.plural("admin.dashboard.itemCount", itemCount(o))}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="font-semibold text-charcoal tabular-nums">{money(o.total)}</span>
                        <OrderStatus status={o.status} tone="admin" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="hidden md:block">
                <Table label={t("admin.dashboard.recentOrders")}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.dashboard.orderId")}</TableHead>
                      <TableHead>{t("admin.dashboard.customer")}</TableHead>
                      <TableHead>{t("admin.dashboard.date")}</TableHead>
                      <TableHead>{t("admin.dashboard.items")}</TableHead>
                      <TableHead className="text-right">{t("admin.dashboard.total")}</TableHead>
                      <TableHead className="max-2xl:hidden">{t("admin.dashboard.payment")}</TableHead>
                      <TableHead>{t("admin.dashboard.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentOrders.map((o) => {
                      const provider = getPaymentProvider(o.payment_method)
                      return (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            <Link href={`/admin/orders/${o.id}`} className="rounded-sm text-brand-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                              #{o.order_number}
                            </Link>
                          </TableCell>
                          <TableCell className="max-w-44 truncate">{o.delivery_address.full_name}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatOrderDate(o.created_at, t.locale)}</TableCell>
                          <TableCell className="whitespace-nowrap">{t.plural("admin.dashboard.itemCount", itemCount(o))}</TableCell>
                          <TableCell className="text-right whitespace-nowrap tabular-nums">{money(o.total)}</TableCell>
                          <TableCell className="whitespace-nowrap max-2xl:hidden">{provider ? t(provider.label) : o.payment_method}</TableCell>
                          <TableCell>
                            <OrderStatus status={o.status} tone="admin" />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </section>

        <div className="space-y-4 xl:space-y-6">
          <section className={cn(panel, "space-y-3 p-4 sm:p-5")}>
            <PanelHeader icon={Trophy} title={t("admin.dashboard.topSelling")} action={<ViewAll href="/admin/products" />} />
            {stats.topProducts.length === 0 ? (
              <p className="text-sm text-muted-text">{t("admin.dashboard.noTopSelling")}</p>
            ) : (
              <ul className="space-y-1">
                {stats.topProducts.map((item) => {
                  const name = item.product ? nameOf(item.product, t.locale) : item.name
                  const body = (
                    <>
                      <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-subtle">
                        <ImageIcon aria-hidden className="size-5 text-muted-text" />
                        {item.product?.image_url && <RemoteProductImage src={item.product.image_url} alt="" sizes="48px" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-charcoal">{name}</span>
                        <span className="block text-xs text-muted-text">
                          {t.plural("admin.dashboard.soldCount", item.quantity)} · <span className="tabular-nums">{money(item.revenue)}</span>
                        </span>
                      </span>
                    </>
                  )
                  return (
                    <li key={item.productId ?? item.name}>
                      {item.product ? (
                        <Link
                          href={`/admin/products/${item.product.id}/edit`}
                          className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 outline-none hover:bg-subtle focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {body}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 py-1.5">{body}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {lowCount > 0 && (
            <section className="space-y-3 rounded-card border border-warning/30 bg-warning-tint p-4 sm:p-5">
              <h2 className="flex items-center gap-2 font-semibold text-error">
                <TriangleAlert aria-hidden className="size-5" />
                {t("admin.dashboard.lowStock")}
              </h2>
              <p className="text-sm text-charcoal">{t.plural("admin.dashboard.lowStockText", lowCount)}</p>
              <ul className="space-y-1 text-sm">
                {stats.lowStockProducts.slice(0, 3).map((p) => (
                  <li key={p.id} className="flex justify-between gap-3">
                    <span className="truncate text-charcoal">{nameOf(p, t.locale)}</span>
                    <span className="shrink-0 font-medium text-warning-text">{t("admin.dashboard.left", { count: p.stock })}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="sm" className="w-full sm:w-auto">
                <Link href="/admin/products">{t("admin.dashboard.viewProducts")}</Link>
              </Button>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export { AdminDashboardContent, DashboardBody }
