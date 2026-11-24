import { getT } from "@/lib/i18n/server"
import type { ProductListResult } from "@/lib/services/catalog"
import { ProductCard } from "@/components/product/product-card"
import { ForYouMore } from "@/components/home/for-you-more"
import { FEED_CARD_SIZES, FEED_GRID_CLASS } from "@/components/home/feed-grid"

// "For You": the endless product feed that closes the home page, in the
// marketplace style. The whole active catalogue in the shop's recommended
// order, the first page rendered on the server and "View more" adding the
// next pages below (for-you-more.tsx, through /api/products, the same code as
// /shop). The page size (12) fills two, three, four or six columns evenly.
async function ForYouFeed({ first }: { first: ProductListResult }) {
  if (first.products.length === 0) return null
  const t = await getT()

  return (
    <section aria-labelledby="for-you-heading" className="space-y-4 lg:space-y-5">
      <h2 id="for-you-heading" className="flex items-center justify-center gap-3 type-section text-charcoal">
        <span aria-hidden className="h-px w-8 bg-gold sm:w-14" />
        {t("home.forYouTitle")}
        <span aria-hidden className="h-px w-8 bg-gold sm:w-14" />
      </h2>
      <div className={FEED_GRID_CLASS}>
        {first.products.map((product) => (
          <ProductCard key={product.id} product={product} t={t} sizes={FEED_CARD_SIZES} />
        ))}
      </div>
      <ForYouMore page={first.page} totalPages={first.totalPages} />
    </section>
  )
}

export { ForYouFeed }
