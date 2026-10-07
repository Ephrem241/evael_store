import Link from "next/link"
import { Heart } from "lucide-react"

import { nameOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import { getNavCategories } from "@/lib/services/nav-queries"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/layout/logo"
import { CartButton } from "@/components/layout/cart-button"
import { AccountButton } from "@/components/layout/account-button"
import { SearchBar } from "@/components/navigation/search-bar"
import { HideForAdmin } from "@/components/layout/storefront-only"
import { DesktopNav, type NavLink } from "@/components/navigation/desktop-nav"

// How many of the shop's categories get their own link in the second row.
// The rest stay reachable through the Categories page ("View All Categories"
// on the home page, the footer) — a row with every category would wrap on a
// laptop screen.
const NAV_CATEGORY_LIMIT = 6

// The desktop header, on the cream page with a hairline under it. The logo and
// the tagline sit on the left across both rows; to their right, the first row
// holds the search field and Account / Wishlist / Cart, and the second the
// navigation (Home, the shop's own categories from the database, Deals).
// Sticks to the top while the page scrolls.
async function Header() {
  const [t, categories] = await Promise.all([getT(), getNavCategories()])

  const links: NavLink[] = [
    { href: "/", label: t("nav.home") },
    ...categories.slice(0, NAV_CATEGORY_LIMIT).map((category) => ({
      href: `/category/${category.slug}`,
      label: nameOf(category, t.locale),
    })),
    { href: "/deals", label: t("nav.deals") },
  ]

  return (
    <header className="sticky top-0 z-30 hidden border-b border-border bg-background lg:block">
      <Container className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-12 pt-3">
        <div className="row-span-2 self-center pb-3">
          <Logo />
          <p className="mt-1.5 text-[11px] text-muted-text">{t("nav.tagline")}</p>
        </div>
        <div className="flex items-center gap-6">
          <SearchBar variant="joined" className="w-full max-w-[420px]" />
          <div className="ml-auto flex items-center gap-1">
            <AccountButton variant="stacked" />
            <HideForAdmin>
              <Link
                href="/account/favorites"
                className="flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-charcoal transition-colors outline-none hover:text-brand-ink focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Heart aria-hidden className="size-[22px]" strokeWidth={1.5} />
                <span className="text-xs leading-none">{t("nav.wishlist")}</span>
              </Link>
            </HideForAdmin>
            <CartButton variant="stacked" />
          </div>
        </div>
        <DesktopNav links={links} />
      </Container>
    </header>
  )
}

export { Header }
