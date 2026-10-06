import type { ReactNode } from "react"
import Link from "next/link"
import { Banknote, Mail } from "lucide-react"
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
import { Newsletter } from "@/components/home/newsletter"
import { ContactChannels } from "@/components/contact/contact-channels"
import { MobileCollapsible } from "@/components/ui/mobile-collapsible"

const columns: { id: string; title: MessageKey; links: { href: string; label: MessageKey }[] }[] = [
  {
    id: "footer-service",
    title: "footer.customerService",
    links: [
      { href: "/contact", label: "footer.contact" },
      { href: "/delivery", label: "footer.delivery" },
      { href: "/returns", label: "footer.returns" },
      { href: "/faq", label: "footer.faq" },
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

// How many categories the Shop column lists before "All categories".
const SHOP_LINKS = 4

// The footer's content sits in a narrower column than the page (1024px, not
// 1280px), so its few short links don't stretch across a wide screen.
const FOOTER_WIDTH = "max-w-5xl"

// Below `lg` every link is a full 44px row inside its folding section.
const linkClass =
  "rounded text-sm text-white/70 underline-offset-4 transition-colors outline-none hover:text-white hover:underline focus-visible:text-white focus-visible:underline max-lg:flex max-lg:min-h-11 max-lg:items-center"
const listClass = "space-y-1.5 max-lg:space-y-0 max-lg:pb-2"
const headingClass = "text-xs font-semibold tracking-[0.14em] text-white uppercase"
// The phone toggle row, styled like the desktop column heading.
const triggerClass =
  "min-h-11 px-0 font-sans text-xs tracking-[0.14em] text-white uppercase active:bg-white/5 focus-visible:ring-brand/50"

// One link column. From `lg` up: a heading and the list, as always. Below it:
// a row that folds the list away (closed by default), so the footer is a few
// short rows on a phone instead of a long page of links. The links stay in the
// HTML either way (closed only hides them with CSS below `lg`).
function FooterColumn({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <nav aria-labelledby={id} className="space-y-2.5 max-lg:space-y-0 max-lg:border-b max-lg:border-white/10">
      <h2 id={id} className={cn(headingClass, "max-lg:hidden")}>
        {title}
      </h2>
      <MobileCollapsible id={`${id}-links`} label={title} triggerClassName={triggerClass}>
        {children}
      </MobileCollapsible>
    </nav>
  )
}

// The closing band: a warm near-black, white type, orange accents. It opens
// with the newsletter (so every page ends on it, the homepage included). The
// Shop column lists the shop's own categories (from the database), so it can
// never point at one that doesn't exist. No social column: the store has no
// social accounts configured yet, and a dead icon would be worse than none.
async function Footer() {
  const [t, categories, contact] = await Promise.all([getT(), getNavCategories(), getStoreContact()])
  const hasChannels = Boolean(contact.telegram || contact.whatsapp || contact.phone)

  return (
    // Bottom padding on phones: room for the fixed bottom bar (BottomNav, or
    // the product page's buy bar) — 4rem plus the iPhone home-indicator inset
    // it grows by, so the language switcher in the last row stays clear of it.
    <footer className="mt-8 bg-footer pb-[calc(4rem+env(safe-area-inset-bottom))] text-white/80 lg:mt-10 lg:pb-0">
      <div className="border-b border-white/10">
        <Container
          className={cn(FOOTER_WIDTH, "grid gap-4 py-5 lg:grid-cols-[1fr_minmax(0,24rem)] lg:items-center lg:gap-8 lg:py-6")}
        >
          <div className="flex items-start gap-4">
            <span className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand sm:flex">
              <Mail aria-hidden className="size-5" />
            </span>
            <div className="space-y-1">
              <h2 className="text-lg font-bold tracking-tight text-white lg:text-xl">{t("home.newsletter.title")}</h2>
              <p className="max-w-md text-sm leading-relaxed text-white/70">
                {t("home.newsletter.text", { brand: BRAND_NAME })}
              </p>
            </div>
          </div>
          <Newsletter />
        </Container>
      </div>

      <Container className={cn(FOOTER_WIDTH, "grid py-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-8 lg:py-7")}>
        <div className="space-y-3 max-lg:space-y-0 max-lg:pb-3">
          <Logo variant="light" />
          {/* Phones show the logo alone: the tagline is the first thing cut for height. */}
          <p className="max-w-xs text-sm leading-relaxed text-white/70 max-lg:hidden">{t("footer.tagline")}</p>
          {hasChannels && (
            <div className="space-y-2 max-lg:pt-3">
              <h2 className={headingClass}>{t("footer.reachUs")}</h2>
              <ContactChannels contact={contact} variant="dark" />
            </div>
          )}
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
              <li>
                <Link href="/categories" className={linkClass}>
                  {t("footer.allCategories")}
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
      </Container>

      <div className="border-t border-white/10">
        <Container className={cn(FOOTER_WIDTH, "flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between")}>
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-5">
            <p className="text-xs text-white/60">
              {t("footer.rights", { year: new Date().getFullYear(), brand: BRAND_NAME })}
            </p>
            {/* Only what checkout really takes — see the homepage's payment strip. */}
            <p className="flex items-center gap-1.5 text-xs text-white/60">
              <Banknote aria-hidden className="size-3.5 text-brand" />
              {t("home.payments.weAccept", { methods: t("home.payments.cod") })}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>{t("footer.language")}</span>
            <LanguageSwitcher labels="full" tone="dark" />
          </div>
        </Container>
      </div>
    </footer>
  )
}

export { Footer }
