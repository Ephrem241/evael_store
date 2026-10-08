"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import { PageSkeleton } from "@/components/feedback/skeletons"
import { useT } from "@/lib/i18n/provider"
import { useRequireAdmin } from "@/lib/hooks/use-require-admin"
import { signOut } from "@/lib/services/auth"
import { useNavCounts, useOpenGroups } from "@/components/admin/admin-nav"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminTopBar } from "@/components/admin/admin-top-bar"
import { OrderAlertsWatcher } from "@/components/admin/order-alerts-watcher"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

// The single authorization gate for every /admin/* page — centralized here
// rather than per-content-component (unlike /account's pattern) because
// spec Section 58 warns "do not rely only on hiding frontend links": a gate
// that every individual admin page must remember to call is one more place
// a future admin page could simply forget it. Children never render until
// `ready`, so no admin chrome or data is ever visible even momentarily to a
// non-admin visitor.
//
// The admin area is its own app, not a page of the shop: the root layout
// leaves out the shop's bars, footer, bottom nav and <main> on /admin/* (see
// StorefrontOnly), and this draws the admin's own (EVAEL_ADMIN_REDESIGN_SPEC
// sections 4 and 8):
//  - 1024px and up: the 252px dark sidebar, fixed;
//  - 768–1023px: the same sidebar as a 64px column of icons;
//  - phones: a menu button in the top bar opens it as a drawer.
// The top bar and <main> sit to the right of the sidebar, so the skip link
// ("#main-content") jumps past both the menu and the bar.
function AdminShell({ children }: { children: ReactNode }) {
  const t = useT()
  const router = useRouter()
  const pathname = usePathname()
  const { user, ready } = useRequireAdmin()
  const counts = useNavCounts(ready)
  const [openGroups, setGroupOpen] = useOpenGroups()
  // The drawer belongs to the page it was opened on: moving to another page
  // (tapping a link in it) closes it.
  const [drawerPage, setDrawerPage] = useState<string | null>(null)
  const drawerOpen = drawerPage === pathname

  async function handleSignOut() {
    await signOut()
    toast.success(t("account.nav.loggedOut"))
    router.push("/")
  }

  if (!ready || !user) {
    return (
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <PageSkeleton />
        </div>
      </main>
    )
  }

  const nav = { counts, openGroups, onGroupOpenChange: setGroupOpen }

  return (
    <div className="min-h-dvh flex-1 bg-admin-bg md:pl-16 lg:pl-63">
      <OrderAlertsWatcher />
      <AdminSidebar user={user} nav={nav} onSignOut={handleSignOut} className="fixed inset-y-0 left-0 z-30 hidden w-63 lg:flex" />
      <AdminSidebar
        variant="rail"
        user={user}
        nav={nav}
        onSignOut={handleSignOut}
        className="fixed inset-y-0 left-0 z-30 hidden w-16 md:flex lg:hidden"
      />
      <Sheet open={drawerOpen} onOpenChange={(open) => setDrawerPage(open ? pathname : null)}>
        <SheetContent
          side="left"
          showCloseButton={false}
          aria-describedby={undefined}
          className="w-[min(17.5rem,85vw)] gap-0 border-none bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">{t("admin.nav.label")}</SheetTitle>
          <AdminSidebar user={user} nav={nav} onSignOut={handleSignOut} onClose={() => setDrawerPage(null)} />
        </SheetContent>
      </Sheet>

      <AdminTopBar onOpenMenu={() => setDrawerPage(pathname)} />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <div className="mx-auto max-w-[1680px] px-4 py-6 md:px-6">{children}</div>
      </main>
    </div>
  )
}

export { AdminShell }
