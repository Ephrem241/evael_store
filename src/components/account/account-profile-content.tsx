"use client"

import { CardListSkeleton } from "@/components/feedback/skeletons"
import { useRequireAuth } from "@/lib/hooks/use-require-auth"
import { AccountOverview } from "@/components/account/account-overview"

// /account on desktop: the overview (greeting, recent orders, shortcuts)
// beside the account menu. Phones show the menu itself as this screen, so the
// overview is left out there. The profile is edited under Settings.
function AccountProfileContent() {
  const { user, ready } = useRequireAuth("/login?redirect=/account")

  return (
    <div className="max-lg:hidden">
      {!ready || !user ? <CardListSkeleton rows={2} /> : <AccountOverview user={user} />}
    </div>
  )
}

export { AccountProfileContent }
