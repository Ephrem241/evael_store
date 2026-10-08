import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import type { ProductWithCategory } from "@/lib/services/catalog"
import { ProductCard } from "@/components/product/product-card"
import { Reveal } from "@/components/motion/reveal"
import { Button } from "@/components/ui/button"
import { DealsCountdown } from "@/components/home/deals-countdown"
import { ProductRail } from "@/components/home/product-rail"

// Phones and tablets: a fixed share of the width, so the last card peeks out
// (the cue that the row scrolls). Desktop: four across plus a peek of the fifth.
const ITEM_WIDTH = "w-[44%] sm:w-[31%] lg:w-[calc((100%-3rem)/4.3)]"
const CARD_SIZES = "(min-width: 1024px) 200px, (min-width: 640px) 31vw, 44vw"
const RAIL_ID = "deals-rail"

// The homepage's Flash Deals: a deep burgundy panel. On the left (above, on
// phones): a red bolt, "FLASH DEALS" in gold capitals, its line, the
// countdown and a gold "View All Deals" button; on the right a row of compact
// white product cards — the products really on flash sale (a compare-at price
// above the price).
//
// The countdown appears ONLY when the admin has set a real end date for the
// promotion (`countdown` is passed then; see app/page.tsx). Without one there
// is no deadline to show — a timer that silently restarts every midnight would
// be invented urgency. With no flash products the whole section is left out.
// Gold on the deepest burgundy is 6.8:1; white is 16.6:1.
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
      <section
        aria-labelledby="deals-row-heading"
        className="grid grid-cols-1 gap-5 rounded-hero bg-brand-deepest p-4 sm:p-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-center lg:gap-8"
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
