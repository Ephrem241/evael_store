import type { Metadata } from "next"
import Link from "next/link"
import { Search, SearchX } from "lucide-react"

import { parseListingParams } from "@/lib/services/catalog"
import { getCategories, getFilterFacets, getPopularProducts, getProducts } from "@/lib/services/catalog-queries"
import { getT } from "@/lib/i18n/server"
import { ProductListing } from "@/components/catalog/product-listing"
import { EmptyState } from "@/components/feedback/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { CartButton } from "@/components/layout/cart-button"
import { SearchBar } from "@/components/navigation/search-bar"
import { SectionHeading } from "@/components/home/section-heading"
import { ProductGrid } from "@/components/product/product-grid"
import { CategoryChip } from "@/components/product/category-chip"
import { Button } from "@/components/ui/button"

// Internal search results are never indexed (thin, endless variations), but
// their links are followed so the products they list can be discovered.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const [raw, t] = await Promise.all([searchParams, getT()])
  const q = Array.isArray(raw.q) ? raw.q[0] : raw.q
  return {
    title: q ? t("catalog.searchResultsFor", { query: q }) : t("catalog.searchTitle"),
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const rawParams = await searchParams
  const parsed = parseListingParams(rawParams)
  const q = parsed.query
  const t = await getT()

  if (!q) {
    return (
      <div className="space-y-8 py-6 lg:py-8">
        <PageHeader
          breadcrumb={[{ label: t("nav.home"), href: "/" }, { label: t("catalog.searchTitle") }]}
          title={t("catalog.searchTitle")}
          mobileActions={<CartButton />}
        />
        <SearchBar className="lg:hidden" />
        <EmptyState
          icon={Search}
          title={t("catalog.searchEmptyTitle")}
          description={t("catalog.searchEmptyText")}
        />
      </div>
    )
  }

  const [result, facets] = await Promise.all([
    getProducts(parsed),
    getFilterFacets({ query: q }),
  ])
  const breadcrumb = [{ label: t("nav.home"), href: "/" }, { label: t("catalog.searchTitle") }]
  const filtered =
    !!parsed.categorySlug || !!parsed.priceBucket || !!parsed.inStockOnly || parsed.minRating != null || !!parsed.onSaleOnly

  // Nothing matches the words themselves (no filter to blame): instead of a
  // dead end, the shop's categories and its popular picks — real products, so
  // the next tap still leads somewhere. (With filters on, the listing's own
  // empty state and filter chips say how to widen the search.)
  if (result.total === 0 && !filtered) {
    const [categories, popular] = await Promise.all([getCategories(), getPopularProducts(8)])
    return (
      <div className="space-y-10 py-6 lg:py-8">
        <PageHeader breadcrumb={breadcrumb} title={t("catalog.searchResultsFor", { query: q })} mobileActions={<CartButton />} />
        <SearchBar defaultQuery={q} className="lg:hidden" />
        <EmptyState
          icon={SearchX}
          title={t("catalog.searchNoMatchTitle")}
          description={t("catalog.searchNoMatchText", { query: q })}
          action={
            <Button variant="outline" asChild>
              <Link href="/shop">{t("cart.continueShopping")}</Link>
            </Button>
          }
        />
        {categories.length > 0 && (
          <section aria-labelledby="search-categories-heading" className="space-y-4">
            <SectionHeading id="search-categories-heading" title={t("catalog.searchBrowseCategories")} />
            <div className="flex flex-wrap gap-4">
              {categories.map((category) => (
                <CategoryChip key={category.id} category={category} t={t} />
              ))}
            </div>
          </section>
        )}
        {popular.length > 0 && (
          <section aria-labelledby="search-popular-heading" className="space-y-4">
            <SectionHeading id="search-popular-heading" title={t("home.popularTitle")} />
            <ProductGrid products={popular} />
          </section>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 py-6 lg:py-8">
      <PageHeader breadcrumb={breadcrumb} title={t("catalog.searchResultsFor", { query: q })} mobileActions={<CartButton />} />
      <SearchBar defaultQuery={q} className="lg:hidden" />
      <ProductListing
        products={result.products}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
        filters={parsed}
        sort={parsed.sort ?? "recommended"}
        facets={facets}
        showCategoryFilter
        rawParams={rawParams}
        basePath="/search"
      />
    </div>
  )
}
