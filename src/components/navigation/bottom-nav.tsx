"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Home, LayoutDashboard, LayoutGrid, ShoppingCart, User } from "lucide-react"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import type { MessageKey } from "@/lib/i18n/translator"
import { useCurrentUser } from "@/lib/store/auth"
import { useCartStore, selectCartCount } from "@/lib/store/cart"

type Tab = {
  href: string
  label: MessageKey
  icon: typeof Home
  /** Which addresses light this tab up. */
  matches: (pathname: string) => boolean
  /** The outline icon can be filled when active (the cart's open shape can't). */
  fills?: boolean
}

const under = (base: string) => (pathname: string) => pathname === base || pathname.startsWith(`${base}/`)

// Phones and tablets: five tabs pinned to the bottom of the screen, on white
// above the iPhone home indicator. At rest an outline icon and a 10px label
// in the secondary colour; the current tab is filled and burgundy (and marked
// aria-current, so the state is not colour alone).
function BottomNav() {
  const t = useT()
  const pathname = usePathname()
  const user = useCurrentUser()
  const cartCount = useCartStore(selectCartCount)

  // The product page has its own sticky buy bar, which takes this bar's place
  // there — showing both would stack two fixed bottom bars and eat into the
  // one screen where extra room matters most. Admins get no buy bar, so they
  // keep this one.
  if (pathname.startsWith("/product/") && user?.role !== "admin") return null

  const favorites = under("/account/favorites")

  // An admin browsing the shop doesn't shop: no wishlist or cart, and the last
  // tab leads back to the dashboard.
  const tabs: Tab[] =
    user?.role === "admin"
      ? [
          { href: "/", label: "nav.home", icon: Home, matches: (p) => p === "/", fills: true },
          { href: "/categories", label: "nav.categories", icon: LayoutGrid, matches: under("/categories"), fills: true },
          { href: "/admin", label: "admin.nav.dashboard", icon: LayoutDashboard, matches: under("/admin"), fills: true },
        ]
      : [
          { href: "/", label: "nav.home", icon: Home, matches: (p) => p === "/", fills: true },
          { href: "/categories", label: "nav.categories", icon: LayoutGrid, matches: under("/categories"), fills: true },
          { href: "/account/favorites", label: "nav.wishlist", icon: Heart, matches: favorites, fills: true },
          { href: "/cart", label: "nav.cart", icon: ShoppingCart, matches: under("/cart") },
          {
            href: user ? "/account" : "/login",
            label: "nav.account",
            icon: User,
            // The wishlist lives under /account too, but has its own tab.
            matches: (p) => (under("/account")(p) && !favorites(p)) || p === "/login",
            fills: true,
          },
        ]

  return (
    <nav
      aria-label={t("nav.primaryMobile")}
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-surface pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] shadow-up lg:hidden"
    >
      {tabs.map((tab) => {
        const active = tab.matches(pathname)
        const Icon = tab.icon
        const showBadge = tab.href === "/cart" && cartCount > 0
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            // The badge itself is hidden from screen readers; the count is
            // read out here instead, as the header's cart button does.
            aria-label={showBadge ? t.plural("nav.cartCount", cartCount) : undefined}
            className={cn(
              "relative flex h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-[10px] transition-colors outline-none focus-visible:bg-subtle active:bg-subtle/70",
              active ? "font-semibold text-brand-strong" : "font-medium text-muted-text"
            )}
          >
            <span className="relative">
              <Icon
                aria-hidden
                className={cn("size-[22px]", active && tab.fills && "fill-current")}
                strokeWidth={active ? 2 : 1.5}
              />
              {showBadge && (
                <span
                  aria-hidden
                  key={cartCount}
                  className="absolute -top-1.5 -right-2 flex h-4 min-w-4 animate-pop items-center justify-center rounded-full bg-brand-strong px-1 text-[10px] leading-none font-bold text-white tabular-nums ring-2 ring-surface"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>
            <span className="max-w-full truncate">{t(tab.label)}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export { BottomNav }
