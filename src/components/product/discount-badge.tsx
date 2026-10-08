import { discountPercent } from "@/lib/discount"
import type { Translator } from "@/lib/i18n/translator"
import { Badge } from "@/components/ui/badge"

// How much a product is reduced, worked out once (lib/discount.ts) for every
// place that shows it, so a card and the cart can never disagree.
//   variant="card" — "-23%" on the photo of a product card (burgundy pill).
//   variant="sale" — "23% OFF" beside the price on the product page and in
//                    the cart (red pill).
// Nothing renders when the product isn't discounted.
function DiscountBadge({
  price,
  compareAtPrice,
  t,
  variant = "card",
  className,
}: {
  price: number
  compareAtPrice: number | null
  t: Translator
  variant?: "card" | "sale"
  className?: string
}) {
  const percent = discountPercent(price, compareAtPrice)
  if (percent <= 0) return null

  return (
    <Badge variant={variant === "sale" ? "sale" : "discount"} className={className}>
      {variant === "sale" ? t("product.percentOff", { percent }) : `-${percent}%`}
    </Badge>
  )
}

export { DiscountBadge }
