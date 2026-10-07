import type { ReactNode } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { cn } from "cn"

import { getT } from "@/lib/i18n/server"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import { BackButton } from "@/components/navigation/back-button"
import { CartButton } from "@/components/layout/cart-button"
import { Button } from "@/components/ui/button"

// The top of an inner page, drawn two ways from one piece of markup (so the
// page has exactly one <h1> at every size):
//
//   Phones and tablets: the plain bar that replaces the burgundy brand header
//   (data-page-bar, see globals.css) — a back arrow, the title and the page's
//   own actions, pinned to the top on the cream page. Breadcrumb, description
//   and picture are left out there. `mobileAlign="center"` centres the title
//   (the Categories screen).
//
//   Desktop: optional breadcrumb, the title in the display face, a short
//   description. `variant="band"` (shop, categories, a category) sits it in a
//   soft panel that can carry a picture on the right (`aside`); `variant="plain"`
//   (cart, checkout) is just the text — those pages are tasks, not browsing.
//
// The bar overlaps the page's own 1.5rem top padding (every page that uses it
// starts with py-6 on phones), so it sits flush under the status bar.
async function PageHeader({
  breadcrumb,
  title,
  description,
  aside,
  variant = "band",
  backHref = "/",
  mobileActions,
  mobileAlign = "start",
  className,
}: {
  breadcrumb?: { label: string; href?: string }[]
  title: string
  description?: string
  aside?: ReactNode
  variant?: "band" | "plain"
  /** Where the back arrow leads when there is no shop page to go back to. */
  backHref?: string
  /** The bar's buttons on the right (phones and tablets only). */
  mobileActions?: ReactNode
  mobileAlign?: "start" | "center"
  className?: string
}) {
  const band = variant === "band"

  return (
    <header
      data-page-bar
      className={cn(
        "max-lg:sticky max-lg:top-0 max-lg:z-30 max-lg:-mx-4 max-lg:-mt-6 max-lg:mb-3! max-lg:flex max-lg:h-14 max-lg:items-center max-lg:gap-1 max-lg:border-b max-lg:border-border max-lg:bg-background max-lg:px-2 sm:max-lg:-mx-6 sm:max-lg:px-4",
        band && "lg:flex lg:items-center lg:justify-between lg:gap-10 lg:rounded-hero lg:border lg:border-brand/10 lg:bg-brand-soft/60 lg:px-10 lg:py-9",
        className
      )}
    >
      <BackButton fallbackHref={backHref} className="lg:hidden" />
      <div className={cn("min-w-0 flex-1 lg:space-y-3", mobileAlign === "center" && "max-lg:text-center")}>
        {breadcrumb && (
          <div className="max-lg:hidden">
            <Breadcrumb items={breadcrumb} />
          </div>
        )}
        <h1 className="text-charcoal max-lg:truncate max-lg:text-lg max-lg:leading-tight max-lg:font-semibold lg:font-display lg:text-4xl lg:leading-tight lg:font-bold">
          {title}
        </h1>
        {description && <p className="max-w-xl text-charcoal/75 max-lg:hidden lg:text-lg">{description}</p>}
      </div>
      {mobileActions ? (
        <div className="flex shrink-0 items-center lg:hidden">{mobileActions}</div>
      ) : (
        // Balances the back arrow, so a centred title is centred on the screen.
        mobileAlign === "center" && <span aria-hidden className="size-11 shrink-0 lg:hidden" />
      )}
      {aside && <div className="max-lg:hidden lg:w-[38%] lg:shrink-0">{aside}</div>}
    </header>
  )
}

// The usual buttons on a browsing page's bar: search and the cart.
async function SearchAndCartActions() {
  const t = await getT()

  return (
    <>
      <Button variant="ghost" size="icon-lg" asChild className="text-charcoal">
        <Link href="/search" aria-label={t("search.label")}>
          <Search aria-hidden className="size-[22px]" strokeWidth={1.75} />
        </Link>
      </Button>
      <CartButton />
    </>
  )
}

export { PageHeader, SearchAndCartActions }
