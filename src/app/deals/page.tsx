import type { Metadata } from "next"
import Link from "next/link"
import { BadgePercent, SlidersHorizontal } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import { pageMetadata } from "@/lib/seo/metadata"
import { isOnSale, type ProductWithCategory } from "@/lib/services/catalog"
import { getFeaturedProducts, getFlashDeals } from "@/lib/services/catalog-queries"
import { PageHeader, SearchAndCartActions } from "@/components/layout/page-header"
import { ProductGrid } from "@/components/product/product-grid"
import { EmptyState } from "@/components/feedback/empty-state"
import { SectionHeading } from "@/components/home/section-heading"
import { Button } from "@/components/ui/button"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return pageMetadata({
    locale: t.locale,
    path: "/deals",
    title: t("nav.deals"),
    description: t("home.flashSubtitle"),
  })
}

// The same bar the product page uses for "Only N left" (getStockStatus).
const LOW_STOCK = 5
// Every product on sale fits on one page today; the full, filterable and
// sortable list is /shop?sale=1, linked from the header.
const MAX_DEALS = 60

// The Deals page: every product really on sale (a compare-at price above its
// price), grouped the way a shopper looks for them —
//   * Featured offers: discounted products the admin also features,
//   * Limited stock: discounted products with only a few left (real stock),
//   * On sale now: everything else that is discounted.
// Each product appears once, in the first group it fits. Nothing is invented:
// a group with no products is simply not shown.
export default async function DealsPage() {
  const [t, deals, featured] = await Promise.all([getT(), getFlashDeals(MAX_DEALS), getFeaturedProducts(MAX_DEALS)])

  const featuredIds = new Set(featured.map((p) => p.id))
  const featuredOffers = deals.filter((p) => featuredIds.has(p.id) && isOnSale(p))
  const taken = new Set(featuredOffers.map((p) => p.id))
  const limited = deals.filter((p) => !taken.has(p.id) && p.stock > 0 && p.stock <= LOW_STOCK)
  limited.forEach((p) => taken.add(p.id))
  const rest = deals.filter((p) => !taken.has(p.id))

  const groups: { id: string; title: string; products: ProductWithCategory[] }[] = [
    { id: "featured-offers", title: t("catalog.dealsPage.featured"), products: featuredOffers },
    { id: "limited-stock", title: t("catalog.dealsPage.limited"), products: limited },
    { id: "on-sale", title: t("catalog.dealsPage.onSale"), products: rest },
  ]

  return (
    <div className="space-y-10 py-6 lg:space-y-14 lg:py-8">
      <PageHeader
        breadcrumb={[{ label: t("nav.home"), href: "/" }, { label: t("nav.deals") }]}
        mobileActions={<SearchAndCartActions />}
        title={t("nav.deals")}
        description={t("home.flashSubtitle")}
        aside={
          deals.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <p className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-charcoal shadow-soft">
                <BadgePercent aria-hidden className="size-4 text-brand" />
                {t.plural("catalog.productCount", deals.length)}
              </p>
              <Button variant="outline" asChild>
                <Link href="/shop?sale=1">
                  <SlidersHorizontal aria-hidden />
                  {t("catalog.dealsPage.browseAll")}
                </Link>
              </Button>
            </div>
          )
        }
      />

      {deals.length === 0 ? (
        <EmptyState
          icon={BadgePercent}
          title={t("catalog.dealsPage.emptyTitle")}
          description={t("catalog.dealsPage.emptyText")}
          action={
            <Button asChild>
              <Link href="/shop">{t("cart.startShopping")}</Link>
            </Button>
          }
        />
      ) : (
        groups
          .filter((group) => group.products.length > 0)
          .map((group, i) => (
            <section key={group.id} aria-labelledby={`${group.id}-heading`} className="space-y-5">
              <SectionHeading
                id={`${group.id}-heading`}
                title={group.title}
              />
              <ProductGrid products={group.products} eagerCount={i === 0 ? 4 : 0} />
            </section>
          ))
      )}
    </div>
  )
}
