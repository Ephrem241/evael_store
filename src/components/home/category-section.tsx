import { getT } from "@/lib/i18n/server"
import type { CategoryWithCount } from "@/lib/services/catalog"
import { CategoryCard, DealsTile } from "@/components/product/category-card"
import { Reveal } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/home/section-heading"

// At most seven tiles in the row: six categories and the Deals tile.
const MAX_CATEGORIES = 6

// "Shop by Category": the categories that hold products (an empty one would
// lead nowhere — they stay on /categories and in the menus), then the Deals
// tile. Desktop: one row of portrait tiles, as many columns as tiles.
// Tablets: four across. Phones: two across, landscape; an odd last tile
// spans the row.
async function CategorySection({ categories }: { categories: CategoryWithCount[] }) {
  const stocked = categories.filter((category) => category.productCount > 0).slice(0, MAX_CATEGORIES)
  if (stocked.length === 0) return null
  const t = await getT()
  const columns = stocked.length + 1

  return (
    <Reveal>
      <section aria-labelledby="categories-heading" className="space-y-4 lg:space-y-5">
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
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-[repeat(var(--tile-columns),minmax(0,1fr))] lg:gap-4 max-sm:[&>*:last-child:nth-child(odd)]:col-span-2 max-sm:[&>*:last-child:nth-child(odd)]:aspect-[16/6]"
        >
          {stocked.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              aspectClassName="aspect-[16/10] sm:aspect-[4/5] lg:aspect-[3/4]"
              sizes="(min-width: 1024px) 200px, (min-width: 640px) 25vw, 50vw"
            />
          ))}
          <DealsTile aspectClassName="aspect-[16/10] sm:aspect-[4/5] lg:aspect-[3/4]" />
        </div>
      </section>
    </Reveal>
  )
}

export { CategorySection }
