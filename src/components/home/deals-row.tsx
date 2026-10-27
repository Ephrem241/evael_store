import Link from "next/link"
import { ArrowRight, ChevronRight, Sparkles, Zap } from "lucide-react"

import { formatPrice } from "@/lib/currency"
import { getT } from "@/lib/i18n/server"
import type { ProductWithCategory } from "@/lib/services/catalog"
import { ProductCard } from "@/components/product/product-card"
import { RemoteProductImage } from "@/components/product/remote-product-image"
import { Reveal } from "@/components/motion/reveal"
import { Button } from "@/components/ui/button"
import { DealsCountdown } from "@/components/home/deals-countdown"
import { ProductRail } from "@/components/home/product-rail"

// Phones and tablets: a fixed share of the width, so the last card peeks out
// (the cue that the row scrolls). Desktop: four across plus a peek of the fifth.
const ITEM_WIDTH = "w-[44%] sm:w-[31%] lg:w-[calc((100%-3rem)/4.3)]"
const CARD_SIZES = "(min-width: 1024px) 200px, (min-width: 640px) 31vw, 44vw"
const RAIL_ID = "deals-rail"

// The homepage's Flash Deals:
// Phones: side-by-side "Super Deals" and "Brand Deals" cards matching the eCommerce layout.
// Desktop: deep burgundy panel with countdown timer and scrollable rail.
async function DealsRow({
  products,
  countdown,
}: {
  products: ProductWithCategory[]
  countdown?: { endsAt: string; initialRemainingMs: number }
}) {
  if (products.length === 0) return null
  const t = await getT()

  return (
    <Reveal>
      {/* Phones: Dual Deals Section side-by-side matching reference screenshot */}
      <div className="grid grid-cols-2 gap-2.5 sm:hidden">
        {/* Card 1: Super Deals */}
        <div className="flex flex-col rounded-xl border border-border/70 bg-surface p-2.5 shadow-xs">
          <Link href="/deals" className="group flex items-center justify-between pb-2">
            <span className="flex items-center gap-1 text-xs font-bold text-charcoal group-hover:text-brand-ink">
              <Zap aria-hidden className="size-3.5 fill-sale text-sale" />
              {t("home.superDeals")}
            </span>
            <ChevronRight aria-hidden className="size-3.5 text-muted-text group-hover:text-charcoal" />
          </Link>
          <div className="grid grid-cols-2 gap-2 mt-auto">
            {products.slice(0, 2).map((p) => {
              const discount = p.compare_at_price ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100) : null
              return (
                <Link key={p.id} href={`/product/${p.slug}`} className="group flex flex-col">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-subtle">
                    {p.image_url ? (
                      <RemoteProductImage src={p.image_url} alt="" sizes="80px" />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-brand-soft/40 text-[11px] font-bold text-brand-ink">
                        {p.name_en.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-[11px] font-bold text-brand-ink">
                    {formatPrice(p.price, t)}
                  </p>
                  <p className="text-[9px] font-semibold text-sale">
                    {discount ? t("home.dealPopup.badge", { percent: discount }) : t("home.flashTitle")}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Card 2: Brand Deals */}
        <div className="flex flex-col rounded-xl border border-border/70 bg-surface p-2.5 shadow-xs">
          <Link href="/shop" className="group flex items-center justify-between pb-2">
            <span className="flex items-center gap-1 text-xs font-bold text-charcoal group-hover:text-brand-ink">
              <Sparkles aria-hidden className="size-3.5 text-gold" />
              {t("home.brandDeals")}
            </span>
            <ChevronRight aria-hidden className="size-3.5 text-muted-text group-hover:text-charcoal" />
          </Link>
          <div className="grid grid-cols-2 gap-2 mt-auto">
            {products.slice(2, 4).concat(products.slice(0, 2)).slice(0, 2).map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="group flex flex-col">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-subtle">
                  <span className="absolute top-1 left-1 z-10 rounded bg-charcoal/80 px-1 py-0.5 text-[8px] font-semibold text-white">
                    {p.categorySlug.toUpperCase()}
                  </span>
                  {p.image_url ? (
                    <RemoteProductImage src={p.image_url} alt="" sizes="80px" />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-brand-soft/40 text-[11px] font-bold text-brand-ink">
                      {p.name_en.slice(0, 2)}
                    </div>
                  )}
                </div>
                <p className="mt-1.5 truncate text-[11px] font-bold text-brand-ink">
                  {formatPrice(p.price, t)}
                </p>
                <p className="text-[9px] text-muted-text line-through">
                  {p.compare_at_price ? formatPrice(p.compare_at_price, t) : ""}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop / Tablets: original burgundy panel with countdown and rail */}
      <section
        aria-labelledby="deals-row-heading"
        className="hidden sm:grid grid-cols-1 gap-5 rounded-hero bg-brand-deepest p-4 sm:p-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-center lg:gap-8"
      >
        <div className="space-y-4 text-white lg:space-y-5">
          <div className="space-y-1.5">
            <h2 id="deals-row-heading" className="flex items-center gap-2 text-xl font-extrabold tracking-wide text-gold uppercase">
              <Zap aria-hidden className="size-6 shrink-0 fill-sale text-sale" />
              {t("home.flashTitle")}
            </h2>
            <p className="text-sm text-white/90">{t("home.flashSubtitle")}</p>
          </div>
          {countdown && <DealsCountdown {...countdown} />}
          <Button variant="gold" asChild>
            <Link href="/deals">
              {t("home.flashViewAll")}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
        <ProductRail
          id={RAIL_ID}
          label={t("home.carousel.rail", { title: t("home.flashTitle") })}
          itemClassName={ITEM_WIDTH}
          bleed={false}
          items={products.map((product) => ({
            key: product.id,
            node: <ProductCard product={product} t={t} sizes={CARD_SIZES} density="compact" className="h-full shadow-none" />,
          }))}
        />
      </section>
    </Reveal>
  )
}

export { DealsRow }
