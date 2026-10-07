"use client"

import Link from "next/link"
import { LayoutDashboard, User } from "lucide-react"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import { useCurrentUser } from "@/lib/store/auth"
import { Button } from "@/components/ui/button"

// `variant="stacked"` is the desktop header's icon-over-label link.
function AccountButton({
  className,
  variant = "icon",
}: {
  className?: string
  variant?: "icon" | "stacked"
}) {
  const t = useT()
  const user = useCurrentUser()
  // An admin browsing the shop gets a way back to the dashboard instead.
  const isAdmin = user?.role === "admin"
  const label = isAdmin ? t("admin.nav.dashboard") : user ? t("nav.account") : t("nav.signIn")
  const href = isAdmin ? "/admin" : user ? "/account" : "/login"
  const Icon = isAdmin ? LayoutDashboard : User

  if (variant === "stacked") {
    return (
      <Link
        href={href}
        className={cn(
          "flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-charcoal transition-colors outline-none hover:text-brand-ink focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        <Icon aria-hidden className="size-[22px]" strokeWidth={1.5} />
        <span className="text-xs leading-none">{label}</span>
      </Link>
    )
  }

  return (
    <Button variant="ghost" size="icon-lg" asChild className={className}>
      <Link href={href} aria-label={label}>
        <Icon aria-hidden className="size-[22px]" strokeWidth={1.75} />
      </Link>
    </Button>
  )
}

export { AccountButton }
