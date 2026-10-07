import { cn } from "cn"

import type { Translator } from "@/lib/i18n/translator"
import { formatPrice } from "@/lib/currency"

// No "use client": this renders on the server (product cards, product page) or
// in the browser (cart, checkout) equally. It gets the translator as a prop —
// instead of reading it from context — precisely so that it does NOT have to
// be a client component (which would ship its code and the props of every
// price to the browser for nothing).
//
// "1,850 ETB" in bold burgundy ink; the struck-through original ("compare")
// in 12px secondary text. Figures are tabular, so prices line up. Callers set
// the size of the current price.
function Price({
  amount,
  t,
  variant = "current",
  className,
}: {
  amount: number
  t: Translator
  variant?: "current" | "compare"
  className?: string
}) {
  if (variant === "compare") {
    return (
      <span className={cn("text-xs text-muted-text tabular-nums line-through", className)}>
        {formatPrice(amount, t)}
      </span>
    )
  }

  return (
    <span className={cn("font-bold text-brand-ink tabular-nums", className)}>
      {formatPrice(amount, t)}
    </span>
  )
}

export { Price }
