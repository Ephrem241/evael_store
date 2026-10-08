"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { ChevronDown, Globe, Menu, Search, X } from "lucide-react"
import { cn } from "cn"

import { BRAND_NAME } from "@/lib/brand"
import { LOCALES, LOCALE_NAMES, isLocale } from "@/lib/i18n/config"
import { useT } from "@/lib/i18n/provider"
import { formatLongDate, storeDateKey } from "@/lib/date"
import { AdminSearch } from "@/components/admin/admin-search"
import { OrderAlertsBell } from "@/components/admin/order-alerts-bell"
import { EthiopiaFlag } from "@/components/layout/ethiopia-flag"
import { useLocaleSwitch } from "@/components/layout/language-switcher"
import { BrandMark } from "@/components/layout/logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const iconButton =
  "flex size-11 shrink-0 items-center justify-center rounded-lg text-charcoal/80 outline-none transition-colors hover:bg-card hover:text-charcoal focus-visible:ring-2 focus-visible:ring-ring"

// The language menu: the current language's short name on the button, each
// language in its own script in the menu. The Ethiopian flag marks Amharic
// only (the mockup puts it beside "EN", which would label English with it).
function AdminLanguageSelect() {
  const t = useT()
  const { choose, pending } = useLocaleSwitch()
  const current = LOCALE_NAMES[t.locale]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={pending}
          aria-label={t("admin.shell.languageLabel", { language: current.short })}
          className="flex h-10 items-center gap-1.5 rounded-[10px] border border-border bg-card px-2.5 text-sm font-medium text-charcoal outline-none transition-colors hover:border-charcoal/25 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70 max-lg:h-11"
        >
          <Globe aria-hidden className="size-4 text-muted-text" />
          <span lang={t.locale} className={cn(t.locale === "am" && "font-ethiopic-system")}>
            {current.short}
          </span>
          <ChevronDown aria-hidden className="size-4 text-muted-text" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuRadioGroup value={t.locale} onValueChange={(value) => isLocale(value) && choose(value)}>
          {LOCALES.map((locale) => (
            <DropdownMenuRadioItem
              key={locale}
              value={locale}
              lang={locale}
              className={cn(locale === "am" && "font-ethiopic-system")}
            >
              {locale === "am" ? <EthiopiaFlag className="h-3 w-[18px]" /> : <span aria-hidden className="w-[18px]" />}
              {LOCALE_NAMES[locale].native}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// The admin's top bar (spec section 4.2): 64px, sticky, on the admin's cream.
// Left, the search; right, the new-order bell, the language and today's date
// (in Addis Ababa). On phones the menu button opens the sidebar as a drawer,
// and the search is an icon that opens the field across the whole bar.
function AdminTopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const t = useT()
  const [today] = useState(() => new Date())
  const [searchOpen, setSearchOpen] = useState(false)
  const searchButton = useRef<HTMLButtonElement>(null)

  function closeSearch() {
    setSearchOpen(false)
    requestAnimationFrame(() => searchButton.current?.focus())
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-admin-bg">
      <div className="relative flex h-16 items-center gap-2 px-3 md:gap-4 md:px-6">
        <button type="button" onClick={onOpenMenu} aria-label={t("nav.openMenu")} className={cn(iconButton, "md:hidden")}>
          <Menu aria-hidden strokeWidth={1.75} className="size-6" />
        </button>
        <Link href="/admin" aria-label={BRAND_NAME} className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden">
          <BrandMark className="size-9" />
        </Link>

        <AdminSearch className="hidden max-w-155 flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <button
            ref={searchButton}
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t("admin.search.open")}
            className={cn(iconButton, "md:hidden")}
          >
            <Search aria-hidden strokeWidth={1.75} className="size-5" />
          </button>
          <OrderAlertsBell />
          <AdminLanguageSelect />
          <time dateTime={storeDateKey(today)} className="hidden pl-2 text-sm whitespace-nowrap text-charcoal lg:block">
            {formatLongDate(today, t.locale)}
          </time>
        </div>

        {searchOpen && (
          <div className="absolute inset-0 z-10 flex items-center gap-1 bg-admin-bg px-3 md:hidden">
            <AdminSearch autoFocus onDone={closeSearch} className="flex-1" />
            <button type="button" onClick={closeSearch} aria-label={t("admin.search.close")} className={iconButton}>
              <X aria-hidden className="size-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export { AdminTopBar }
