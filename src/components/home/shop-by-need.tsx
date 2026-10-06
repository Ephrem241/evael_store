import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "cn"

import { descriptionOf, nameOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import type { CategoryWithCount } from "@/lib/services/catalog"
import { ImagePlaceholder } from "@/components/product/image-placeholder"
import { getCategoryIcon } from "@/components/product/category-icons"
import { Reveal } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/home/section-heading"

// "What are you shopping for?" — the same real categories as Shop by Category,
// framed by need instead of as a catalogue index: big warm tiles with the
// category's icon, its own description (when the admin wrote one) and its
// photo to one side. With five tiles, the first is the tall one in a bento
// grid and the other four fill a 2×2 beside it; with three or four, equal
// tiles in a row (three) or a 2×2 (four) — never an empty cell.
// Ordered by how many products each holds (the fullest first), and categories
// without products are left out: a tile should lead somewhere.
const VISIBLE = 5

async function ShopByNeed({ categories }: { categories: CategoryWithCount[] }) {
  const picks = categories
    .filter((category) => category.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, VISIBLE)
  if (picks.length < 3) return null
  const t = await getT()
  const bento = picks.length === VISIBLE

  return (
    <Reveal>
      <section aria-labelledby="shop-by-need-heading" className="space-y-5 lg:space-y-6">
        <SectionHeading id="shop-by-need-heading" title={t("home.shopByNeed.title")} subtitle={t("home.shopByNeed.subtitle")} />
        <ul
          className={cn(
            "grid gap-3 sm:grid-cols-2 lg:gap-4",
            bento ? "lg:grid-cols-3 lg:grid-rows-2" : picks.length === 3 && "lg:grid-cols-3"
          )}
        >
          {picks.map((category, i) => {
            const Icon = getCategoryIcon(category.slug)
            const name = nameOf(category, t.locale)
            const description = descriptionOf(category, t.locale)
            const featured = bento && i === 0
            return (
              <li key={category.id} className={cn(featured && "sm:col-span-2 lg:col-span-1 lg:row-span-2")}>
                <Link
                  href={`/category/${category.slug}`}
                  className={cn(
                    "group relative flex h-full min-h-36 overflow-hidden rounded-card border border-brand/15 bg-brand-soft/70 outline-none transition-[box-shadow,border-color] duration-300 hover:border-brand/40 hover:shadow-lift focus-visible:ring-3 focus-visible:ring-ring/50",
                    featured ? "flex-col lg:min-h-[22rem]" : "flex-row"
                  )}
                >
                  <div className={cn("relative z-10 flex flex-col justify-between gap-4 p-5", featured ? "flex-1" : "w-3/5")}>
                    <div className="space-y-2">
                      <span className="flex size-11 items-center justify-center rounded-full bg-card text-brand shadow-soft">
                        <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                      </span>
                      <p className="text-lg font-bold tracking-tight text-charcoal">{name}</p>
                      {description && <p className="line-clamp-2 text-sm leading-snug text-charcoal/75">{description}</p>}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
                      {t("home.shopByNeed.cta", { category: name })}
                      <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                  <div className={cn("relative overflow-hidden", featured ? "h-44 lg:h-auto lg:flex-1" : "w-2/5")}>
                    <ImagePlaceholder
                      seed={category.id}
                      icon={Icon}
                      label={name}
                      decorative
                      imageUrl={category.image_url || null}
                      sizes={featured ? "(min-width: 1024px) 400px, 100vw" : "(min-width: 1024px) 160px, 40vw"}
                      aspectClassName="size-full"
                      className="rounded-none transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </Reveal>
  )
}

export { ShopByNeed }
