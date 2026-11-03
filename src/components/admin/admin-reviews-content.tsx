"use client"

import { CardListSkeleton } from "@/components/feedback/skeletons"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { MessageSquare } from "lucide-react"
import { cn } from "cn"

import { nameOf } from "@/lib/i18n/content"
import { useT } from "@/lib/i18n/provider"
import { useAdminReviews } from "@/lib/hooks/use-admin-data"
import { deleteAdminReview, setReviewApproved } from "@/lib/services/admin-reviews"
import { formatOrderDate } from "@/lib/date"
import { EmptyState } from "@/components/feedback/empty-state"
import { Rating } from "@/components/product/rating"
import { Button } from "@/components/ui/button"

type Filter = "pending" | "approved"

// Moderation: customers' comments wait under Pending until approved here, and
// only then appear on the product page.
function AdminReviewsContent() {
  const t = useT()
  const { data: reviews, loading, reload } = useAdminReviews()
  const [filter, setFilter] = useState<Filter>("pending")

  if (loading) return <CardListSkeleton />

  if (!reviews) {
    return <p className="text-sm text-error">{t("admin.loadFailed.reviews")}</p>
  }

  if (reviews.length === 0) {
    return <EmptyState icon={MessageSquare} title={t("admin.reviews.empty")} />
  }

  async function handleApprove(id: string, next: boolean) {
    const result = await setReviewApproved(id, next)
    if (!result.success) toast.error(result.error)
    reload()
  }

  async function handleDelete(id: string) {
    const result = await deleteAdminReview(id)
    if (!result.success) toast.error(result.error)
    reload()
  }

  const pendingCount = reviews.filter((review) => !review.isApproved).length
  const shown = reviews.filter((review) => (filter === "pending" ? !review.isApproved : review.isApproved))

  return (
    <div className="space-y-4">
      <div role="group" aria-label={t("admin.reviews.filterLabel")} className="flex gap-2">
        {(["pending", "approved"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              filter === value
                ? "border-brand bg-brand-strong text-white"
                : "border-input bg-card text-charcoal hover:bg-subtle"
            )}
          >
            {value === "pending" ? t("admin.reviews.filterPending") : t("admin.reviews.filterApproved")}
            {value === "pending" && pendingCount > 0 && ` (${pendingCount})`}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={MessageSquare} title={t("admin.reviews.emptyFilter")} />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
          {shown.map((review) => (
            <li key={review.id} className="space-y-2 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                {review.product ? (
                  <Link
                    href={`/product/${review.product.slug}`}
                    className="min-w-0 truncate rounded-sm font-medium text-charcoal underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {nameOf(review.product, t.locale)}
                  </Link>
                ) : (
                  <span />
                )}
                <span className="shrink-0 text-xs text-muted-text">{formatOrderDate(review.createdAt, t.locale)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Rating value={review.rating} t={t} />
                <span className="text-sm text-muted-text">{review.authorName || t("product.reviews.anonymous")}</span>
              </div>
              <p className="text-sm leading-relaxed wrap-anywhere whitespace-pre-line text-charcoal">{review.comment}</p>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant={review.isApproved ? "outline" : "default"}
                  onClick={() => handleApprove(review.id, !review.isApproved)}
                >
                  {review.isApproved ? t("admin.reviews.unapprove") : t("admin.reviews.approve")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(review.id)}>
                  {t("admin.reviews.delete")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { AdminReviewsContent }
