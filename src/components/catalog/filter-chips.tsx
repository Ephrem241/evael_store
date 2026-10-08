import Link from "next/link"

import { pickLocale } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import { priceBucketLabel, type FilterFacets, type PriceBucketId } from "@/lib/services/catalog"
import { buildFilterUrl, type FilterValues, type RawParams } from "@/components/catalog/listing-url"
import { Chip } from "@/components/ui/chip"

interface QuickChip {
  key: string
  label: string
  selected: boolean
  next: FilterValues
}

// Phones and tablets: a sideways row of filter chips over a listing — All,
// then (where a category can be chosen) each category, On sale, In stock and
// the price ranges. Only real filters with products behind them: a chip that
// would empty the list is left out, and there is no rating chip (no product
// is rated yet). Each chip is a link that switches its own filter on or off
// and keeps the sort; All clears every filter. The full set (rating too)
// stays in the Filter sheet. Desktop has the sidebar instead.
async function FilterChips({
  filters,
  facets,
  showCategory,
  rawParams,
  basePath,
}: {
  filters: FilterValues
  facets: FilterFacets
  showCategory: boolean
  rawParams: RawParams
  basePath: string
}) {
  const t = await getT()
  // On a category page the category is the address itself, never a query parameter.
  const base: FilterValues = showCategory ? filters : { ...filters, categorySlug: undefined }
  const nothingSet =
    !(showCategory && filters.categorySlug) &&
    !filters.priceBucket &&
    !filters.inStockOnly &&
    filters.minRating == null &&
    !filters.onSaleOnly

  const chips: QuickChip[] = [{ key: "all", label: t("catalog.filters.all"), selected: nothingSet, next: {} }]
  if (showCategory) {
    for (const category of facets.categories.filter((c) => c.count > 0)) {
      const on = filters.categorySlug === category.slug
      chips.push({
        key: `category-${category.slug}`,
        label: pickLocale(t.locale, category.name, category.nameAm),
        selected: on,
        next: { ...base, categorySlug: on ? undefined : category.slug },
      })
    }
  }
  if (facets.onSaleCount > 0) {
    chips.push({
      key: "sale",
      label: t("catalog.filters.onSale"),
      selected: !!filters.onSaleOnly,
      next: { ...base, onSaleOnly: !filters.onSaleOnly },
    })
  }
  if (facets.inStockCount > 0) {
    chips.push({
      key: "stock",
      label: t("catalog.filters.inStock"),
      selected: !!filters.inStockOnly,
      next: { ...base, inStockOnly: !filters.inStockOnly },
    })
  }
  for (const bucket of facets.priceBuckets.filter((b) => b.count > 0)) {
    const on = filters.priceBucket === bucket.id
    chips.push({
      key: `price-${bucket.id}`,
      label: priceBucketLabel(bucket.id as PriceBucketId, t),
      selected: on,
      next: { ...base, priceBucket: on ? undefined : bucket.id },
    })
  }

  if (chips.length <= 1) return null

  return (
    <nav
      aria-label={t("catalog.filters.quick")}
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:-mx-6 sm:px-6 lg:hidden"
    >
      {chips.map((chip) => (
        <Chip key={chip.key} asChild selected={chip.selected}>
          <Link href={buildFilterUrl(basePath, rawParams, chip.next)} aria-current={chip.selected ? "true" : undefined}>
            {chip.label}
          </Link>
        </Chip>
      ))}
    </nav>
  )
}

export { FilterChips }
