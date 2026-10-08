import type { Metadata } from "next"

import { getT } from "@/lib/i18n/server"
import { pageMetadata } from "@/lib/seo/metadata"
import { getCategories } from "@/lib/services/catalog-queries"
import { CategoryCard, DealsBanner } from "@/components/product/category-card"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return pageMetadata({
    locale: t.locale,
    path: "/categories",
    title: t("catalog.categoriesTitle"),
    description: t("catalog.categoriesSubtitle"),
  })
}

// How many categories lead the page as wide tiles, then as the grid above
// the Deals banner.
const WIDE = 2
const BEFORE_BANNER = 6

// Every active category (empty ones too: this is the index of the shop), as
// photo tiles. Phones: the first two full-width and 120px tall, the next four
// in a two-by-two grid, then the full-width Deals banner, then the rest two
// across. Desktop follows the same order four across: the first two wide,
// the next four in a row, the banner, the rest.
// The primary navigation, the footer and the home page all link here.
export default async function CategoriesPage() {
  const [categories, t] = await Promise.all([getCategories(), getT()])
  const wide = categories.slice(0, WIDE)
  const grid = categories.slice(WIDE, BEFORE_BANNER)
  const rest = categories.slice(BEFORE_BANNER)
  const tile = "aspect-[3/2] lg:aspect-[4/3]"
  const tileSizes = "(min-width: 1280px) 300px, (min-width: 1024px) 24vw, 50vw"

  return (
    <div className="space-y-8 py-6 lg:py-8">
      <PageHeader
        breadcrumb={[{ label: t("nav.home"), href: "/" }, { label: t("catalog.categoriesTitle") }]}
        title={t("catalog.categoriesTitle")}
        mobileAlign="center"
        description={t("catalog.categoriesSubtitle")}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {wide.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            aspectClassName="h-[120px] lg:h-[220px]"
            sizes="(min-width: 1280px) 620px, (min-width: 1024px) 50vw, 100vw"
            className="col-span-2"
          />
        ))}
        {grid.map((category) => (
          <CategoryCard key={category.id} category={category} aspectClassName={tile} sizes={tileSizes} />
        ))}
        <DealsBanner className="col-span-2 lg:col-span-4" />
        {rest.map((category) => (
          <CategoryCard key={category.id} category={category} aspectClassName={tile} sizes={tileSizes} />
        ))}
      </div>
    </div>
  )
}
