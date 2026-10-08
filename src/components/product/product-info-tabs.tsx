import Link from "next/link"
import { MessageSquare } from "lucide-react"

import { formatPrice } from "@/lib/currency"
import { categoryNameOf, descriptionOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import type { ProductWithCategory } from "@/lib/services/catalog"
import { getStockStatus } from "@/lib/services/catalog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/feedback/empty-state"
import { Rating } from "@/components/product/rating"

// The product's information in three text tabs under the buy box (full width
// on desktop): the description; the specifications (code, category,
// availability, how delivery and payment work — no fee or day count that
// isn't configured, only the free-delivery amount when there is one); and the
// reviews, which are honestly empty (no review can be written yet).
async function ProductInfoTabs({
  product,
  freeDeliveryThreshold,
}: {
  product: ProductWithCategory
  freeDeliveryThreshold: number | null
}) {
  const t = await getT()
  const stock = getStockStatus(product.stock, t)
  const rows: { term: string; detail: React.ReactNode }[] = [
    { term: t("product.details.sku"), detail: product.sku },
    {
      term: t("product.details.category"),
      detail: (
        <Link
          href={`/category/${product.categorySlug}`}
          className="rounded-sm text-charcoal underline-offset-4 outline-none hover:text-brand-ink hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {categoryNameOf(product, t.locale)}
        </Link>
      ),
    },
    { term: t("product.details.availability"), detail: <span className={stock.className}>{stock.label}</span> },
    {
      term: t("product.delivery.title"),
      detail: (
        <>
          {freeDeliveryThreshold != null && (
            <span className="block font-medium text-charcoal">
              {t("cart.summary.freeDeliveryOffer", { amount: formatPrice(freeDeliveryThreshold, t) })}
            </span>
          )}
          <span className="block">{t("product.delivery.fees")}</span>
          <span className="block">{t("product.delivery.dispatch")}</span>
        </>
      ),
    },
    {
      term: t("product.payment.title"),
      detail: (
        <>
          <span className="block font-medium text-charcoal">{t("product.payment.cod")}</span>
          <span className="block">{t("product.payment.more")}</span>
        </>
      ),
    },
  ]

  return (
    <Tabs defaultValue="description" className="gap-5">
      <TabsList aria-label={t("product.tabsLabel")}>
        <TabsTrigger value="description">{t("product.description.title")}</TabsTrigger>
        <TabsTrigger value="specifications">{t("product.details.title")}</TabsTrigger>
        <TabsTrigger value="reviews">{t("product.reviews.title")}</TabsTrigger>
      </TabsList>
      <TabsContent value="description">
        <p className="max-w-3xl text-sm leading-[1.6] whitespace-pre-line text-muted-text lg:text-base">
          {descriptionOf(product, t.locale)}
        </p>
      </TabsContent>
      <TabsContent value="specifications">
        <dl className="grid max-w-3xl grid-cols-[minmax(0,8rem)_1fr] gap-x-6 gap-y-3 text-sm sm:grid-cols-[minmax(0,10rem)_1fr]">
          {rows.map((row) => (
            <div key={row.term} className="contents">
              <dt className="text-muted-text">{row.term}</dt>
              <dd className="space-y-1 leading-relaxed text-muted-text [&>a]:text-charcoal">{row.detail}</dd>
            </div>
          ))}
        </dl>
      </TabsContent>
      <TabsContent value="reviews" className="space-y-4">
        {product.rating != null && <Rating value={product.rating} t={t} />}
        <EmptyState
          icon={MessageSquare}
          title={t("product.reviews.empty")}
          description={t("product.reviews.emptyText")}
          className="py-10 sm:py-12"
        />
      </TabsContent>
    </Tabs>
  )
}

export { ProductInfoTabs }
