import { getT } from "@/lib/i18n/server"
import type { ProductWithCategory } from "@/lib/services/catalog"
import { ProductGrid } from "@/components/product/product-grid"
import { Reveal } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/home/section-heading"

// A homepage grid of products under a heading: Trending Now (the admin's
// featured products) and Popular Picks (the admin's popular ones). Whole rows
// only, never a lonely card on the last one: eight products are two rows of
// four on desktop, six on a tablet and four on a phone; four (or five to
// seven) are one row of four, three on a tablet, four on a phone. Fewer than
// four are shown as they are.
const CARD_SIZES = "(min-width: 1280px) 290px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 47vw"

// Static class strings (Tailwind only generates classes it can see whole).
const HIDE_FOR_EIGHT = "max-sm:[&>*:nth-child(n+5)]:hidden sm:max-lg:[&>*:nth-child(n+7)]:hidden"
const HIDE_FOR_FOUR = "sm:max-lg:[&>*:nth-child(n+4)]:hidden"

async function ProductGridSection({
  id,
  title,
  href,
  products,
}: {
  id: string
  title: string
  href: string
  products: ProductWithCategory[]
}) {
  if (products.length === 0) return null
  const t = await getT()
  const count = products.length >= 8 ? 8 : products.length >= 4 ? 4 : products.length

  return (
    <Reveal>
      <section aria-labelledby={id} className="space-y-5 lg:space-y-6">
        <SectionHeading id={id} title={title} href={href} linkLabel={t("home.viewAll")} />
        <ProductGrid
          products={products.slice(0, count)}
          sizes={CARD_SIZES}
          className={count === 8 ? HIDE_FOR_EIGHT : count === 4 ? HIDE_FOR_FOUR : undefined}
        />
      </section>
    </Reveal>
  )
}

export { ProductGridSection }
