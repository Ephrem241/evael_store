"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"

import { isActivePath } from "@/components/navigation/is-active-path"
import { useT } from "@/lib/i18n/provider"

export interface NavLink {
  href: string
  label: string
  /** Shown in the sale colour (Deals), as marketplaces mark their sale link. */
  highlight?: boolean
}

// The second row of the desktop header: the marketplace category bar. The
// links are built on the server (Home, New In, Deals and every one of the
// shop's categories) — this only adds the "you are here" state, which needs
// the current path: burgundy ink with a 2px underline. With more categories
// than fit, the row scrolls sideways (wheel, trackpad or keyboard focus).
function DesktopNav({ links }: { links: NavLink[] }) {
  const t = useT()
  const pathname = usePathname()

  return (
    <nav aria-label={t("nav.primary")} className="no-scrollbar flex h-10 min-w-0 items-center gap-7 overflow-x-auto xl:gap-8">
      {links.map((link) => {
        const active = isActivePath(pathname, link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-full shrink-0 items-center text-[13px] font-medium whitespace-nowrap transition-colors outline-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors focus-visible:text-brand-ink focus-visible:after:bg-brand",
              active
                ? "font-semibold text-brand-ink after:bg-brand"
                : link.highlight
                  ? "font-semibold text-sale after:bg-transparent hover:after:bg-sale/30"
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
