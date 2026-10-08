// Dev-only reference for the design system (a 404 in production builds, see
// layout.tsx). Not linked from any navigation.
//
// Foundations (colours, type, shape) and the interactive primitives are client
// components; the product card and the category tiles below are server
// components, shown with real catalogue rows.

import { getT } from "@/lib/i18n/server"
import { isOnSale } from "@/lib/services/catalog"
import { getCategories, getFeaturedProducts } from "@/lib/services/catalog-queries"
import { ProductCard } from "@/components/product/product-card"
import { CategoryCard, DealsTile } from "@/components/product/category-card"
import { Foundations } from "./foundations"
import { Primitives } from "./primitives"

export default async function StyleGuidePage() {
  const [t, products, categories] = await Promise.all([getT(), getFeaturedProducts(4), getCategories()])
  const discounted = products.find(isOnSale)
  const stocked = categories.find((c) => c.image_url && c.productCount > 0)
  const empty = categories.find((c) => c.productCount === 0)

  return (
    <div className="mx-auto max-w-5xl space-y-16 py-12">
      <Foundations />
      <Primitives sample={discounted && { price: discounted.price, compareAtPrice: discounted.compare_at_price }} />

      <section className="space-y-4">
        <h2 className="type-section text-charcoal">Product card</h2>
        <p className="text-sm text-muted-text">Real products. The last card previews the sold-out state of the first.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} t={t} />
          ))}
          {products[0] && <ProductCard product={{ ...products[0], stock: 0 }} t={t} />}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="type-section text-charcoal">Category tiles</h2>
        <p className="text-sm text-muted-text">Portrait (home row), an empty category, the Deals tile, and landscape.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {stocked && <CategoryCard category={stocked} />}
          {empty && <CategoryCard category={empty} />}
          <DealsTile />
          {stocked && <CategoryCard category={stocked} aspectClassName="aspect-[4/3]" className="self-end" />}
        </div>
      </section>
    </div>
  )
}
