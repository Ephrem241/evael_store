"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Home, Mail } from "lucide-react"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import type { MessageKey } from "@/lib/i18n/translator"
import { useUnreadMessageCount } from "@/lib/hooks/use-admin-data"
import { MESSAGES_CHANGED_EVENT } from "@/lib/services/admin-messages"

const ADMIN_NAV_ITEMS: { href: string; label: MessageKey; icon: typeof Home }[] = [
  { href: "/admin", label: "admin.nav.dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "admin.nav.products", icon: Package },
  { href: "/admin/categories", label: "admin.nav.categories", icon: FolderTree },
  { href: "/admin/orders", label: "admin.nav.orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "admin.nav.customers", icon: Users },
  { href: "/admin/messages", label: "admin.nav.messages", icon: Mail },
  { href: "/admin/homepage", label: "admin.nav.homepage", icon: Home },
]

// Dashboard ("/admin") matches only itself — it would prefix-match every
// other item. The rest also cover their sub-pages (a product's edit page
// keeps Products highlighted).
function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}

// `sidebar`: the dark desktop sidebar. `tabs`: a horizontally scrolling strip
// under the phone top bar.
function AdminNav({ variant = "sidebar" }: { variant?: "sidebar" | "tabs" }) {
  const t = useT()
  const pathname = usePathname()
  const { data: unread, reload: reloadUnread } = useUnreadMessageCount()

  // Fresh on every admin page, and whenever a message is read, answered or
  // deleted (see admin-messages.ts).
  useEffect(() => {
    reloadUnread()
  }, [pathname, reloadUnread])
  useEffect(() => {
    window.addEventListener(MESSAGES_CHANGED_EVENT, reloadUnread)
    return () => window.removeEventListener(MESSAGES_CHANGED_EVENT, reloadUnread)
  }, [reloadUnread])

  const tabs = variant === "tabs"

  return (
    <nav
      aria-label={t("admin.nav.label")}
      className={cn(tabs ? "flex gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none]" : "space-y-1")}
    >
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-gold/60",
              tabs
                ? cn(
                    "shrink-0 rounded-full px-3.5 py-2 whitespace-nowrap",
                    active ? "bg-gold font-semibold text-forest-dark" : "bg-white/10 text-white/85 hover:bg-white/15"
                  )
                : cn(
                    "rounded-xl border-l-[3px] px-3 py-2.5",
                    active
                      ? "border-gold bg-white/10 font-semibold text-white"
                      : "border-transparent text-white/75 hover:bg-white/5 hover:text-white"
                  )
            )}
          >
            <Icon aria-hidden className="size-4 shrink-0" />
            {t(item.label)}
            {item.href === "/admin/messages" && !!unread && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  tabs ? "" : "ml-auto",
                  active && tabs ? "bg-forest-dark text-white" : "bg-gold text-forest-dark"
                )}
              >
                <span aria-hidden>{unread}</span>
                <span className="sr-only"> ({t.plural("admin.messages.unreadCount", unread)})</span>
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export { AdminNav }
