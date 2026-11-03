import { translateDbError } from "@/lib/i18n/db-errors"

// Customers' comments and feedback on a product (public.reviews, 0026). RLS
// returns approved reviews plus the reader's own; the database keeps a new or
// edited review unapproved until an admin approves it (/admin/reviews).

export interface ProductReview {
  id: string
  userId: string
  authorName: string
  rating: number
  comment: string
  isApproved: boolean
  createdAt: string
}

interface ReviewRow {
  id: string
  user_id: string
  author_name: string
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
}

type Result = { success: true } | { success: false; error: string }

// Average of the approved reviews, rounded to one decimal. Pending ones don't count.
export function summarizeReviews(reviews: Pick<ProductReview, "rating" | "isApproved">[]): { average: number; count: number } | null {
  const approved = reviews.filter((review) => review.isApproved)
  if (approved.length === 0) return null
  const total = approved.reduce((sum, review) => sum + review.rating, 0)
  return { average: Math.round((total / approved.length) * 10) / 10, count: approved.length }
}

// Loaded on demand, like the contact form: most visitors never open the tab.
async function client() {
  const { createClient } = await import("@/lib/supabase/client")
  return createClient()
}

// Newest first.
export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  const { data, error } = await (await client())
    .from("reviews")
    .select("id, user_id, author_name, rating, comment, is_approved, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(`Failed to load reviews: ${error.message}`) // i18n-ignore: developer-facing
  return (data as ReviewRow[]).map((row) => ({
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name,
    rating: row.rating,
    comment: row.comment ?? "",
    isApproved: row.is_approved,
    createdAt: row.created_at,
  }))
}

// One review per customer per product: sending again replaces their own.
export async function saveReview(input: { userId: string; productId: string; rating: number; comment: string }): Promise<Result> {
  const { error } = await (await client())
    .from("reviews")
    .upsert(
      { user_id: input.userId, product_id: input.productId, rating: input.rating, comment: input.comment },
      { onConflict: "user_id,product_id" }
    )
  if (error) return { success: false, error: translateDbError(error.message) }
  return { success: true }
}

export async function deleteReview(id: string): Promise<Result> {
  const { error } = await (await client()).from("reviews").delete().eq("id", id)
  if (error) return { success: false, error: translateDbError(error.message) }
  return { success: true }
}
