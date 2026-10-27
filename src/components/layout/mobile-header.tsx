import Link from "next/link"
import { Heart } from "lucide-react"

import { nameOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import { getNavCategories } from "@/lib/services/nav-queries"
import { Container } from "@/components/layout/container"
import { CartButton } from "@/components/layout/cart-button"
import { MobileMenu } from "@/components/layout/mobile-menu"
import { SearchBar } from "@/components/navigation/search-bar"
import { HideForAdmin } from "@/components/layout/storefront-only"

const SEARCH_ID = "mobile-header-search"

// Phones and tablets: the burgundy brand header — ☰, the logo (white, with
// the gold mark), then search, wishlist and cart; the tagline; and a white
// search field. It stays pinned while the page scrolls, so search is always
// one tap away. Its height (8.5rem) is --mobile-header-height in globals.css.
//
// Inner pages show the plain bar PageHeader draws instead (back arrow and
// title); a page that has one hides this header (data-brand-header, see
// globals.css). Pages without their own bar keep this one.
async function MobileHeader() {
  const [t, categories] = await Promise.all([getT(), getNavCategories()])
  const menu = categories.map((category) => ({ href: `/category/${category.slug}`, label: nameOf(category, t.locale) }))

  return (
    <header data-brand-header className="sticky top-0 z-30 bg-brand-deep pt-[env(safe-area-inset-top,0px)] text-white shadow-md lg:hidden">
      <Container className="flex h-13 items-center gap-1.5 py-1">
        <MobileMenu categories={menu} />
        <div className="min-w-0 flex-1">
          <SearchBar variant="pill" inputId={SEARCH_ID} />
        </div>
        <HideForAdmin>
          <Link
            href="/account/favorites"
            aria-label={t("nav.wishlist")}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-white transition-colors outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-gold"
          >
            <Heart aria-hidden className="size-5" strokeWidth={1.75} />
          </Link>
        </HideForAdmin>
        <CartButton tone="dark" />
      </Container>
      <div className="no-scrollbar flex items-center gap-4 overflow-x-auto px-4 pt-0.5 pb-2 text-xs font-medium">
        <Link
          href="/"
          className="shrink-0 border-b-2 border-white pb-0.5 font-bold text-white"
        >
          {t("nav.home")}
        </Link>
        {menu.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="shrink-0 text-white/80 transition-colors hover:text-white"
          >
            {cat.label}
          </Link>
        ))}
        <Link
          href="/deals"
          className="shrink-0 font-semibold text-gold transition-colors hover:text-white"
        >
          {t("nav.deals")}
        </Link>
      </div>
    </header>
  )
}

export { MobileHeader }
