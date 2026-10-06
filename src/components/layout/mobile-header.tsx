import Link from "next/link"
import { Heart } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/layout/logo"
import { CartButton } from "@/components/layout/cart-button"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { SearchBar } from "@/components/navigation/search-bar"
import { HideForAdmin } from "@/components/layout/storefront-only"
import { Button } from "@/components/ui/button"

// Phones: the logo/language/wishlist/cart row AND the full-width search bar
// below it stay pinned together while scrolling, so search is always one tap
// away without opening a menu. (Previously only the slim row was sticky and
// the search bar scrolled away, to save vertical space — an app-like feel
// asks for search to always be reachable instead.)
async function MobileHeader() {
  const t = await getT()

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md lg:hidden">
      <Container className="flex h-14 items-center justify-between gap-2">
        <Logo />
        <div className="flex items-center gap-0.5">
          <LanguageSwitcher compact className="mr-1" />
          {/* The wishlist's only phone entry point besides the account menu
              (the bottom bar has Deals in its place), so it shows at every width. */}
          <HideForAdmin>
            <Button variant="ghost" size="icon-lg" asChild>
              <Link href="/account/favorites" aria-label={t("nav.wishlist")}>
                <Heart aria-hidden className="size-[22px]" strokeWidth={1.75} />
              </Link>
            </Button>
          </HideForAdmin>
          <CartButton />
        </div>
      </Container>
      <Container className="pt-3 pb-3">
        <SearchBar size="lg" className="w-full" />
      </Container>
    </header>
  )
}

export { MobileHeader }
