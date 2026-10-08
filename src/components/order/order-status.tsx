"use client"

import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import type { OrderStatus as Status } from "@/lib/types/orders"
import { getOrderStatusMeta } from "@/lib/order-status"
import { Badge } from "@/components/ui/badge"

// An order's status as a pill with a dot, in the tone lib/order-status gives
// it (the label says it; the colour only repeats it).
function OrderStatus({ status, className }: { status: Status; className?: string }) {
  const t = useT()
  const meta = getOrderStatusMeta(status, t)

  return (
    <Badge variant="status" className={cn(meta.className, className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </Badge>
  )
}

export { OrderStatus }
