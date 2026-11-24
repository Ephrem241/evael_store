import { createClient } from "@/lib/supabase/client"
import { translate } from "@/lib/i18n/translate"
import type { SaleEvent } from "@/lib/sale-events"

// Admin management of holiday / special sale events (the sale_events table,
// migration 0029). RLS lets only admins write; a refused write affects zero
// rows rather than erroring, so every write asks for its rows back and treats
// none as "not allowed" (as admin-catalog.ts does).

export interface SaleEventFormValues {
  name_en: string
  name_am: string
  tagline_en: string
  tagline_am: string
  discount_percent: number
  /** null: the whole shop. */
  category_id: string | null
  /** ISO timestamps. */
  starts_at: string
  ends_at: string
  is_active: boolean
}

type Result<T = undefined> = { success: true; data: T } | { success: false; error: string }

function failure(code?: string): { success: false; error: string } {
  if (code === "23514") return { success: false, error: translate("admin.errors.outOfRange") }
  if (code === "23503") return { success: false, error: translate("admin.errors.invalidCategory") }
  return { success: false, error: translate("common.somethingWentWrong") }
}

function columns(input: SaleEventFormValues) {
  return {
    name_en: input.name_en.trim(),
    name_am: input.name_am.trim(),
    tagline_en: input.tagline_en.trim(),
    tagline_am: input.tagline_am.trim(),
    discount_percent: Math.round(input.discount_percent),
    category_id: input.category_id || null,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    is_active: input.is_active,
  }
}

// Every event, the newest start first.
export async function fetchAdminSaleEvents(): Promise<SaleEvent[]> {
  const { data, error } = await createClient()
    .from("sale_events")
    .select("*")
    .order("starts_at", { ascending: false })
  if (error) throw new Error(`Failed to load sale events: ${error.message}`) // i18n-ignore: developer-facing
  return (data ?? []) as SaleEvent[]
}

export async function createSaleEvent(input: SaleEventFormValues): Promise<Result<SaleEvent>> {
  const { data, error } = await createClient().from("sale_events").insert(columns(input)).select("*").single()
  if (error) return failure(error.code)
  return { success: true, data: data as SaleEvent }
}

export async function updateSaleEvent(id: string, input: SaleEventFormValues): Promise<Result<SaleEvent>> {
  const { data, error } = await createClient().from("sale_events").update(columns(input)).eq("id", id).select("*")
  if (error) return failure(error.code)
  if (!data || data.length === 0) return { success: false, error: translate("errors.notAllowed") }
  return { success: true, data: data[0] as SaleEvent }
}

export async function setSaleEventActive(id: string, isActive: boolean): Promise<Result> {
  const { data, error } = await createClient().from("sale_events").update({ is_active: isActive }).eq("id", id).select("id")
  if (error) return failure(error.code)
  if (!data || data.length === 0) return { success: false, error: translate("errors.notAllowed") }
  return { success: true, data: undefined }
}

export async function deleteSaleEvent(id: string): Promise<Result> {
  const { data, error } = await createClient().from("sale_events").delete().eq("id", id).select("id")
  if (error) return failure(error.code)
  if (!data || data.length === 0) return { success: false, error: translate("errors.notAllowed") }
  return { success: true, data: undefined }
}
