"use client"

import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import type { OrderStatus as Status } from "@/lib/types/orders"
import { getOrderStatusMeta, type OrderStatusTone } from "@/lib/order-status"
import { Badge } from "@/components/ui/badge"

// An order's status as a pill with a dot, in the tone lib/order-status gives
// it (the label says it; the colour only repeats it). The admin passes
// tone="admin" for its own colours.
function OrderStatus({ status, tone, className }: { status: Status; tone?: OrderStatusTone; className?: string }) {
  const t = useT()
  const meta = getOrderStatusMeta(status, t, tone)

  return (
    <Badge variant="status" className={cn(meta.className, className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </Badge>
  )
}

export { OrderStatus }
