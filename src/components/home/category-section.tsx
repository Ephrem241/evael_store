import Image from "next/image"
import Link from "next/link"
import { cn } from "cn"

import { nameOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import type { CategoryWithCount } from "@/lib/services/catalog"
import { CategoryCard, DealsTile } from "@/components/product/category-card"
import { RemoteProductImage } from "@/components/product/remote-product-image"
import { getCategoryIcon } from "@/components/product/category-icons"
import { Reveal } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/home/section-heading"

// At most seven tiles in the desktop row: six categories and the Deals tile.
const MAX_CATEGORIES = 6

const phoneTileClass =
  "group flex min-w-0 flex-col items-center gap-1.5 rounded-xl text-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
const phoneWellClass =
  "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[1.1rem] bg-subtle transition-transform group-active:scale-95"

// "Shop by Category".
//
// Phones: no heading (as in shopping apps), just a grid of every stocked
// category and Deals last — a rounded photo well (the category's icon until
// it has a photo, or if the photo fails) over a two-line name. Up to ten
// tiles fill two rows of five; with more, the rows scroll sideways and half
// of the fifth column shows at the edge, the cue that there is more. It sits
// right under the hero, so unlike the rest of the page it doesn't fade in.
//
// Tablets and desktop: the heading, then one row of portrait photo tiles.
async function CategorySection({ categories }: { categories: CategoryWithCount[] }) {
  const stockedAll = categories.filter((category) => category.productCount > 0)
  if (stockedAll.length === 0) return null
  const stocked = stockedAll.slice(0, MAX_CATEGORIES)
  const t = await getT()
  const columns = stocked.length + 1
  // Phones: every stocked category plus the Deals tile, over two rows.
  const phoneColumns = Math.max(5, Math.ceil((stockedAll.length + 1) / 2))
  const scrolls = phoneColumns > 5

  return (
    <section aria-labelledby="categories-heading">
      <div
        // Row by row, so the first row holds the first categories.
        style={{ "--phone-columns": phoneColumns } as React.CSSProperties}
        className={cn(
          "grid gap-x-2 gap-y-3 sm:hidden",
          scrolls
            ? "no-scrollbar -mx-4 scroll-px-4 grid-cols-[repeat(var(--phone-columns),calc((100%-2rem)/4.5))] overflow-x-auto px-4"
            : "grid-cols-5"
        )}
      >
        {stockedAll.map((category) => {
          const Icon = getCategoryIcon(category.slug)
          return (
            <Link key={category.id} href={`/category/${category.slug}`} className={phoneTileClass}>
              <span className={phoneWellClass}>
                <Icon aria-hidden className="size-6 text-brand-ink" strokeWidth={1.5} />
                {category.image_url && <RemoteProductImage src={category.image_url} alt="" sizes="80px" />}
              </span>
              <span className="line-clamp-2 text-[11px] leading-tight text-charcoal">{nameOf(category, t.locale)}</span>
            </Link>
          )
        })}
        <Link href="/deals" className={phoneTileClass}>
          <span className={phoneWellClass}>
            <Image src="/images/home/deals-tile.jpg" alt="" fill sizes="80px" className="object-cover object-[72%_42%]" />
          </span>
          <span className="line-clamp-2 text-[11px] leading-tight font-semibold text-sale">{t("nav.deals")}</span>
        </Link>
      </div>

      <Reveal className="space-y-4 max-sm:hidden lg:space-y-5">
        <SectionHeading
          id="categories-heading"
          title={t("home.categoriesTitle")}
          href="/categories"
          linkLabel={t("home.viewAllCategories")}
        />
        <div
          // The desktop column count follows the number of tiles (a static
          // class can't), so the row is always full width.
          style={{ "--tile-columns": columns } as React.CSSProperties}
          className="grid grid-cols-4 gap-3 lg:grid-cols-[repeat(var(--tile-columns),minmax(0,1fr))] lg:gap-4"
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
      </Reveal>
    </section>
  )
}

export { CategorySection }
