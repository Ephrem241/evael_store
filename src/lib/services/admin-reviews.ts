import { createClient } from "@/lib/supabase/client"
import { translateDbError } from "@/lib/i18n/db-errors"

// The admin's moderation queue. Admins read every review through RLS; only an
// admin's update can set is_approved (guard_review, 0026).

export interface AdminReview {
  id: string
  authorName: string
  rating: number
  comment: string
  isApproved: boolean
  createdAt: string
  product: { slug: string; name_en: string; name_am: string } | null
}

interface AdminReviewRow {
  id: string
  author_name: string
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
  product: { slug: string; name_en: string; name_am: string } | null
}

type Result = { success: true } | { success: false; error: string }

// Newest first.
export async function fetchAdminReviews(): Promise<AdminReview[]> {
  const { data, error } = await createClient()
    .from("reviews")
    .select("id, author_name, rating, comment, is_approved, created_at, product:products(slug, name_en, name_am)")
    .order("created_at", { ascending: false })
  if (error) throw new Error(`Failed to load reviews: ${error.message}`) // i18n-ignore: developer-facing
  return (data as unknown as AdminReviewRow[]).map((row) => ({
    id: row.id,
    authorName: row.author_name,
    rating: row.rating,
    comment: row.comment ?? "",
    isApproved: row.is_approved,
    createdAt: row.created_at,
    product: row.product,
  }))
}

export async function setReviewApproved(id: string, isApproved: boolean): Promise<Result> {
  const { error } = await createClient().from("reviews").update({ is_approved: isApproved }).eq("id", id)
  if (error) return { success: false, error: translateDbError(error.message) }
  return { success: true }
}

export async function deleteAdminReview(id: string): Promise<Result> {
  const { error } = await createClient().from("reviews").delete().eq("id", id)
  if (error) return { success: false, error: translateDbError(error.message) }
  return { success: true }
}
