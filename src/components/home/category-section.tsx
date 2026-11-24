import Image from "next/image"
import { cn } from "cn"

import { nameOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import type { CategoryWithCount } from "@/lib/services/catalog"
import { CategoryCircle } from "@/components/product/category-circle"
import { SectionHeading } from "@/components/home/section-heading"

// "Shop by Category", as the marketplace's dense grid of round icons: every
// stocked category (its photo, or its icon until it has one or if the photo
// fails) over a two-line name, and Deals last.
//
// Phones: no heading (as in shopping apps). Up to ten circles fill two rows
// of five; with more, the rows scroll sideways and half of the fifth column
// shows at the edge, the cue that there is more. It sits right under the
// hero, so unlike the rest of the page it doesn't fade in.
//
// Tablets and desktop: the heading, then as many circles per row as fit
// (about 7rem each), wrapping onto more rows.
async function CategorySection({ categories }: { categories: CategoryWithCount[] }) {
  const stocked = categories.filter((category) => category.productCount > 0)
  if (stocked.length === 0) return null
  const t = await getT()
  // Phones: every stocked category plus the Deals tile, over two rows.
  const phoneColumns = Math.max(5, Math.ceil((stocked.length + 1) / 2))
  const scrolls = phoneColumns > 5

  const tiles = (
    <>
      {stocked.map((category) => (
        <CategoryCircle
          key={category.id}
          href={`/category/${category.slug}`}
          name={nameOf(category, t.locale)}
          slug={category.slug}
          imageUrl={category.image_url}
        />
      ))}
      <CategoryCircle
        href="/deals"
        name={t("nav.deals")}
        tone="sale"
        picture={
          <Image
            src="/images/home/deals-tile.jpg"
            alt=""
            fill
            sizes="(min-width: 640px) 112px, 80px"
            className="object-cover object-[72%_42%]"
          />
        }
      />
    </>
  )

  return (
    <section aria-labelledby="categories-heading" className="sm:space-y-4 lg:space-y-5">
      <SectionHeading
        id="categories-heading"
        title={t("home.categoriesTitle")}
        href="/categories"
        linkLabel={t("home.viewAllCategories")}
        // Hidden on phones; the section still takes its name from it.
        className="max-sm:hidden"
      />
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
        {tiles}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-x-4 gap-y-5 max-sm:hidden lg:grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] lg:gap-x-6">
        {tiles}
      </div>
    </section>
  )
}

export { CategorySection }
