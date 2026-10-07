"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"

// The quantity stepper: minus, the number, plus — three 36px cells inside a
// hairline border with an 8px corner. On phones and tablets the cells are 44px
// tall (36px wide), so each button is a comfortable tap. Minus is disabled at
// the minimum, plus at the stock limit.
const cellButton =
  "flex h-full w-9 items-center justify-center text-charcoal transition-colors outline-none hover:bg-subtle focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4"

function QuantitySelector({
  value,
  onChange,
  max,
  min = 1,
  className,
}: {
  value: number
  onChange: (next: number) => void
  max: number
  min?: number
  className?: string
}) {
  const t = useT()
  const clamp = (n: number) => Math.min(Math.max(n, min), Math.max(max, min))

  return (
    <div
      className={cn(
        "inline-flex h-9 items-stretch overflow-hidden rounded-(--radius-control) border border-input bg-card max-lg:h-11",
        className
      )}
    >
      <button
        type="button"
        className={cn(cellButton, "rounded-l-(--radius-control)")}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
        aria-label={t("product.quantity.decrease")}
      >
        <Minus aria-hidden />
      </button>
      <span className="flex w-9 items-center justify-center text-sm font-semibold text-charcoal tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={cn(cellButton, "rounded-r-(--radius-control)")}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
        aria-label={t("product.quantity.increase")}
      >
        <Plus aria-hidden />
      </button>
    </div>
  )
}

export { QuantitySelector }
