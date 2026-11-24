"use client"

import { CardListSkeleton } from "@/components/feedback/skeletons"
import { useState } from "react"
import { toast } from "sonner"
import { BadgePercent, Pencil, Plus, Trash2 } from "lucide-react"
import { cn } from "cn"

import { nameOf } from "@/lib/i18n/content"
import { useT } from "@/lib/i18n/provider"
import { useAdminCategories, useAdminSaleEvents } from "@/lib/hooks/use-admin-data"
import {
  createSaleEvent,
  deleteSaleEvent,
  setSaleEventActive,
  updateSaleEvent,
  type SaleEventFormValues,
} from "@/lib/services/admin-sale-events"
import { fromAddisInput, saleStatus, toAddisInput, type SaleEvent, type SaleStatus } from "@/lib/sale-events"
import { formatOrderDateTime } from "@/lib/date"
import { SaleEventForm } from "@/components/admin/sale-event-form"
import type { SaleEventValues } from "@/components/admin/sale-event-schema"
import { EmptyState } from "@/components/feedback/empty-state"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const STATUS_STYLE: Record<SaleStatus, string> = {
  running: "bg-success text-white",
  scheduled: "bg-brand-soft text-brand-ink",
  ended: "bg-subtle text-muted-text",
  off: "bg-subtle text-muted-text",
}

function toFormValues(event?: SaleEvent): SaleEventValues {
  return {
    name_en: event?.name_en ?? "",
    name_am: event?.name_am ?? "",
    tagline_en: event?.tagline_en ?? "",
    tagline_am: event?.tagline_am ?? "",
    discount_percent: event?.discount_percent ?? 10,
    category_id: event?.category_id ?? "",
    // A new sale starts now; the admin chooses when it ends.
    starts_at: toAddisInput(event?.starts_at ?? new Date().toISOString()),
    ends_at: event ? toAddisInput(event.ends_at) : "",
    is_active: event?.is_active ?? true,
  }
}

function toInput(values: SaleEventValues): SaleEventFormValues {
  return {
    ...values,
    category_id: values.category_id || null,
    starts_at: fromAddisInput(values.starts_at),
    ends_at: fromAddisInput(values.ends_at),
  }
}

// Holiday and special sales: N% off the whole shop or one category, between
// two dates. While one runs, the shop shows its banner and countdown and every
// price it covers is lowered, and checkout charges the lower price (the
// database works it out, place_order). Where two overlap, a product gets the
// bigger discount.
function AdminSalesContent() {
  const t = useT()
  const { data: events, loading, reload } = useAdminSaleEvents()
  const { data: categories = [] } = useAdminCategories()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SaleEvent | null>(null)
  // Read once per visit: the statuses don't need to tick.
  const [now] = useState(() => Date.now())

  if (loading) return <CardListSkeleton />
  if (!events) return <p className="text-sm text-error">{t("admin.loadFailed.sales")}</p>

  function openNew() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(event: SaleEvent) {
    setEditing(event)
    setDialogOpen(true)
  }

  async function handleSubmit(values: SaleEventValues) {
    const input = toInput(values)
    const result = editing ? await updateSaleEvent(editing.id, input) : await createSaleEvent(input)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(editing ? t("admin.sales.updated") : t("admin.sales.created"))
    setDialogOpen(false)
    reload()
  }

  async function handleToggle(id: string, next: boolean) {
    const result = await setSaleEventActive(id, next)
    if (!result.success) toast.error(result.error)
    reload()
  }

  async function handleDelete(event: SaleEvent) {
    const result = await deleteSaleEvent(event.id)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(t("admin.sales.removed", { name: nameOf(event, t.locale) }))
    reload()
  }

  function scopeLabel(event: SaleEvent): string {
    if (!event.category_id) return t("admin.sales.wholeShop")
    const category = categories.find((c) => c.id === event.category_id)
    return category ? nameOf(category, t.locale) : t("admin.sales.oneCategory")
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus aria-hidden />
          {t("admin.sales.add")}
        </Button>
      </div>

      {events.length === 0 ? (
        <EmptyState icon={BadgePercent} title={t("admin.sales.emptyTitle")} description={t("admin.sales.emptyText")} />
      ) : (
        <ul className="space-y-3">
          {events.map((event) => {
            const status = saleStatus(event, now)
            const name = nameOf(event, t.locale)
            return (
              <li
                key={event.id}
                className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-soft sm:flex-row sm:items-center"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-strong text-sm font-bold text-white">
                  {t("admin.sales.percentOff", { percent: event.discount_percent })}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-charcoal">{name}</p>
                    <span className={cn("inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold", STATUS_STYLE[status])}>
                      {t(`admin.sales.status.${status}`)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-text">
                    {scopeLabel(event)} ·{" "}
                    {t("admin.sales.dates", {
                      start: formatOrderDateTime(event.starts_at, t.locale),
                      end: formatOrderDateTime(event.ends_at, t.locale),
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={event.is_active}
                    onCheckedChange={(checked) => handleToggle(event.id, checked)}
                    aria-label={t("admin.sales.toggle", { name })}
                  />
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(event)} aria-label={t("admin.sales.edit", { name })}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(event)} aria-label={t("admin.sales.delete", { name })}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? t("admin.sales.dialogEdit") : t("admin.sales.dialogAdd")}</DialogTitle>
            <DialogDescription>{t("admin.sales.dialogHint")}</DialogDescription>
          </DialogHeader>
          <SaleEventForm
            key={editing?.id ?? "new"}
            initialValues={toFormValues(editing ?? undefined)}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { AdminSalesContent }
