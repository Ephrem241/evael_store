import Link from "next/link"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { cn } from "cn"

import { getT } from "@/lib/i18n/server"
import type { SortOption } from "@/lib/services/catalog"
import { buildSortUrl, type RawParams } from "@/components/catalog/listing-url"

// The sort as a row of tabs, the marketplace way, instead of a menu:
// Recommended · Most Popular · Newest · Price. Price is one tab that flips:
// from any other sort it goes low to high, then each tap reverses it, with an
// arrow saying which way it runs. Plain links (a sort is an address, so it
// works without JavaScript and keeps the filters; changing it goes back to
// page 1), the current one marked with aria-current and a burgundy underline.
async function SortTabs({
  value,
  rawParams,
  basePath,
  className,
}: {
  value: SortOption
  rawParams: RawParams
  basePath: string
  className?: string
}) {
  const t = await getT()
  const priceOn = value === "price-asc" || value === "price-desc"
  const nextPrice: SortOption = value === "price-asc" ? "price-desc" : "price-asc"
  const PriceIcon = value === "price-asc" ? ArrowUp : value === "price-desc" ? ArrowDown : ArrowUpDown

  const tabs: { key: string; sort: SortOption; label: string; active: boolean; ariaLabel?: string }[] = [
    { key: "recommended", sort: "recommended", label: t("catalog.sort.recommended"), active: value === "recommended" },
    { key: "popular", sort: "popular", label: t("catalog.sort.popular"), active: value === "popular" },
    { key: "newest", sort: "newest", label: t("catalog.sort.newest"), active: value === "newest" },
    {
      key: "price",
      sort: nextPrice,
      label: t("catalog.sort.price"),
      active: priceOn,
      // Says what the tab does now, not just "Price".
      ariaLabel: t(`catalog.sort.${nextPrice}`),
    },
  ]

  return (
    <nav aria-label={t("catalog.sort.label")} className={cn("no-scrollbar flex min-w-0 items-stretch overflow-x-auto", className)}>
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={buildSortUrl(basePath, rawParams, tab.sort)}
          aria-current={tab.active ? "true" : undefined}
          aria-label={tab.ariaLabel}
          className={cn(
            "relative flex shrink-0 items-center gap-1 px-2.5 text-[13px] whitespace-nowrap transition-colors outline-none first:pl-0 after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:rounded-full first:after:left-0 focus-visible:text-brand-ink focus-visible:after:bg-brand lg:px-3.5 lg:text-sm lg:after:inset-x-3.5",
            tab.active ? "font-semibold text-brand-ink after:bg-brand" : "text-charcoal hover:text-brand-ink"
          )}
        >
          {tab.label}
          {tab.key === "price" && <PriceIcon aria-hidden className="size-3.5" />}
        </Link>
      ))}
    </nav>
  )
}

export { SortTabs }
