"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"

import { isActivePath } from "@/components/navigation/is-active-path"
import { useT } from "@/lib/i18n/provider"

export interface NavLink {
  href: string
  label: string
}

// The second row of the desktop header. The links are built on the server
// (Home, Shop, the shop's own categories from the database, Deals, Shop All) —
// this only adds the "you are here" state, which needs the current path.
function DesktopNav({ links }: { links: NavLink[] }) {
  const t = useT()
  const pathname = usePathname()

  return (
    <nav aria-label={t("nav.primary")} className="flex h-12 items-center gap-7 xl:gap-9">
      {links.map((link) => {
        const active = isActivePath(pathname, link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-full items-center text-sm font-medium whitespace-nowrap transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
              active
                ? "font-semibold text-brand-ink after:bg-brand"
                : "text-charcoal/85 after:bg-transparent hover:text-brand-ink hover:after:bg-brand/30"
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

export { DesktopNav }
