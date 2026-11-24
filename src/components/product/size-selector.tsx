"use client"

import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import type { ProductSize } from "@/lib/product-sizes"

// The product page's size picker: one pill per size (S, M, L / 38, 39, 40),
// in the order the admin set. The chosen size is burgundy; a sold-out size is
// struck through and can't be chosen. Each size is a button marked as a radio
// (role="radio", aria-checked), so a screen reader hears which one is chosen;
// Tab moves between them. Under the
// pills: what is left of the chosen size when it is running low, or the error
// when the shopper tried to buy without choosing.
function SizeSelector({
  sizes,
  value,
  onChange,
  error,
}: {
  sizes: ProductSize[]
  value: string | null
  onChange: (size: string) => void
  error?: boolean
}) {
  const t = useT()
  const chosen = sizes.find((s) => s.label === value)

  return (
    <fieldset className="space-y-2">
      <legend className="flex items-baseline gap-2 text-sm font-medium text-charcoal">
        {t("product.sizes.label")}
        {chosen && <span className="font-semibold text-brand-ink">{chosen.label}</span>}
      </legend>
      <div role="radiogroup" aria-label={t("product.sizes.label")} aria-invalid={error || undefined} className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const soldOut = size.stock <= 0
          const selected = size.label === value
          return (
            <button
              key={size.label}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={soldOut ? t("product.sizes.soldOut", { size: size.label }) : size.label}
              disabled={soldOut}
              onClick={() => onChange(size.label)}
              className={cn(
                "relative inline-flex h-10 min-w-12 items-center justify-center rounded-full border px-3.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring max-lg:h-11",
                selected
                  ? "border-brand-strong bg-brand-strong text-white"
                  : "border-input bg-card text-charcoal hover:border-brand hover:text-brand-ink",
                soldOut && "cursor-not-allowed border-dashed bg-subtle text-muted-text line-through hover:border-input hover:text-muted-text",
                error && !selected && !soldOut && "border-error"
              )}
            >
              {size.label}
            </button>
          )
        })}
      </div>
      {error ? (
        <p role="alert" className="text-xs font-medium text-error">
          {t("product.sizes.required")}
        </p>
      ) : chosen && chosen.stock <= 5 ? (
        <p className="text-xs font-medium text-warning-text">{t("product.stock.low", { count: chosen.stock })}</p>
      ) : null}
    </fieldset>
  )
}

export { SizeSelector }
