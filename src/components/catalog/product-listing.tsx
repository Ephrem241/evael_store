import Link from "next/link"
import { PackageSearch } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import type { ProductWithCategory, FilterFacets, SortOption } from "@/lib/services/catalog"
import { ProductGrid } from "@/components/product/product-grid"
import { EmptyState } from "@/components/feedback/empty-state"
import { FilterSidebar } from "@/components/catalog/filter-sidebar"
import { FilterDrawer } from "@/components/catalog/filter-drawer"
import { SortTabs } from "@/components/catalog/sort-tabs"
import { Pagination } from "@/components/catalog/pagination"
import { LoadMoreProducts } from "@/components/catalog/load-more-products"
import { ActiveFilters } from "@/components/catalog/active-filters"
import { FilterChips } from "@/components/catalog/filter-chips"
import { Button } from "@/components/ui/button"
import type { FilterValues, RawParams } from "@/components/catalog/listing-url"

// Shared by /shop, /category/[slug], and /search — each page renders its own
// header above this (breadcrumb/banner/title differ too much to force into
// one slot API, Rule 6) and fetches its own data, but the filter/sort/grid/
// pagination chrome below is identical everywhere (Rule 5).
//
// The sort is a row of tabs, the marketplace way (sort-tabs.tsx).
//
// Phones and tablets: a row of quick filter chips, then one bar pinned under
// the header while the products scroll: the sort tabs (scrolling sideways if
// they must) and Filter at its end; the full filters open in a bottom sheet;
// "Load more" adds the next page below the grid instead of numbered pages.
// Desktop keeps the sidebar, the sort tabs across from the result count, and
// the page numbers.
async function ProductListing({
  products,
  total,
  page,
  pageSize,
  totalPages,
  filters,
  sort,
  facets,
  showCategoryFilter = true,
  categoryChips = true,
  rawParams,
  basePath,
}: {
  products: ProductWithCategory[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  filters: FilterValues
  sort: SortOption
  facets: FilterFacets
  showCategoryFilter?: boolean
  /** Category chips in the phone quick-filter row (off under a CategoryRow). */
  categoryChips?: boolean
  rawParams: RawParams
  basePath: string
}) {
  const t = await getT()
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)
  const resultSummary =
    total === 0
      ? t("catalog.noResults")
      : t("catalog.results", { start: rangeStart, end: rangeEnd, total })

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-10">
      <FilterChips
        filters={filters}
        facets={facets}
        showCategory={showCategoryFilter}
        categoryChips={categoryChips}
        rawParams={rawParams}
        basePath={basePath}
      />
      {/* Full width (it cancels the page's side padding); the tabs are the
          bar's full 44px height, so each is a comfortable tap. */}
      <div className="sticky top-(--mobile-header-height) z-20 -mx-4 flex h-12 items-stretch gap-2 border-b border-border bg-background/95 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden">
        <SortTabs value={sort} rawParams={rawParams} basePath={basePath} className="flex-1" />
        <FilterDrawer
          filters={filters}
          facets={facets}
          showCategory={showCategoryFilter}
          rawParams={rawParams}
          basePath={basePath}
          className="my-auto h-9 shrink-0"
        />
      </div>

      <FilterSidebar
        filters={filters}
        facets={facets}
        showCategory={showCategoryFilter}
        rawParams={rawParams}
        basePath={basePath}
      />

      <div className="min-w-0 flex-1 space-y-5">
        <div className="hidden h-11 items-stretch justify-between gap-6 border-b border-border lg:flex">
          <SortTabs value={sort} rawParams={rawParams} basePath={basePath} />
          <p role="status" className="self-center text-sm text-muted-text">
            {resultSummary}
          </p>
        </div>
        {/* Phones: just the count — the "Showing 1–24 of…" range lives by the
            Load more button, where it changes as more products are added. */}
        <p role="status" className="text-sm text-muted-text lg:hidden">
          {total === 0 ? t("catalog.noResults") : t.plural("catalog.productCount", total)}
        </p>

        <ActiveFilters
          filters={filters}
          facets={facets}
          showCategory={showCategoryFilter}
          rawParams={rawParams}
          basePath={basePath}
        />

        {products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title={t("catalog.emptyTitle")}
            description={t("catalog.emptyText")}
            action={
              <Button asChild>
                <Link href="/categories">{t("catalog.browseCategories")}</Link>
              </Button>
            }
          />
        ) : (
          <div>
            <ProductGrid products={products} eagerCount={4} />
            <LoadMoreProducts
              key={`${JSON.stringify(rawParams)}|${filters.categorySlug ?? ""}`}
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              rawParams={rawParams}
              categorySlug={filters.categorySlug}
            />
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} rawParams={rawParams} basePath={basePath} />
      </div>
    </div>
  )
}

export { ProductListing }
