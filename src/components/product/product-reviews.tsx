"use client"

import Link from "next/link"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { MessageSquare, Star } from "lucide-react"
import { cn } from "cn"

import { formatOrderDate } from "@/lib/date"
import { useT } from "@/lib/i18n/provider"
import { useRemote } from "@/lib/hooks/use-remote"
import { deleteReview, fetchProductReviews, saveReview, summarizeReviews, type ProductReview } from "@/lib/services/reviews"
import { useAuthStore } from "@/lib/store/auth"
import { reviewSchema, type ReviewValues } from "@/components/product/review-schema"
import { EmptyState } from "@/components/feedback/empty-state"
import { FormField } from "@/components/forms/form-field"
import { Rating } from "@/components/product/rating"
import { Button } from "@/components/ui/button"

const STARS = [1, 2, 3, 4, 5]

const loadReviews = (productId: string) => fetchProductReviews(productId)

// Five real radio buttons, drawn as stars: arrows change the rating and a
// screen reader hears "3 out of 5".
function StarPicker({ value, onChange, error }: { value: number; onChange: (next: number) => void; error?: string }) {
  const t = useT()

  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium text-charcoal">{t("product.reviews.yourRating")}</legend>
      <div className="flex gap-0.5">
        {STARS.map((star) => (
          <label key={star} className="relative flex size-11 cursor-pointer items-center justify-center rounded-lg has-focus-visible:ring-2 has-focus-visible:ring-ring">
            <input
              type="radio"
              name="review-rating"
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label={t("product.rated", { value: star })}
            />
            <Star aria-hidden className={cn("size-7", star <= value ? "fill-star text-star" : "fill-none text-charcoal/30")} />
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
    </fieldset>
  )
}

function ReviewForm({
  userId,
  productId,
  existing,
  onSaved,
  onCancel,
}: {
  userId: string
  productId: string
  existing?: ProductReview
  onSaved: () => void
  onCancel?: () => void
}) {
  const t = useT()
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: existing?.rating ?? 0, comment: existing?.comment ?? "" },
  })
  const rating = useWatch({ control, name: "rating" })

  async function onSubmit(values: ReviewValues) {
    const result = await saveReview({ userId, productId, ...values })
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(t("product.reviews.sent"))
    onSaved()
  }

  return (
    <form method="post" onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-xl space-y-4 rounded-card border border-border bg-card p-4">
      <StarPicker
        value={rating}
        onChange={(next) => setValue("rating", next, { shouldValidate: true })}
        error={errors.rating?.message}
      />
      <FormField
        id="review-comment"
        required
        multiline
        rows={4}
        label={t("product.reviews.yourComment")}
        registration={register("comment")}
        error={errors.comment?.message}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("product.reviews.sending") : t("product.reviews.send")}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t("product.reviews.cancel")}
          </Button>
        )}
      </div>
    </form>
  )
}

function ReviewCard({ review, children }: { review: ProductReview; children?: React.ReactNode }) {
  const t = useT()

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-sm font-medium text-charcoal">{review.authorName || t("product.reviews.anonymous")}</span>
        <Rating value={review.rating} t={t} />
        <span className="text-xs text-muted-text">{formatOrderDate(review.createdAt, t.locale)}</span>
      </div>
      <p className="text-sm leading-relaxed wrap-anywhere whitespace-pre-line text-muted-text">{review.comment}</p>
      {children}
    </div>
  )
}

// The product page's Reviews tab: customers' comments and star ratings, and
// the form to add one (signed-in customers, one per product). A new or edited
// comment is seen only by its author, marked as waiting, until an admin
// approves it on /admin/reviews.
function ProductReviews({ productId, productSlug }: { productId: string; productSlug: string }) {
  const t = useT()
  const user = useAuthStore((s) => s.user)
  const { data: reviews, loading, reload } = useRemote(productId, loadReviews)
  const [editing, setEditing] = useState(false)

  if (loading) return <p className="text-sm text-muted-text">{t("product.reviews.loading")}</p>
  if (!reviews) return <p className="text-sm text-error">{t("product.reviews.loadFailed")}</p>

  const own = user ? reviews.find((review) => review.userId === user.id) : undefined
  // An admin's RLS returns every pending review too; those belong on /admin/reviews.
  const published = reviews.filter((review) => review.isApproved && review.id !== own?.id)
  const summary = summarizeReviews(reviews)

  async function handleDelete(id: string) {
    const result = await deleteReview(id)
    if (!result.success) toast.error(result.error)
    reload()
  }

  return (
    <div className="space-y-6">
      {summary && (
        <div className="flex items-center gap-3">
          <Rating value={summary.average} t={t} />
          <span className="text-sm text-muted-text">{t.plural("product.reviews.count", summary.count)}</span>
        </div>
      )}

      {!user ? (
        <p className="text-sm text-muted-text">
          <Link
            href={`/login?redirect=/product/${productSlug}`}
            className="rounded-sm font-medium text-brand-ink underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("product.reviews.signIn")}
          </Link>
        </p>
      ) : !own || editing ? (
        <ReviewForm
          key={own?.id ?? "new"}
          userId={user.id}
          productId={productId}
          existing={own}
          onSaved={() => {
            setEditing(false)
            reload()
          }}
          onCancel={own ? () => setEditing(false) : undefined}
        />
      ) : (
        <div className="max-w-xl rounded-card border border-border bg-card p-4">
          <ReviewCard review={own}>
            {!own.isApproved && <p className="text-xs font-medium text-warning-text">{t("product.reviews.pending")}</p>}
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                {t("product.reviews.edit")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(own.id)}>
                {t("product.reviews.delete")}
              </Button>
            </div>
          </ReviewCard>
        </div>
      )}

      {published.length > 0 ? (
        <ul className="max-w-3xl divide-y divide-border">
          {published.map((review) => (
            <li key={review.id} className="py-4 first:pt-0">
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      ) : (
        !own && (
          <EmptyState
            icon={MessageSquare}
            title={t("product.reviews.empty")}
            description={t("product.reviews.emptyText")}
            className="py-10 sm:py-12"
          />
        )
      )}
    </div>
  )
}

export { ProductReviews }
