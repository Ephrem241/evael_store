import { createClient } from "@/lib/supabase/client"
import { translateDbError } from "@/lib/i18n/db-errors"

// New orders the admin hasn't looked at yet (orders.admin_seen_at is null,
// migration 0023). Admin only: RLS limits anyone else to their own orders, and
// mark_orders_seen refuses non-admins.

export interface OrderAlert {
  id: string
  orderNumber: string
  total: number
  createdAt: string
  customerName: string | null
}

interface AlertRow {
  id: string
  order_number: string
  total: number | string
  created_at: string
  delivery_address: { full_name?: string } | null
}

// Newest first. Capped: the badge shows the count, and nobody has 50 orders
// they haven't opened.
export async function fetchUnseenOrders(): Promise<OrderAlert[]> {
  const { data, error } = await createClient()
    .from("orders")
    .select("id, order_number, total, created_at, delivery_address")
    .is("admin_seen_at", null)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) throw new Error(`Failed to load new orders: ${error.message}`) // i18n-ignore: developer-facing
  return ((data ?? []) as AlertRow[]).map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    total: Number(row.total),
    createdAt: row.created_at,
    customerName: row.delivery_address?.full_name?.trim() || null,
  }))
}

// No ids = every unseen order.
export async function markOrdersSeen(ids?: string[]): Promise<{ success: true } | { success: false; error: string }> {
  const { error } = await createClient().rpc("mark_orders_seen", { p_order_ids: ids ?? null })
  if (error) return { success: false, error: translateDbError(error.message) }
  return { success: true }
}

/** The orders in `current` that weren't known before (`known`): the ones to announce. */
export function newOrderIds(known: ReadonlySet<string>, current: readonly OrderAlert[]): string[] {
  return current.filter((order) => !known.has(order.id)).map((order) => order.id)
}
