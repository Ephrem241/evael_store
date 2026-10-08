"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import type { MessageKey } from "@/lib/i18n/translator"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { LanguageSwitcher } from "@/components/layout/language-switcher"

const INFO_LINKS: { href: string; label: MessageKey }[] = [
  { href: "/about", label: "footer.about" },
  { href: "/contact", label: "footer.contact" },
  { href: "/faq", label: "footer.faq" },
  { href: "/delivery", label: "footer.delivery" },
  { href: "/returns", label: "footer.returns" },
]

// One row of the menu. Closing the panel is the Sheet's own Close, wrapped
// around a plain Link so navigation stays client-side.
function MenuLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
        className={cn(
          "flex min-h-11 items-center rounded-lg px-3 text-[15px] text-charcoal transition-colors outline-none hover:bg-subtle focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        {children}
      </Link>
    </SheetClose>
  )
}

// The phone header's ☰: a panel from the left with every category (the
// shop's own, from the database), Deals, the information pages and the
// language switch. Each link closes the panel as it navigates.
function MobileMenu({ categories }: { categories: { href: string; label: string }[] }) {
  const t = useT()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={t("nav.openMenu")}
          className="-ml-2 text-white hover:bg-white/10 hover:text-white focus-visible:ring-gold"
        >
          <Menu aria-hidden className="size-6" strokeWidth={1.75} />
        </Button>
      </SheetTrigger>
      {/* The panel is its links; there is no separate description to announce. */}
      <SheetContent side="left" aria-describedby={undefined} className="w-[min(20rem,85vw)] gap-0 overflow-y-auto bg-background p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-display text-xl font-bold text-charcoal">{t("nav.menu")}</SheetTitle>
        </SheetHeader>
        <nav aria-label={t("nav.menu")} className="space-y-1 p-3">
          <MenuLink href="/">{t("nav.home")}</MenuLink>
          {categories.map((category) => (
            <MenuLink key={category.href} href={category.href}>
              {category.label}
            </MenuLink>
          ))}
          <MenuLink href="/deals" className="font-semibold text-brand-ink">
            {t("nav.deals")}
          </MenuLink>
          <hr className="my-2 border-border" />
          {INFO_LINKS.map((link) => (
            <MenuLink key={link.href} href={link.href}>
              {t(link.label)}
            </MenuLink>
          ))}
        </nav>
        <div className="flex items-center gap-3 border-t border-border px-5 py-4">
          <span className="text-sm text-muted-text">{t("footer.language")}</span>
          <LanguageSwitcher labels="full" />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { MobileMenu }
