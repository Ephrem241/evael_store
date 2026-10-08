import { getT } from "@/lib/i18n/server"
import type { ProductWithCategory } from "@/lib/services/catalog"
import { ProductTile } from "@/components/product/product-tile"
import { Reveal } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/home/section-heading"
import { ProductRail } from "@/components/home/product-rail"

// Six tiles across on a wide screen, four on a laptop, three on a tablet and
// a little over two on a phone (the last one peeking out).
const ITEM_WIDTH = "w-[44%] sm:w-[31%] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-5rem)/6)]"
const RAIL_ID = "new-arrivals-rail"

// New Arrivals: the newest products as light image tiles (photo, heart,
// name and price) in a sideways row.
async function NewArrivals({ products }: { products: ProductWithCategory[] }) {
  if (products.length === 0) return null
  const t = await getT()

  return (
    <Reveal>
      <section aria-labelledby="new-arrivals-heading" className="space-y-4 lg:space-y-5">
        <SectionHeading
          id="new-arrivals-heading"
          title={t("home.newArrivalsTitle")}
          href="/shop?sort=newest"
          linkLabel={t("home.viewAll")}
        />
        <ProductRail
          id={RAIL_ID}
          label={t("home.carousel.rail", { title: t("home.newArrivalsTitle") })}
          itemClassName={ITEM_WIDTH}
          items={products.map((product) => ({ key: product.id, node: <ProductTile product={product} t={t} /> }))}
        />
      </section>
    </Reveal>
  )
}

export { NewArrivals }
