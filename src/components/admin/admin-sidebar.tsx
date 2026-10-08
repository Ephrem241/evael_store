"use client"

import Link from "next/link"
import { ChevronDown, LogOut, Store, UserCog, X } from "lucide-react"
import { cn } from "cn"

import { BRAND_NAME } from "@/lib/brand"
import { useT } from "@/lib/i18n/provider"
import { initialsOf } from "@/lib/admin/initials"
import type { AuthUser } from "@/lib/store/auth"
import { AdminNav, type AdminNavProps } from "@/components/admin/admin-nav"
import { BrandMark, Logo } from "@/components/layout/logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground"
    >
      {initialsOf(name)}
    </span>
  )
}

// The signed-in admin's menu: their email, the shop, and their own account
// settings (name, password).
function UserMenuContent({ user, side }: { user: AuthUser; side: "top" | "right" }) {
  const t = useT()
  return (
    <DropdownMenuContent side={side} align="end" className="w-60">
      <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/">
          <Store aria-hidden />
          {t("admin.shell.viewStore")}
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/account/settings">
          <UserCog aria-hidden />
          {t("admin.shell.accountSettings")}
        </Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}

// The dark sidebar (spec section 4.1): the logo and tagline, the menu
// (scrolling on its own when it is long), then the signed-in admin and Log
// out pinned to the bottom. `rail` is the tablet's 64px icon column. Inside
// the phone's drawer (`onClose` given) it is a plain panel with a close
// button; the drawer itself is the dialog that names it.
function AdminSidebar({
  variant = "full",
  user,
  nav,
  onSignOut,
  onClose,
  className,
}: {
  variant?: "full" | "rail"
  user: AuthUser
  nav: AdminNavProps
  onSignOut: () => void
  onClose?: () => void
  className?: string
}) {
  const t = useT()
  const rail = variant === "rail"
  const Root = onClose ? "div" : "aside"

  return (
    <Root
      aria-label={onClose ? undefined : t("admin.shell.sidebarLabel")}
      className={cn("flex h-full flex-col bg-sidebar text-sidebar-foreground", className)}
    >
      {rail ? (
        <div className="flex justify-center pt-5 pb-4">
          <Link href="/admin" aria-label={BRAND_NAME} className={cn("rounded-lg", focusRing)}>
            <BrandMark inverse className="size-10" />
          </Link>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2 px-5 pt-6 pb-5">
          <div className="min-w-0 space-y-2">
            <Logo variant="light" href="/admin" />
            <p className="text-[10px] leading-tight text-sidebar-foreground/75">{t("nav.tagline")}</p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.close")}
              className={cn("-mt-1 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-sidebar-accent/60", focusRing)}
            >
              <X aria-hidden className="size-5" />
            </button>
          )}
        </div>
      )}

      <div className={cn("min-h-0 flex-1 overflow-y-auto pb-4", rail ? "px-2.5" : "px-3")}>
        <AdminNav variant={variant} {...nav} />
      </div>

      {rail ? (
        <div className="flex flex-col items-center gap-1.5 border-t border-sidebar-border px-2.5 py-3">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label={t("admin.shell.userMenu", { name: user.fullName })} className={cn("rounded-full", focusRing)}>
                    <Avatar name={user.fullName} />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">{user.fullName}</TooltipContent>
            </Tooltip>
            <UserMenuContent user={user} side="right" />
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onSignOut}
                aria-label={t("account.nav.logout")}
                className={cn("flex size-11 items-center justify-center rounded-lg hover:bg-sidebar-accent/60", focusRing)}
              >
                <LogOut aria-hidden strokeWidth={1.75} className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{t("account.nav.logout")}</TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <div className="space-y-1 border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={user.fullName} />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold">{user.fullName}</p>
              <p className="truncate text-xs text-sidebar-foreground/75">{t("admin.shell.badge")}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t("admin.shell.userMenu", { name: user.fullName })}
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/85 hover:bg-sidebar-accent/60 max-md:size-11",
                    focusRing
                  )}
                >
                  <ChevronDown aria-hidden className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <UserMenuContent user={user} side="top" />
            </DropdownMenu>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className={cn(
              "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-sidebar-accent/60",
              focusRing
            )}
          >
            <LogOut aria-hidden strokeWidth={1.75} className="size-5 shrink-0" />
            {t("account.nav.logout")}
          </button>
        </div>
      )}
    </Root>
  )
}

export { AdminSidebar }
