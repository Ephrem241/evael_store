"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, Store } from "lucide-react"
import { toast } from "sonner"
import type { ReactNode } from "react"

import { PageSkeleton } from "@/components/feedback/skeletons"
import { useT } from "@/lib/i18n/provider"
import { useRequireAdmin } from "@/lib/hooks/use-require-admin"
import { signOut } from "@/lib/services/auth"
import { AdminNav } from "@/components/admin/admin-nav"
import { Logo } from "@/components/layout/logo"
import { LanguageSwitcher } from "@/components/layout/language-switcher"

// The single authorization gate for every /admin/* page — centralized here
// rather than per-content-component (unlike /account's pattern) because
// spec Section 58 warns "do not rely only on hiding frontend links": a gate
// that every individual admin page must remember to call is one more place
// a future admin page could simply forget it. Children never render until
// `ready`, so no admin chrome or data is ever visible even momentarily to a
// non-admin visitor.
//
// The admin area is its own app, not a page of the shop: the root layout
// leaves out the shop's bars, footer and bottom nav on /admin/* (see
// StorefrontOnly), and this draws a dark sidebar on desktop and a dark top
// bar with a scrolling section strip on phones instead.
function AdminShell({ children }: { children: ReactNode }) {
  const t = useT()
  const router = useRouter()
  const { user, ready } = useRequireAdmin()

  async function handleSignOut() {
    await signOut()
    toast.success(t("account.nav.loggedOut"))
    router.push("/")
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <PageSkeleton />
      </div>
    )
  }

  const badge = (
    <span className="rounded-md bg-gold px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-forest-dark uppercase">
      {t("admin.shell.badge")}
    </span>
  )

  return (
    <div className="min-h-dvh bg-cream/40 lg:pl-64">
      {/* Desktop: fixed dark sidebar. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-forest-dark text-white lg:flex">
        <div className="flex flex-col items-start gap-3 px-5 pt-6 pb-5">
          <Logo variant="light" />
          {badge}
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          <AdminNav />
        </div>
        <div className="space-y-3 border-t border-white/10 px-5 py-5">
          {user && (
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium">{user.fullName}</p>
              <p className="truncate text-xs text-white/60">{user.email}</p>
            </div>
          )}
          <LanguageSwitcher tone="dark" />
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-white/80 transition-colors outline-none hover:bg-white/5 hover:text-white focus-visible:ring-3 focus-visible:ring-gold/60"
            >
              <Store aria-hidden className="size-4" />
              {t("admin.shell.viewStore")}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-white/80 transition-colors outline-none hover:bg-white/5 hover:text-white focus-visible:ring-3 focus-visible:ring-gold/60"
            >
              <LogOut aria-hidden className="size-4" />
              {t("account.nav.logout")}
            </button>
          </div>
        </div>
      </aside>

      {/* Phones and tablets: dark top bar plus a scrolling strip of sections. */}
      <header className="sticky top-0 z-30 bg-forest-dark text-white lg:hidden">
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Logo variant="light" />
            {badge}
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher compact tone="dark" />
            <Link
              href="/"
              aria-label={t("admin.shell.viewStore")}
              className="flex size-10 items-center justify-center rounded-lg text-white/85 outline-none hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-gold/60"
            >
              <Store aria-hidden className="size-5" />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label={t("account.nav.logout")}
              className="flex size-10 items-center justify-center rounded-lg text-white/85 outline-none hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-gold/60"
            >
              <LogOut aria-hidden className="size-5" />
            </button>
          </div>
        </div>
        <AdminNav variant="tabs" />
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">{children}</div>
    </div>
  )
}

export { AdminShell }
