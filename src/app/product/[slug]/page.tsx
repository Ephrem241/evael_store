import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Banknote, Truck } from "lucide-react"

import { formatPrice } from "@/lib/currency"
import { categoryNameOf, descriptionOf, nameOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import { pageMetadata, pagePath, truncateDescription } from "@/lib/seo/metadata"
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/json-ld"
import { getStockStatus, isOnSale } from "@/lib/services/catalog"
import { getProductBySlug, getProducts } from "@/lib/services/catalog-queries"
import { getFreeDeliveryThreshold } from "@/lib/services/store-settings"
import { JsonLd } from "@/components/seo/json-ld"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductPurchaseActions } from "@/components/product/product-purchase-actions"
import { ProductInfoTabs } from "@/components/product/product-info-tabs"
import { ProductCard } from "@/components/product/product-card"
import { RecentlyViewed } from "@/components/product/recently-viewed"
import { Price } from "@/components/product/price"
import { DiscountBadge } from "@/components/product/discount-badge"
import { Rating } from "@/components/product/rating"
import { InfoCell } from "@/components/ui/info-cell"
import { SectionHeading } from "@/components/home/section-heading"
import { ProductRail } from "@/components/home/product-rail"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const [product, t] = await Promise.all([getProductBySlug(slug), getT()])
  if (!product) return { title: t("catalog.productNotFound") }

  const name = nameOf(product, t.locale)
  return pageMetadata({
    locale: t.locale,
    path: `/product/${product.slug}`,
    title: name,
    description: truncateDescription(descriptionOf(product, t.locale)),
    image: product.image_url ? { url: product.image_url, alt: name } : null,
  })
}

// Four related products across on desktop, a little over two on a phone.
const RELATED_WIDTH = "w-[44%] sm:w-[31%] lg:w-[calc((100%-3rem)/4)]"

// No loading.tsx in this segment on purpose: it would create an implicit
// Suspense boundary that starts streaming a 200 before notFound() below can
// resolve, permanently locking in the wrong status (same fix applied to
// category/[slug] last phase).
//
// Phones and tablets, top to bottom: the photos (from the very top of the
// screen, with back, heart and share over them) and their thumbnails; the
// title, the rating when there is one and the category; the price, the
// original price and the red "% OFF" pill; the stock line; the quantity
// beside Add to Cart; two small facts (delivery, cash on delivery); the
// Description / Specifications / Reviews tabs; more from the category. Buy Now
// is pinned to the bottom of the screen.
//
// Desktop: the breadcrumb, then two columns — the gallery with its
// thumbnails down the left, and the same buy box in the same order on the
// right, with Buy Now as an outline button under Add to Cart — then the tabs
// across the page and the related products as a carousel.
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [product, t, freeDeliveryThreshold] = await Promise.all([getProductBySlug(slug), getT(), getFreeDeliveryThreshold()])
  if (!product) notFound()

  // More from the same category, this product left out.
  const related = (await getProducts({ categorySlug: product.categorySlug, pageSize: 13 })).products
    .filter((p) => p.id !== product.id)
    .slice(0, 12)

  const hasDiscount = isOnSale(product)
  const stock = getStockStatus(product.stock, t)
  const name = nameOf(product, t.locale)
  const categoryName = categoryNameOf(product, t.locale)
  const categoryPath = `/category/${product.categorySlug}`
  const productPath = `/product/${product.slug}`

  return (
    <div className="space-y-8 py-4 lg:space-y-12 lg:py-8">
      <JsonLd
        nodes={[
          productJsonLd({
            product,
            name,
            description: truncateDescription(descriptionOf(product, t.locale), 500),
            url: pagePath(productPath, t.locale),
            categoryName,
          }),
          breadcrumbJsonLd([
            { name: t("nav.home"), url: "/" },
            { name: categoryName, url: categoryPath },
            { name, url: productPath },
          ]),
        ]}
      />

      <div className="max-lg:hidden">
        <Breadcrumb
          items={[
            { label: t("nav.home"), href: "/" },
            { label: categoryName, href: categoryPath },
            { label: name },
          ]}
        />
      </div>

      {/* [&>*]:min-w-0 — a grid item defaults to its content's minimum width, so
          without it one wide child (a price, a button row) widens the whole
          column past a small screen. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-12 [&>*]:min-w-0">
        <ProductGallery
          productId={product.id}
          productName={name}
          categorySlug={product.categorySlug}
          imageUrls={product.image_urls ?? (product.image_url ? [product.image_url] : [])}
          soldOut={product.stock <= 0}
          backHref={categoryPath}
        />

        <div className="space-y-5 lg:pt-1">
          <div className="space-y-2.5">
            <h1 className="type-product-title text-charcoal">{name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {product.rating != null && <Rating value={product.rating} t={t} />}
              <Link
                href={categoryPath}
                className="inline-flex h-6 items-center rounded-full bg-subtle px-2.5 text-xs font-medium text-muted-text transition-colors outline-none hover:bg-brand-soft hover:text-brand-ink focus-visible:ring-2 focus-visible:ring-ring"
              >
                {categoryName}
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Price amount={product.price} t={t} className="type-price-lg" />
              {hasDiscount && <Price amount={product.compare_at_price!} t={t} variant="compare" className="text-sm" />}
              <DiscountBadge price={product.price} compareAtPrice={product.compare_at_price} t={t} variant="sale" />
            </div>
            <p className={`flex items-center gap-2 text-sm font-medium ${stock.className}`}>
              <span aria-hidden className="size-2 rounded-full bg-current" />
              {stock.label}
            </p>
          </div>

          <ProductPurchaseActions product={product} />

          <div className="grid grid-cols-2 gap-2.5">
            <InfoCell
              icon={Truck}
              title={t("product.info.deliveryTitle")}
              detail={
                freeDeliveryThreshold != null
                  ? t("product.info.deliveryFree", { amount: formatPrice(freeDeliveryThreshold, t) })
                  : t("product.info.deliveryFee")
              }
            />
            <InfoCell icon={Banknote} title={t("product.info.codTitle")} detail={t("product.info.codText")} />
          </div>
        </div>
      </div>

      <ProductInfoTabs product={product} freeDeliveryThreshold={freeDeliveryThreshold} />

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="space-y-4 lg:space-y-5">
          <SectionHeading id="related-heading" title={t("product.related", { category: categoryName })} />
          <ProductRail
            id="related-rail"
            label={t("home.carousel.rail", { title: t("product.related", { category: categoryName }) })}
            itemClassName={RELATED_WIDTH}
            items={related.map((item) => ({
              key: item.id,
              node: (
                <ProductCard
                  product={item}
                  t={t}
                  hideAddToCart
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 31vw, 44vw"
                  className="h-full"
                />
              ),
            }))}
          />
        </section>
      )}

      <RecentlyViewed productId={product.id} />
    </div>
  )
}
