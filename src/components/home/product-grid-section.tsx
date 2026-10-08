import { getT } from "@/lib/i18n/server"
import type { ProductWithCategory } from "@/lib/services/catalog"
import { ProductCard } from "@/components/product/product-card"
import { Reveal } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/home/section-heading"
import { ProductRail } from "@/components/home/product-rail"

// Six cards across on a wide screen, four on a laptop, three on a tablet and
// a little over two on a phone (the gap is 1rem from `lg`, 0.75rem below).
const ITEM_WIDTH = "w-[44%] sm:w-[31%] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-5rem)/6)]"
const CARD_SIZES = "(min-width: 1280px) 200px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 44vw"

// A homepage carousel of product cards under a heading: Trending Products
// (the admin's featured products).
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

  return (
    <Reveal>
      <section aria-labelledby={id} className="space-y-4 lg:space-y-5">
        <SectionHeading id={id} title={title} href={href} linkLabel={t("home.viewAll")} />
        <ProductRail
          id={`${id}-rail`}
          label={t("home.carousel.rail", { title })}
          itemClassName={ITEM_WIDTH}
          items={products.map((product) => ({
            key: product.id,
            node: <ProductCard product={product} t={t} sizes={CARD_SIZES} className="h-full" />,
          }))}
        />
      </section>
    </Reveal>
  )
}

export { ProductGridSection }
