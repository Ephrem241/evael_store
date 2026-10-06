import Link from "next/link"
import { X } from "lucide-react"

import { pickLocale } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import { priceBucketLabel, type FilterFacets, type PriceBucketId } from "@/lib/services/catalog"
import { buildFilterUrl, type FilterValues, type RawParams } from "@/components/catalog/listing-url"

// The filters in force, as chips above the products: each one says what it
// filters and removes just itself (a link to the same listing without it), and
// "Clear all" drops every filter at once. Plain links, so they work before
// JavaScript and keep the sort. Nothing renders while no filter is set.
//
// On a category page the category comes from the address, not a filter, so
// it is not offered as a chip there (`showCategory`).
async function ActiveFilters({
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
  const chips: { key: string; label: string; next: FilterValues }[] = []
  // On a category page the category is the address itself: never repeat it
  // as a query parameter (the same as the filter drawer's "Clear all").
  const base: FilterValues = showCategory ? filters : { ...filters, categorySlug: undefined }

  if (showCategory && filters.categorySlug) {
    const category = facets.categories.find((c) => c.slug === filters.categorySlug)
    if (category) {
      chips.push({
        key: "category",
        label: pickLocale(t.locale, category.name, category.nameAm),
        next: { ...filters, categorySlug: undefined },
      })
    }
  }
  if (filters.priceBucket) {
    chips.push({
      key: "price",
      label: priceBucketLabel(filters.priceBucket as PriceBucketId, t),
      next: { ...base, priceBucket: undefined },
    })
  }
  if (filters.inStockOnly) {
    chips.push({ key: "stock", label: t("catalog.filters.inStockOnly"), next: { ...base, inStockOnly: undefined } })
  }
  if (filters.minRating != null) {
    chips.push({
      key: "rating",
      label: t("catalog.filters.ratingUp", { min: filters.minRating }),
      next: { ...base, minRating: undefined },
    })
  }
  if (filters.onSaleOnly) {
    chips.push({ key: "sale", label: t("catalog.filters.onSale"), next: { ...base, onSaleOnly: undefined } })
  }

  if (chips.length === 0) return null

  return (
    <div role="group" aria-label={t("catalog.filters.active")} className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={buildFilterUrl(basePath, rawParams, chip.next)}
          aria-label={t("catalog.filters.remove", { label: chip.label })}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft pr-2.5 pl-3.5 text-sm font-medium text-charcoal transition-colors outline-none hover:border-brand hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50 max-lg:h-10"
        >
          {chip.label}
          <X aria-hidden className="size-3.5 text-brand-ink" />
        </Link>
      ))}
      <Link
        href={buildFilterUrl(basePath, rawParams, {})}
        className="inline-flex h-9 items-center rounded-full px-2 text-sm font-semibold text-brand-ink underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 max-lg:h-10"
      >
        {t("catalog.filters.clearAll")}
      </Link>
    </div>
  )
}

export { ActiveFilters }
