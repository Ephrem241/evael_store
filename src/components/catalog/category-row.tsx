import { LayoutGrid } from "lucide-react"

import { nameOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import type { CategoryWithCount } from "@/lib/services/catalog"
import { CategoryCircle } from "@/components/product/category-circle"

// The row of round category icons over the shop and category listings, as
// marketplaces head their list pages: "All" (the whole shop) and every
// stocked category, the one being browsed ringed in burgundy. One line that
// scrolls sideways when the circles don't fit (on phones it runs to the
// screen edges, so a circle cut at the edge shows there is more).
async function CategoryRow({
  categories,
  activeSlug,
}: {
  categories: CategoryWithCount[]
  /** The category being browsed; none means the whole shop. */
  activeSlug?: string
}) {
  const stocked = categories.filter((category) => category.productCount > 0)
  if (stocked.length === 0) return null
  const t = await getT()
  const item = "w-[4.5rem] shrink-0 sm:w-20 lg:w-24"

  return (
    <nav aria-label={t("catalog.categoryRowLabel")}>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pt-1 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:gap-5 lg:px-0.5">
        <CategoryCircle
          href="/shop"
          name={t("catalog.filters.all")}
          active={!activeSlug}
          className={item}
          picture={<LayoutGrid aria-hidden className="size-6 text-brand-ink lg:size-8" strokeWidth={1.5} />}
        />
        {stocked.map((category) => (
          <CategoryCircle
            key={category.id}
            href={`/category/${category.slug}`}
            name={nameOf(category, t.locale)}
            slug={category.slug}
            imageUrl={category.image_url}
            active={category.slug === activeSlug}
            sizes="96px"
            className={item}
          />
        ))}
      </div>
    </nav>
  )
}

export { CategoryRow }
