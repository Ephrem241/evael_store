import { ThumbsUp, TrendingUp } from "lucide-react"
import {
  getCategories,
  getFeaturedProducts,
  getNewArrivals,
  getDealsSummary,
  getFlashDeals,
  getPopularProducts,
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
import { MobileHomeCarousel } from "@/components/home/mobile-home-carousel"
import { DealsSlide } from "@/components/home/mobile-home-slides"
import { TrustSection } from "@/components/home/trust-section"
import { DealsRow } from "@/components/home/deals-row"
import { DealPopup } from "@/components/home/deal-popup"
import { CategorySection } from "@/components/home/category-section"
import { ProductGridSection } from "@/components/home/product-grid-section"
import { NewArrivals } from "@/components/home/new-arrivals"
import { ShopByNeed } from "@/components/home/shop-by-need"
import { LifestyleBanner } from "@/components/home/lifestyle-banner"
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

// The homepage, in the order a shopper reads it: the hero, the trust strip,
// flash deals, categories, trending (featured) products, new arrivals,
// popular picks, shop by need, the promotional banner and "why Evael" (the
// footer, with the newsletter, follows from the layout). Everything is read
// from the database — the copy, the categories, the products, the size of the
// deal and whether it has a real end date. The hero is full-bleed: it breaks
// out of the layout's Container and cancels this wrapper's top padding itself.
//
// The promotion (its copy and countdown) is also a popup that opens a few
// seconds in, once per session, plus a small floating button to reopen it
// (deal-popup.tsx).
//
// Phones: the hero and the special-deals card become one swipeable carousel
// at the top — same copy, pictures and links, presented the way a shopping app
// would. Desktop shows the hero alone (the `hidden lg:block` wrapper).
export default async function Home() {
  const [locale, categories, featured, newArrivals, popular, deals, flashDeals, rawSettings] = await Promise.all([
    getLocale(),
    getCategories(),
    getFeaturedProducts(8),
    getNewArrivals(10),
    getPopularProducts(8),
    getDealsSummary(),
    getFlashDeals(10),
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
    // Phones get the tighter rhythm of a shopping app (32px between sections).
    <div className="space-y-8 py-6 sm:space-y-12 lg:space-y-16 lg:py-10">
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

      {/* The page's one real <h1>, kept separate from the two Hero renders
          below (mobile carousel + desktop): each of those draws the same
          headline as plain, aria-hidden text, since a second literal <h1>
          would exist in the DOM even while `display:none` — invalid
          regardless of which copy is visible at a given width. */}
      <h1 id="hero-heading" className="sr-only">
        {settings.heroHeadline}
      </h1>

      <div className="-mt-6 lg:hidden">
        <MobileHomeCarousel
          slides={[
            <Hero key="hero" settings={settings} showHeading={false} variant="slide" />,
            ...(dealSettings ? [<DealsSlide key="deals" settings={dealSettings} />] : []),
          ]}
        />
      </div>
      {/* The trust strip tucks in close under the hero (a tighter gap than between sections). */}
      <div className="hidden lg:block lg:mb-8!">
        <Hero settings={settings} showHeading={false} />
      </div>

      <TrustSection />
      <DealsRow products={flashDeals} countdown={dealDeadline} />
      <CategorySection categories={categories} />
      <ProductGridSection
        id="trending-heading"
        title={t("home.featuredTitle")}
        icon={<TrendingUp aria-hidden className="size-6 shrink-0 text-brand" />}
        href="/shop"
        products={featured}
      />
      <NewArrivals products={newArrivals} />
      <ProductGridSection
        id="popular-heading"
        title={t("home.popularTitle")}
        icon={<ThumbsUp aria-hidden className="size-6 shrink-0 text-brand" />}
        href="/shop?sort=popular"
        products={popular}
      />
      <ShopByNeed categories={categories} />
      <LifestyleBanner />
      <WhyEvael />
    </div>
  )
}
