import Link from "next/link"
import { Heart } from "lucide-react"

import { nameOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import { getNavCategories } from "@/lib/services/nav-queries"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/layout/logo"
import { CartButton } from "@/components/layout/cart-button"
import { MobileMenu } from "@/components/layout/mobile-menu"
import { SearchFocusButton } from "@/components/layout/search-focus-button"
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
    <header data-brand-header className="sticky top-0 z-30 bg-brand-deep text-white lg:hidden">
      <Container className="flex h-14 items-center gap-0.5">
        <MobileMenu categories={menu} />
        <Logo variant="light" className="mr-auto ml-1" />
        <SearchFocusButton inputId={SEARCH_ID} />
        <HideForAdmin>
          <Link
            href="/account/favorites"
            aria-label={t("nav.wishlist")}
            className="flex size-11 items-center justify-center rounded-full text-white transition-colors outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-gold"
          >
            <Heart aria-hidden className="size-[22px]" strokeWidth={1.75} />
          </Link>
        </HideForAdmin>
        <CartButton tone="dark" />
      </Container>
      <Container>
        <p className="pb-2 text-[11px] leading-4 text-white/85">{t("nav.tagline")}</p>
      </Container>
      <Container className="pb-3">
        <SearchBar variant="field" tone="dark" inputId={SEARCH_ID} />
      </Container>
    </header>
  )
}

export { MobileHeader }
