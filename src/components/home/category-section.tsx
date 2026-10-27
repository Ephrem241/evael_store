import Link from "next/link"

import { nameOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import type { CategoryWithCount } from "@/lib/services/catalog"
import { CategoryCard, DealsTile } from "@/components/product/category-card"
import { getCategoryIcon } from "@/components/product/category-icons"
import { Reveal } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/home/section-heading"

// At most seven tiles in the desktop row: six categories and the Deals tile.
const MAX_CATEGORIES = 6

// "Shop by Category":
// Phones: 5 columns x 2 rows = 10 squircle chips matching the reference app.
// Desktop: one row of portrait tiles.
async function CategorySection({ categories }: { categories: CategoryWithCount[] }) {
  const stocked = categories.filter((category) => category.productCount > 0).slice(0, MAX_CATEGORIES)
  if (stocked.length === 0) return null
  const t = await getT()
  const columns = stocked.length + 1
  const mobileCategories = categories.slice(0, 10)

  return (
    <Reveal>
      <section aria-labelledby="categories-heading" className="space-y-3 lg:space-y-5">
        <SectionHeading
          id="categories-heading"
          title={t("home.categoriesTitle")}
          href="/categories"
          linkLabel={t("home.viewAllCategories")}
        />

        {/* Phones: 5-column dual-row category grid matching reference image */}
        <div className="grid grid-cols-5 gap-x-2 gap-y-3 py-1 sm:hidden">
          {mobileCategories.map((cat) => {
            const Icon = getCategoryIcon(cat.slug)
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center gap-1 text-center outline-none"
              >
                <div className="flex size-13 items-center justify-center rounded-2xl border border-border/70 bg-surface shadow-xs transition-transform group-active:scale-95">
                  <Icon aria-hidden className="size-6 text-brand-ink" strokeWidth={1.5} />
                </div>
                <span className="line-clamp-2 max-w-[58px] text-[10px] leading-tight font-medium text-charcoal">
                  {nameOf(cat, t.locale)}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Tablets and Desktop: portrait cards */}
        <div
          style={{ "--tile-columns": columns } as React.CSSProperties}
          className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-[repeat(var(--tile-columns),minmax(0,1fr))] lg:gap-4"
        >
          {stocked.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              aspectClassName="aspect-[4/5] lg:aspect-[3/4]"
              sizes="(min-width: 1024px) 200px, (min-width: 640px) 25vw, 50vw"
            />
          ))}
          <DealsTile aspectClassName="aspect-[4/5] lg:aspect-[3/4]" />
        </div>
      </section>
    </Reveal>
  )
}

export { CategorySection }
