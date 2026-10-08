import type { ReactNode } from "react"
import Link from "next/link"
import { cn } from "cn"

import { BRAND_NAME } from "@/lib/brand"
import { nameOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import type { MessageKey } from "@/lib/i18n/translator"
import { getNavCategories } from "@/lib/services/nav-queries"
import { getStoreContact } from "@/lib/services/store-info"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/layout/logo"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { EthiopiaFlag } from "@/components/layout/ethiopia-flag"
import { Newsletter } from "@/components/home/newsletter"
import { ContactChannels } from "@/components/contact/contact-channels"
import { MobileCollapsible } from "@/components/ui/mobile-collapsible"

const columns: { id: string; title: MessageKey; links: { href: string; label: MessageKey }[] }[] = [
  {
    id: "footer-care",
    title: "footer.customerService",
    links: [
      { href: "/contact", label: "footer.contact" },
      { href: "/faq", label: "footer.faq" },
      { href: "/delivery", label: "footer.delivery" },
      { href: "/returns", label: "footer.returns" },
    ],
  },
  {
    id: "footer-company",
    title: "footer.company",
    links: [
      { href: "/about", label: "footer.about" },
      { href: "/privacy", label: "footer.privacy" },
      { href: "/terms", label: "footer.terms" },
    ],
  },
]

// How many categories the Shop column lists before Deals.
const SHOP_LINKS = 4

// Below `lg` every link is a full 44px row inside its folding section.
const linkClass =
  "rounded-sm text-xs text-white/70 transition-colors outline-none hover:text-gold focus-visible:text-gold focus-visible:underline max-lg:flex max-lg:min-h-11 max-lg:items-center max-lg:text-sm"
const listClass = "space-y-2.5 max-lg:space-y-0 max-lg:pb-2"
const headingClass = "text-[13px] font-semibold text-white"
// The phone toggle row, styled like the desktop column heading.
const triggerClass =
  "min-h-12 px-0 font-sans text-sm font-semibold tracking-normal text-white active:bg-white/5 focus-visible:ring-gold/60"

// One link column. From `lg` up: a heading and the list. Below it: a row that
// folds the list away (closed by default), so the footer is a few short rows
// on a phone instead of a long page of links. The links stay in the HTML
// either way (closed only hides them with CSS below `lg`).
function FooterColumn({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <nav aria-labelledby={id} className="space-y-3.5 max-lg:space-y-0 max-lg:border-b max-lg:border-white/10">
      <h2 id={id} className={cn(headingClass, "max-lg:hidden")}>
        {title}
      </h2>
      <MobileCollapsible id={`${id}-links`} label={title} triggerClassName={triggerClass}>
        {children}
      </MobileCollapsible>
    </nav>
  )
}

// The closing band: near-black with white type and gold accents. Desktop: the
// brand (logo, tagline, the shop's real contact channels), Shop (the shop's
// own categories, from the database, so it can never point at one that
// doesn't exist), Customer Care, Company and the newsletter. Phones: the brand,
// the link columns folded away, the newsletter and a language switch (the
// desktop one is in the announcement bar). No social-media icons: the store
// has none configured, and a dead icon would be worse than none.
async function Footer() {
  const [t, categories, contact] = await Promise.all([getT(), getNavCategories(), getStoreContact()])

  return (
    // Bottom padding on phones: room for the fixed bottom bar (BottomNav, or
    // the product page's buy bar) — 4rem plus the iPhone home-indicator inset
    // it grows by, so the last row stays clear of it.
    <footer className="mt-8 bg-footer pb-[calc(4rem+env(safe-area-inset-bottom))] text-white/80 lg:mt-12 lg:pb-0">
      <Container className="grid gap-x-10 gap-y-6 pt-8 pb-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.6fr] lg:pt-12 lg:pb-10">
        <div className="space-y-4 max-lg:pb-2">
          <Logo variant="light" />
          <p className="text-xs text-white/70">{t("nav.tagline")}</p>
          <ContactChannels contact={contact} variant="dark" />
        </div>

        {/* The first folding row gets the top rule; each row draws the one below it. */}
        <div className="max-lg:border-t max-lg:border-white/10 lg:contents">
          <FooterColumn id="footer-shop" title={t("footer.shop")}>
            <ul className={listClass}>
              {categories.slice(0, SHOP_LINKS).map((category) => (
                <li key={category.id}>
                  <Link href={`/category/${category.slug}`} className={linkClass}>
                    {nameOf(category, t.locale)}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/deals" className={linkClass}>
                  {t("nav.deals")}
                </Link>
              </li>
            </ul>
          </FooterColumn>
        </div>

        {columns.map((column) => (
          <FooterColumn key={column.id} id={column.id} title={t(column.title)}>
            <ul className={listClass}>
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>
        ))}

        <section aria-labelledby="footer-subscribe" className="space-y-3 max-lg:pt-2">
          <h2 id="footer-subscribe" className={headingClass}>
            {t("footer.subscribe")}
          </h2>
          <p className="text-xs text-white/70">{t("footer.subscribeText")}</p>
          <Newsletter />
        </section>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/60">{t("footer.rights", { year: new Date().getFullYear(), brand: BRAND_NAME })}</p>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            {/* Phones and tablets only: the desktop switch is in the announcement bar. */}
            <div className="flex items-center gap-2 text-xs text-white/60 lg:hidden">
              <span>{t("footer.language")}</span>
              <LanguageSwitcher labels="full" tone="dark" />
            </div>
            <p className="flex items-center gap-2 text-xs text-white/70">
              {t("footer.madeFor")}
              <EthiopiaFlag />
            </p>
          </div>
        </Container>
      </div>
    </footer>
  )
}

export { Footer }
