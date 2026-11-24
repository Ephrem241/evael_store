import {
  getCategories,
  getFeaturedProducts,
  getNewArrivals,
  getDealsSummary,
  getFlashDeals,
  getProducts,
  getRunningSaleEvents,
} from "@/lib/services/catalog-queries"
import { getHomepageSettings } from "@/lib/services/homepage-queries"
import { dealsCountdown, fillDealTokens, localizeHomepage } from "@/lib/services/homepage"
import type { Metadata } from "next"

import { getLocale, getT } from "@/lib/i18n/server"
import { pageMetadata } from "@/lib/seo/metadata"
import { SITE_NAME } from "@/lib/seo/site"
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld"
import { JsonLd } from "@/components/seo/json-ld"
import { Hero } from "@/components/home/hero"
import { TrustSection } from "@/components/home/trust-section"
import { DealsRow } from "@/components/home/deals-row"
import { DealPopup } from "@/components/home/deal-popup"
import { CategorySection } from "@/components/home/category-section"
import { SavingsBanner } from "@/components/home/savings-banner"
import { PaymentMethods } from "@/components/home/payment-methods"
import { SaleEventBanner } from "@/components/home/sale-event-banner"
import { PromoTiles } from "@/components/home/promo-tiles"
import { ForYouFeed } from "@/components/home/for-you-feed"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return pageMetadata({
    locale: t.locale,
    path: "/",
    socialTitle: t("meta.title", { brand: SITE_NAME }),
    description: t("meta.description"),
  })
}

// The homepage, in the marketplace layout (one long shopping page that ends
// in an endless feed), top to bottom: the hero (full-bleed, right under the
// header) with the trust strip against it; Shop by Category as a dense grid
// of round icons; the promo tiles (Trending, New Arrivals, Flash Deals: two
// real products each, every tile a way into its list); a running holiday
// sale's banner; the Big Savings banner; Flash Deals; Pay Your Way; and
// "For You", the whole catalogue with "View more" (the footer follows from
// the layout). Phones: the hero is a card on the header's burgundy, then a
// white sheet with the perks and the category circles, then the same
// sections. Everything is read from the database — the copy, the categories, the
// products, the size of the deal and whether it has a real end date. Sections
// with nothing to show (no discounts, no flash products, no stocked
// categories) are left out.
//
// The promotion (its copy and countdown) is also a popup that opens a few
// seconds in, once per session, plus a small floating button to reopen it
// (deal-popup.tsx).
//
// Sections are 48px apart on desktop, 28px on phones.
export default async function Home() {
  const [locale, categories, featured, newArrivals, deals, flashDeals, rawSettings, saleEvents, feed] = await Promise.all([
    getLocale(),
    getCategories(),
    getFeaturedProducts(2),
    getNewArrivals(2),
    getDealsSummary(),
    getFlashDeals(12),
    getHomepageSettings(),
    getRunningSaleEvents(),
    // The For You feed's first page: the same query /api/products answers for "View more".
    getProducts({ page: 1 }),
  ])
  // A running holiday / special sale (the biggest, if several) gets its banner
  // right under the categories.
  const saleEvent = saleEvents[0]
  const settings = localizeHomepage(rawSettings, locale)
  const t = await getT()
  // No discounted product, no deals banner or popup: they would have nothing to point at.
  const dealSettings = deals.count > 0 ? fillDealTokens(settings, deals.maxDiscountPercent) : null
  // Flash Deals shows a countdown only for a real, admin-set end date.
  const countdown = dealsCountdown(settings)
  const dealDeadline = countdown.rolling ? undefined : countdown

  return (
    <div className="space-y-7 pb-4 lg:space-y-12 lg:pb-6">
      <JsonLd nodes={[organizationJsonLd(t("meta.description")), websiteJsonLd(locale)]} />

      {/* Takes no room in the flow (a portal plus a fixed floating button).
          Kept near the top on purpose: `space-y-*` spaces every child but the
          last, so a button appearing at the end would move the page. */}
      {dealSettings && (
        <DealPopup
          eyebrow={dealSettings.promoEyebrow}
          headline={dealSettings.promoHeadline}
          subtext={dealSettings.promoSubtext}
          ctaLabel={dealSettings.promoCtaLabel}
          ctaHref={dealSettings.promoCtaHref}
          percent={deals.maxDiscountPercent}
          {...dealsCountdown(dealSettings)}
        />
      )}

      {/* The hero and the trust strip are one block, with no gap between.
          Phones: the perks and the category grid sit on one white sheet whose
          rounded top rises over the hero's burgundy band. The sheet is its own
          full-bleed layer, so what is on it keeps the page's width. */}
      <div>
        <Hero settings={settings} dealPercent={deals.count > 0 ? deals.maxDiscountPercent : null} />
        {/* A gap, not space-y: space-y would give the absolute sheet a margin too, shortening it. */}
        <div className="relative isolate flex flex-col gap-4 max-lg:-mt-3 max-lg:pt-3 max-lg:pb-4 lg:gap-12">
          <div
            aria-hidden
            className="absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 rounded-t-2xl bg-surface lg:hidden"
          />
          <TrustSection />
          <CategorySection categories={categories} />
        </div>
      </div>
      <PromoTiles
        tiles={[
          { id: "trending", title: t("home.featuredTitle"), href: "/shop", products: featured },
          { id: "new", title: t("home.newArrivalsTitle"), href: "/shop?sort=newest", products: newArrivals },
          { id: "deals", title: t("home.flashTitle"), href: "/deals", products: flashDeals },
        ]}
      />
      {saleEvent && <SaleEventBanner event={saleEvent} categories={categories} />}
      {deals.count > 0 && <SavingsBanner percent={deals.maxDiscountPercent} />}
      <DealsRow products={flashDeals} countdown={dealDeadline} />
      <PaymentMethods />
      <ForYouFeed first={feed} />
    </div>
  )
}
