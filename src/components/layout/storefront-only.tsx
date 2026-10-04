"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { isAdminPath } from "@/lib/admin-path"
import { useIsAdmin } from "@/lib/store/auth"

// The admin area is its own app (see AdminShell): none of the shop's chrome —
// announcement bar, headers, footer, bottom nav — belongs on /admin/*. The
// root layout wraps that chrome in this, and passes the page itself as
// `fallback` so admin pages also skip the shop's content container.
function StorefrontOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const pathname = usePathname()
  return <>{isAdminPath(pathname) ? fallback : children}</>
}

// For the bits of server-rendered shop chrome that are about buying (the
// wishlist links in the headers): an admin browsing the shop doesn't get them.
function HideForAdmin({ children }: { children: ReactNode }) {
  const isAdmin = useIsAdmin()
  return isAdmin ? null : <>{children}</>
}

export { StorefrontOnly, HideForAdmin }
