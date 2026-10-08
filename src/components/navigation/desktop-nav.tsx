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
// (Home, the shop's own categories from the database, Deals) — this only adds
// the "you are here" state, which needs the current path: burgundy ink with a
// 2px underline.
function DesktopNav({ links }: { links: NavLink[] }) {
  const t = useT()
  const pathname = usePathname()

  return (
    <nav aria-label={t("nav.primary")} className="flex h-10 items-center gap-7 xl:gap-8">
      {links.map((link) => {
        const active = isActivePath(pathname, link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-full items-center text-[13px] font-medium whitespace-nowrap transition-colors outline-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors focus-visible:text-brand-ink focus-visible:after:bg-brand",
              active
                ? "font-semibold text-brand-ink after:bg-brand"
                : "text-charcoal after:bg-transparent hover:text-brand-ink hover:after:bg-brand/30"
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
