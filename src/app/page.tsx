import {
  getCategories,
  getFeaturedProducts,
  getNewArrivals,
  getDealsSummary,
  getFlashDeals,
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
import { ProductGridSection } from "@/components/home/product-grid-section"
import { SavingsBanner } from "@/components/home/savings-banner"
import { NewArrivals } from "@/components/home/new-arrivals"
import { LocalFeatures } from "@/components/home/local-features"
import { PaymentMethods } from "@/components/home/payment-methods"
import { WhyEvael } from "@/components/home/why-evael"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return pageMetadata({
    locale: t.locale,
    path: "/",
    socialTitle: t("meta.title", { brand: SITE_NAME }),
    description: t("meta.description"),
  })
}

// The homepage, top to bottom as in the mockup: the hero (full-bleed, right
// under the header) with the trust strip against it, Shop by Category,
// Trending Products, the Big Savings banner, Flash Deals, New Arrivals, "Built
// for Ethiopian Shoppers", Pay Your Way, and "Why Shop With Evael?" with the
// newsletter card (the footer follows from the layout). Everything is read
// from the database — the copy, the categories, the products, the size of the
// deal and whether it has a real end date. Sections with nothing to show
// (no discounts, no flash products, no stocked categories) are left out.
//
// The promotion (its copy and countdown) is also a popup that opens a few
// seconds in, once per session, plus a small floating button to reopen it
// (deal-popup.tsx).
//
// Sections are 48px apart on desktop, 28px on phones.
export default async function Home() {
  const [locale, categories, featured, newArrivals, deals, flashDeals, rawSettings] = await Promise.all([
    getLocale(),
    getCategories(),
    getFeaturedProducts(12),
    getNewArrivals(12),
    getDealsSummary(),
    getFlashDeals(12),
    getHomepageSettings(),
  ])
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

      {/* The hero and the trust strip are one block, with no gap between. */}
      <div>
        <Hero settings={settings} />
        <TrustSection />
      </div>

      <CategorySection categories={categories} />
      <ProductGridSection id="trending-heading" title={t("home.featuredTitle")} href="/shop" products={featured} />
      {deals.count > 0 && <SavingsBanner percent={deals.maxDiscountPercent} />}
      <DealsRow products={flashDeals} countdown={dealDeadline} />
      <NewArrivals products={newArrivals} />
      <LocalFeatures />
      <PaymentMethods />
      <WhyEvael />
    </div>
  )
}
