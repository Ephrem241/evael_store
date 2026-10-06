import { Flame } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import type { ProductWithCategory } from "@/lib/services/catalog"
import { ProductCard } from "@/components/product/product-card"
import { Reveal } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/home/section-heading"
import { CarouselControls } from "@/components/home/carousel-controls"
import { DealsCountdown } from "@/components/home/deals-countdown"

// The homepage's Flash Deals: a soft orange panel holding a sideways-scrolling
// row of the products actually on sale right now (compare-at price above the
// price), same rail idiom as New Arrivals.
//
// The countdown appears ONLY when the admin has set a real end date for the
// promotion (`countdown` is passed then; see app/page.tsx). Without one there
// is no deadline to show — a timer that silently restarts every midnight would
// be invented urgency.
// Phones and tablets: a fixed share of the width, so the last card peeks out
// (the cue that the row scrolls). Desktop, which has arrows: exactly four,
// then five, cards across (the gap is 1rem).
const ITEM_WIDTH = "w-[46%] sm:w-[31%] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]"
const CARD_SIZES = "(min-width: 1280px) 230px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 46vw"
const RAIL_ID = "deals-rail"

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
        className="-mx-4 space-y-5 bg-brand-soft px-4 py-6 sm:mx-0 sm:rounded-hero sm:px-6 sm:py-8 lg:px-8"
      >
        <SectionHeading
          id="deals-row-heading"
          title={t("home.flashTitle")}
          subtitle={t("home.flashSubtitle")}
          icon={<Flame aria-hidden className="size-7 shrink-0 fill-brand/20 text-brand" />}
          href="/deals"
          linkLabel={t("home.viewAll")}
          actions={
            <>
              {countdown && (
                <div className="hidden md:block">
                  <DealsCountdown {...countdown} variant="tiles" />
                </div>
              )}
              {/* Arrows on desktop only: phones and tablets swipe. */}
              <div className="hidden lg:contents">
                <CarouselControls targetId={RAIL_ID} />
              </div>
            </>
          }
        />
        {countdown && (
          <div className="md:hidden">
            <DealsCountdown {...countdown} variant="tiles" />
          </div>
        )}
        {/* A scrollable region: focusable so the keyboard can scroll it. */}
        <div
          id={RAIL_ID}
          role="region"
          aria-label={t("home.carousel.rail", { title: t("home.flashTitle") })}
          tabIndex={0}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto scroll-smooth px-4 pt-1 pb-2 sm:scroll-px-6 lg:scroll-px-0 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:-mx-6 sm:px-6 lg:mx-0 lg:gap-4 lg:px-0 [&>*]:shrink-0 [&>*]:snap-start"
        >
          {products.map((product) => (
            <div key={product.id} className={ITEM_WIDTH}>
              <ProductCard product={product} t={t} sizes={CARD_SIZES} className="h-full" />
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  )
}

export { DealsRow }
