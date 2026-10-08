"use client"

import { useRemote, type Remote } from "@/lib/hooks/use-remote"
import { fetchAllOrders, fetchMyOrders, fetchOrder } from "@/lib/services/orders"
import type { OrderRecord } from "@/lib/types/orders"

const loadOrder = (orderId: string) => fetchOrder(orderId)
const loadMyOrders = (userId: string) => fetchMyOrders(userId)
const loadAllOrders = () => fetchAllOrders()

// `data` is `null` when the order doesn't exist / isn't visible to this user.
export function useOrder(orderId: string | undefined): Remote<OrderRecord | null> {
  return useRemote(orderId ?? null, loadOrder)
}

export function useMyOrders(userId: string | undefined): Remote<OrderRecord[]> {
  return useRemote(userId ?? null, loadMyOrders)
}

// `enabled: false` loads nothing yet (the admin search waits until it is used).
export function useAllOrders(enabled = true): Remote<OrderRecord[]> {
  return useRemote(enabled ? "all" : null, loadAllOrders)
}
