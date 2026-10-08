"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronRight,
  CircleHelp,
  Globe,
  Heart,
  Info,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import type { MessageKey } from "@/lib/i18n/translator"
import { useCurrentUser } from "@/lib/store/auth"
import { signOut } from "@/lib/services/auth"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"

type NavItem = { href: string; label: MessageKey; icon: typeof User }

// Desktop shows the overview as the first row; on phones /account IS this
// menu, so the row would lead back to the same screen and is left out there.
const OVERVIEW_ITEM: NavItem = { href: "/account", label: "account.nav.overview", icon: User }

const ACCOUNT_NAV_ITEMS: NavItem[] = [
  { href: "/account/orders", label: "account.nav.orders", icon: Package },
  { href: "/account/favorites", label: "account.nav.favorites", icon: Heart },
  { href: "/account/addresses", label: "account.nav.addresses", icon: MapPin },
  { href: "/account/settings", label: "account.nav.settings", icon: Settings },
]

// Shown to admins only: nothing else on the storefront leads to /admin.
const ADMIN_ITEM: NavItem = { href: "/admin", label: "account.nav.admin", icon: LayoutDashboard }

// The second group: help and the shop's story, both real pages.
const MORE_ITEMS: NavItem[] = [
  { href: "/contact", label: "account.nav.help", icon: CircleHelp },
  { href: "/about", label: "account.nav.about", icon: Info },
]

// Plain exact-match, not the shared isActivePath prefix-matcher: "/account"
// would prefix-match every other item here (isActivePath treats "/account"
// as a parent of "/account/orders"), which would wrongly show the overview as
// active on every subsection.
function isActive(pathname: string, href: string): boolean {
  return pathname === href
}

// A white card holding rows split by hairlines (phones); on desktop the rows
// sit in the card with a little air and the current one is tinted.
const groupClass =
  "divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-soft lg:space-y-0.5 lg:divide-y-0 lg:p-1.5"

function NavRow({ item, active, className }: { item: NavItem; active: boolean; className?: string }) {
  const t = useT()
  const Icon = item.icon
  return (
    <li className={className}>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-h-[52px] items-center gap-3 px-4 text-[15px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset lg:min-h-10 lg:rounded-(--radius-control) lg:px-3 lg:text-sm",
          active ? "bg-brand-soft font-semibold text-brand-ink" : "text-charcoal hover:bg-subtle"
        )}
      >
        <Icon
          aria-hidden
          className={cn("size-5 shrink-0 lg:size-[18px]", active ? "text-brand" : "text-charcoal/80")}
          strokeWidth={1.5}
        />
        <span className="min-w-0 flex-1">{t(item.label)}</span>
        <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-text lg:hidden" />
      </Link>
    </li>
  )
}

// The account menu. Phones see it only on /account, where it is the whole
// screen (as in the mockup): the profile row (initials avatar, name, email —
// it leads to Settings, where the profile is edited), the account rows, Help
// and About, the language row, Log out and the Addis Ababa brand card; the
// burgundy brand header steps aside there (data-hide-brand-header). Every
// other account page has its own back bar on phones instead. Desktop keeps it
// as the sidebar of every account page.
function AccountNav() {
  const t = useT()
  const pathname = usePathname()
  const user = useCurrentUser()
  const router = useRouter()
  const isMenuScreen = pathname === "/account"

  async function handleLogout() {
    await signOut()
    toast.success(t("account.nav.loggedOut"))
    router.push("/")
  }

  const items = [OVERVIEW_ITEM, ...ACCOUNT_NAV_ITEMS, ...(user?.role === "admin" ? [ADMIN_ITEM] : [])]

  return (
    <div
      data-hide-brand-header={isMenuScreen || undefined}
      className={cn("space-y-4", isMenuScreen ? "max-lg:pt-[env(safe-area-inset-top)]" : "max-lg:hidden")}
    >
      {user && (
        <Link
          href="/account/settings"
          className="flex items-center gap-4 rounded-card border border-border bg-surface p-4 shadow-soft transition-colors outline-none hover:border-brand/30 focus-visible:ring-2 focus-visible:ring-ring lg:gap-3"
        >
          {/* The first letter of the name, on the soft burgundy (no photo upload exists yet). */}
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-soft font-display text-2xl font-bold text-brand-ink uppercase lg:size-12 lg:text-xl"
          >
            {user.fullName.trim().charAt(0) || <User className="size-6" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-semibold text-charcoal">{user.fullName}</span>
            <span className="block truncate text-sm text-muted-text">{user.email}</span>
            <span className="sr-only">{t("account.nav.editProfile")}</span>
          </span>
          <ChevronRight aria-hidden className="size-5 shrink-0 text-muted-text" />
        </Link>
      )}

      <nav aria-label={t("account.nav.label")} className="space-y-4">
        <ul className={groupClass}>
          {items.map((item) => (
            <NavRow
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              className={item === OVERVIEW_ITEM ? "max-lg:hidden" : undefined}
            />
          ))}
        </ul>
        <ul className={groupClass}>
          {MORE_ITEMS.map((item) => (
            <NavRow key={item.href} item={item} active={false} />
          ))}
        </ul>
      </nav>

      {/* The header carries the language switch on desktop. */}
      <div className="flex min-h-[52px] items-center gap-3 rounded-card border border-border bg-surface py-1.5 pr-1.5 pl-4 shadow-soft lg:hidden">
        <Globe aria-hidden className="size-5 shrink-0 text-charcoal/80" strokeWidth={1.5} />
        <span className="min-w-0 flex-1 text-[15px] text-charcoal">{t("nav.language")}</span>
        <LanguageSwitcher labels="full" showIcon={false} />
      </div>

      <Button variant="outline" size="lg" className="w-full gap-2 bg-surface" onClick={handleLogout}>
        <LogOut aria-hidden className="size-4" />
        {t("account.nav.logout")}
      </Button>

      {/* The brand card under the menu (phones): the Addis Ababa skyline
          fading into cream behind the tagline and the logo. */}
      <div className="relative isolate overflow-hidden rounded-card border border-border bg-surface lg:hidden">
        <Image
          src="/images/home/addis-skyline.jpg"
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover object-[70%_60%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-r from-surface from-35% via-surface/80 to-transparent"
        />
        <div className="space-y-3 p-5 pr-[35%]">
          <p className="font-display text-xl leading-tight font-bold text-brand-deepest">{t("nav.tagline")}</p>
          <Logo />
        </div>
      </div>
    </div>
  )
}

export { AccountNav }
