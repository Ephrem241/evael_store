"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import { useCartStore, selectCartCount } from "@/lib/store/cart"
import { useIsAdmin } from "@/lib/store/auth"
import { Button } from "@/components/ui/button"

// Links straight to /cart rather than opening a mini-cart drawer. Spec
// Sections 46/71 frame a desktop drawer as explicitly optional ("if
// appropriate"), and its actual requirement — a non-redirecting add-to-cart
// confirmation with a "View cart" action — is already met by the toast in
// useAddToCart. /cart itself is a client-only, localStorage-only render
// with no network round trip, so a drawer wouldn't save a real page-load
// cost either. Deliberately deferred, not overlooked.
//
// `variant="stacked"` is the desktop header's icon-over-label link; the
// default is the icon button used on phones. `tone="dark"` is for the burgundy
// phone header: a white icon and a gold badge with deep burgundy figures.
function CartButton({
  className,
  variant = "icon",
  tone = "light",
}: {
  className?: string
  variant?: "icon" | "stacked"
  tone?: "light" | "dark"
}) {
  const t = useT()
  const count = useCartStore(selectCartCount)
  const isAdmin = useIsAdmin()
  const label = count > 0 ? t.plural("nav.cartCount", count) : t("nav.cart")
  const dark = tone === "dark"
  // Keyed on the count, so the badge re-mounts and plays its small "pop"
  // whenever something is added (the animation is off under reduced motion).
  const badge = count > 0 && (
    <span
      key={count}
      aria-hidden
      className={cn(
        "absolute -top-1.5 -right-2 flex h-4 min-w-4 animate-pop items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold tabular-nums",
        dark ? "bg-gold text-brand-deepest" : "bg-brand-strong text-white ring-2 ring-background"
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  )

  // Admins don't shop (see useIsAdmin).
  if (isAdmin) return null

  if (variant === "stacked") {
    return (
      <Link
        href="/cart"
        aria-label={label}
        className={cn(
          "flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-charcoal transition-colors outline-none hover:text-brand-ink focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        <span className="relative">
          <ShoppingCart aria-hidden className="size-[22px]" strokeWidth={1.5} />
          {badge}
        </span>
        <span aria-hidden className="text-xs leading-none">
          {t("nav.cart")}
        </span>
      </Link>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      asChild
      className={cn("relative", dark && "text-white hover:bg-white/10 hover:text-white focus-visible:ring-gold", className)}
    >
      <Link href="/cart" aria-label={label}>
        <span className="relative">
          <ShoppingCart aria-hidden className="size-[22px]" strokeWidth={1.75} />
          {badge}
        </span>
      </Link>
    </Button>
  )
}

export { CartButton }
