"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useState, type KeyboardEvent } from "react"
import { ChevronDown, House, LayoutTemplate, Mail, Package, Settings, ShoppingCart, Users, type LucideIcon } from "lucide-react"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import type { MessageKey, Translator } from "@/lib/i18n/translator"
import { useUnreadMessageCount } from "@/lib/hooks/use-admin-data"
import { MESSAGES_CHANGED_EVENT } from "@/lib/services/admin-messages"
import { useOrderAlertsStore } from "@/lib/store/order-alerts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Counter = "messages" | "orders"
type Matcher = (pathname: string) => boolean

interface NavLinkEntry {
  kind: "link"
  href: string
  label: MessageKey
  icon: LucideIcon
  counter?: Counter
  matches?: Matcher
}

interface NavGroupEntry {
  kind: "group"
  id: string
  label: MessageKey
  icon: LucideIcon
  items: { href: string; label: MessageKey; matches?: Matcher }[]
}

// The admin menu, in the spec's order (section 4.1). Only pages that exist
// are listed: Flash Deals and the other mockup-only items join when they are
// built.
const ADMIN_NAV: (NavLinkEntry | NavGroupEntry)[] = [
  { kind: "link", href: "/admin", label: "admin.nav.dashboard", icon: House, matches: (p) => p === "/admin" },
  {
    kind: "group",
    id: "products",
    label: "admin.nav.products",
    icon: Package,
    items: [
      // A product's edit page keeps All Products lit; Add Product has its own row.
      {
        href: "/admin/products",
        label: "admin.nav.allProducts",
        matches: (p) => p === "/admin/products" || /^\/admin\/products\/[^/]+\/edit$/.test(p),
      },
      { href: "/admin/products/new", label: "admin.nav.addProduct" },
      { href: "/admin/categories", label: "admin.nav.categories" },
    ],
  },
  { kind: "link", href: "/admin/orders", label: "admin.nav.orders", icon: ShoppingCart, counter: "orders" },
  { kind: "link", href: "/admin/customers", label: "admin.nav.customers", icon: Users },
  { kind: "link", href: "/admin/messages", label: "admin.nav.messages", icon: Mail, counter: "messages" },
  { kind: "link", href: "/admin/homepage", label: "admin.nav.homepage", icon: LayoutTemplate },
  { kind: "link", href: "/admin/settings", label: "admin.nav.settings", icon: Settings },
]

// A row covers its own page and the pages under it (an order's page keeps
// Orders lit), unless it says otherwise.
function isActive(pathname: string, item: { href: string; matches?: Matcher }): boolean {
  return item.matches ? item.matches(pathname) : pathname === item.href || pathname.startsWith(`${item.href}/`)
}

// ---------------------------------------------------------------------------
// State the shell keeps once for every copy of the menu (the sidebar, the
// tablet's icon rail and the phone's drawer)
// ---------------------------------------------------------------------------

export type NavCounts = Record<Counter, number>

// Unread messages and new orders. Fresh on every admin page, and whenever a
// message is read, answered or deleted (see admin-messages.ts). Nothing is
// asked for until `enabled` (the visitor is confirmed as an admin).
export function useNavCounts(enabled: boolean): NavCounts {
  const pathname = usePathname()
  const { data: unread, reload } = useUnreadMessageCount(enabled)
  const unseenOrders = useOrderAlertsStore((s) => s.unseen.length)

  useEffect(() => {
    reload()
  }, [pathname, reload])
  useEffect(() => {
    window.addEventListener(MESSAGES_CHANGED_EVENT, reload)
    return () => window.removeEventListener(MESSAGES_CHANGED_EVENT, reload)
  }, [reload])

  return { messages: unread ?? 0, orders: unseenOrders }
}

const OPEN_GROUPS_KEY = "evael-admin-nav-open"

function readOpenGroups(): Record<string, boolean> {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(OPEN_GROUPS_KEY) ?? "{}")
    return stored && typeof stored === "object" ? (stored as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

// Which groups are open, remembered in this browser. A group nobody has
// opened or closed yet starts open while one of its pages is showing.
export function useOpenGroups(): [Record<string, boolean>, (id: string, open: boolean) => void] {
  const [openGroups, setOpenGroups] = useState(readOpenGroups)

  function setGroupOpen(id: string, open: boolean) {
    const next = { ...openGroups, [id]: open }
    setOpenGroups(next)
    try {
      localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify(next))
    } catch {
      // Private mode or storage switched off: it just isn't remembered.
    }
  }

  return [openGroups, setGroupOpen]
}

function countLabel(t: Translator, counter: Counter, count: number): string {
  return counter === "messages" ? t.plural("admin.messages.unreadCount", count) : t.plural("admin.orderAlerts.unseenCount", count)
}

// ---------------------------------------------------------------------------
// Keyboard: the arrows move between the rows (Tab still works as usual);
// on a group, Right opens it and Left closes it; Left on one of its pages
// goes back up to the group.
// ---------------------------------------------------------------------------

function moveBetweenRows(event: KeyboardEvent<HTMLElement>) {
  if (event.defaultPrevented) return
  const rows = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-nav-row]")).filter(
    (row) => row.getClientRects().length > 0
  )
  const at = rows.indexOf(document.activeElement as HTMLElement)
  if (at === -1) return
  const target =
    event.key === "ArrowDown" ? (at + 1) % rows.length
    : event.key === "ArrowUp" ? (at - 1 + rows.length) % rows.length
    : event.key === "Home" ? 0
    : event.key === "End" ? rows.length - 1
    : null
  if (target === null) return
  event.preventDefault()
  rows[target].focus()
}

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"

export interface AdminNavProps {
  counts: NavCounts
  openGroups: Record<string, boolean>
  onGroupOpenChange: (id: string, open: boolean) => void
}

// `full`: the 252px sidebar (and the phone drawer). `rail`: the tablet's 64px
// column of icons, each with a tooltip; a group there opens a small menu.
function AdminNav({ variant = "full", ...props }: AdminNavProps & { variant?: "full" | "rail" }) {
  const t = useT()

  return (
    <nav aria-label={t("admin.nav.label")} onKeyDown={moveBetweenRows}>
      <ul className={cn("flex flex-col", variant === "rail" ? "items-center gap-1.5" : "gap-1")}>
        {ADMIN_NAV.map((entry) => (
          <li key={entry.kind === "link" ? entry.href : entry.id} className={variant === "rail" ? undefined : "w-full"}>
            {variant === "rail" ? <RailEntry entry={entry} counts={props.counts} /> : <FullEntry entry={entry} {...props} />}
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Full sidebar rows: 44px, 20px icon, 14px label. The page you are on has the
// lighter burgundy behind it, a semibold label and a filled icon.
// ---------------------------------------------------------------------------

const rowClass = cn(
  "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60",
  focusRing
)
const activeRowClass = "bg-sidebar-accent font-semibold text-sidebar-accent-foreground hover:bg-sidebar-accent"

function RowIcon({ icon: Icon, filled }: { icon: LucideIcon; filled: boolean }) {
  return (
    <Icon
      aria-hidden
      strokeWidth={1.75}
      fill={filled ? "currentColor" : "none"}
      fillOpacity={filled ? 0.25 : undefined}
      className="size-5 shrink-0"
    />
  )
}

function CountPill({ count, label }: { count: number; label: string }) {
  return (
    <span className="ml-auto rounded-full bg-sidebar-primary px-2 py-0.5 text-[11px] font-bold text-sidebar-primary-foreground tabular-nums">
      <span aria-hidden>{count > 99 ? "99+" : count}</span>
      <span className="sr-only"> ({label})</span>
    </span>
  )
}

function FullEntry({ entry, counts, openGroups, onGroupOpenChange }: AdminNavProps & { entry: NavLinkEntry | NavGroupEntry }) {
  const t = useT()
  const pathname = usePathname()
  const id = useId()

  if (entry.kind === "link") {
    const active = isActive(pathname, entry)
    const count = entry.counter ? counts[entry.counter] : 0
    return (
      <Link
        href={entry.href}
        data-nav-row
        aria-current={active ? "page" : undefined}
        className={cn(rowClass, active && activeRowClass)}
      >
        <RowIcon icon={entry.icon} filled={active} />
        {t(entry.label)}
        {entry.counter && count > 0 && <CountPill count={count} label={countLabel(t, entry.counter, count)} />}
      </Link>
    )
  }

  const holdsActive = entry.items.some((item) => isActive(pathname, item))
  const open = openGroups[entry.id] ?? holdsActive
  const buttonId = `${id}-button`
  const listId = `${id}-list`

  return (
    <>
      <button
        type="button"
        id={buttonId}
        data-nav-row
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => onGroupOpenChange(entry.id, !open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" && !open) {
            event.preventDefault()
            onGroupOpenChange(entry.id, true)
          } else if (event.key === "ArrowLeft" && open) {
            event.preventDefault()
            onGroupOpenChange(entry.id, false)
          }
        }}
        className={cn(rowClass, holdsActive && "font-semibold")}
      >
        <RowIcon icon={entry.icon} filled={holdsActive} />
        {t(entry.label)}
        <ChevronDown aria-hidden className={cn("ml-auto size-4 shrink-0 opacity-80 transition-transform", open && "rotate-180")} />
      </button>
      {/* Indented 44px, with a thin guide line under the group's icon. */}
      <ul
        id={listId}
        hidden={!open}
        className="relative mt-1 space-y-0.5 pl-11 before:absolute before:inset-y-1 before:left-[1.375rem] before:w-px before:bg-sidebar-foreground/20"
      >
        {entry.items.map((item) => {
          const active = isActive(pathname, item)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                data-nav-row
                aria-current={active ? "page" : undefined}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft") {
                    event.preventDefault()
                    document.getElementById(buttonId)?.focus()
                  }
                }}
                className={cn(
                  "flex h-9 items-center rounded-lg px-3 text-[13px] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground max-md:h-11",
                  focusRing,
                  active && "bg-sidebar-accent font-semibold text-sidebar-accent-foreground hover:bg-sidebar-accent"
                )}
              >
                {t(item.label)}
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}

// ---------------------------------------------------------------------------
// Icon rail (768–1023px): 44px squares. The label is the link's name and its
// tooltip; a count shows as a small gold badge on the icon.
// ---------------------------------------------------------------------------

const railClass = cn(
  "relative flex size-11 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60",
  focusRing
)

function RailEntry({ entry, counts }: { entry: NavLinkEntry | NavGroupEntry; counts: NavCounts }) {
  const t = useT()
  const pathname = usePathname()
  const label = t(entry.label)

  if (entry.kind === "link") {
    const active = isActive(pathname, entry)
    const count = entry.counter ? counts[entry.counter] : 0
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={entry.href}
            data-nav-row
            aria-current={active ? "page" : undefined}
            aria-label={entry.counter && count > 0 ? `${label} (${countLabel(t, entry.counter, count)})` : label}
            className={cn(railClass, active && "bg-sidebar-accent hover:bg-sidebar-accent")}
          >
            <RowIcon icon={entry.icon} filled={active} />
            {count > 0 && (
              <span
                aria-hidden
                className="absolute -top-1 -right-1 min-w-4.5 rounded-full bg-sidebar-primary px-1 text-center text-[10px] leading-4.5 font-bold text-sidebar-primary-foreground"
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  const holdsActive = entry.items.some((item) => isActive(pathname, item))
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-nav-row
              aria-label={label}
              className={cn(railClass, holdsActive && "bg-sidebar-accent hover:bg-sidebar-accent")}
            >
              <RowIcon icon={entry.icon} filled={holdsActive} />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent side="right" align="start" className="w-52">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {entry.items.map((item) => {
          const active = isActive(pathname, item)
          return (
            <DropdownMenuItem key={item.href} asChild className={cn(active && "font-semibold text-brand-ink")}>
              <Link href={item.href} aria-current={active ? "page" : undefined}>
                {t(item.label)}
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { AdminNav }
