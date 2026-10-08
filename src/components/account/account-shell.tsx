"use client"

import type { ReactNode } from "react"

import { AccountNav } from "@/components/account/account-nav"

// Desktop: the account menu as a sidebar beside the page. Phones: the menu is
// the /account screen itself and the other account pages open without it
// (see AccountNav), each with its own back bar.
function AccountShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6 py-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0 lg:py-8">
      <AccountNav />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export { AccountShell }
